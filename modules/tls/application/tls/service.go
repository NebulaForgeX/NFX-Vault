package tlsapp

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	tlsErr "nfxvault/errors/src/tls"
	"nfxvault/events"
	certDomain "nfxvault/modules/tls/domain/certificate"
	"nfxvault/modules/tls/infrastructure/certbot"
	"nfxvault/modules/tls/infrastructure/disk"
	pemx "nfxvault/modules/tls/infrastructure/pem"
	repofactory "nfxvault/modules/tls/infrastructure/repository/factory"
	certQuery "nfxvault/modules/tls/query/certificate"
	"nfxvault/pkgs/cachex"
	"nfxvault/pkgs/kafkax/eventbus"
	"nfxvault/pkgs/transaction"

	"github.com/google/uuid"
)

type Service struct {
	tx          transaction.TxManager
	repoFactory *repofactory.TxRepoFactory
	query       *certQuery.Query
	cache       *cachex.Connection
	bus         *eventbus.BusPublisher
	certbot     *certbot.Client
	baseDir     string
}

func NewService(
	tx transaction.TxManager,
	repoFactory *repofactory.TxRepoFactory,
	query *certQuery.Query,
	cache *cachex.Connection,
	bus *eventbus.BusPublisher,
	bot *certbot.Client,
	baseDir string,
) *Service {
	return &Service{tx: tx, repoFactory: repoFactory, query: query, cache: cache, bus: bus, certbot: bot, baseDir: baseDir}
}

type Certificate = certQuery.CertificateVO

type ListResult struct {
	Items []Certificate `json:"items"`
	Total int64         `json:"total"`
}

type CommandResult struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	CertificateID string `json:"certificate_id,omitempty"`
	Status        string `json:"status,omitempty"`
	Processed     int    `json:"processed,omitempty"`
}

type ParsePreviewResult struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    *pemx.CertInfo `json:"data,omitempty"`
}

func owned(row *Certificate, accountID string) bool {
	return row != nil && accountID != "" && row.AccountID != nil && *row.AccountID == accountID
}

func (s *Service) List(ctx context.Context, accountID string, offset, limit int) (ListResult, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, total, err := s.query.List.Page(ctx, accountID, "", offset, limit, true)
	if err != nil {
		return ListResult{}, err
	}
	return ListResult{Items: rows, Total: total}, nil
}

func (s *Service) Detail(ctx context.Context, accountID, id string) (*Certificate, error) {
	row, err := s.query.List.ByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if !owned(row, accountID) {
		return nil, tlsErr.ErrCertificateNotFound
	}
	return row, nil
}

func (s *Service) Apply(ctx context.Context, accountID, profileID, domain, email string, sans []string, folderName string, force bool) CommandResult {
	domain = strings.TrimSpace(domain)
	email = strings.TrimSpace(email)
	if domain == "" || email == "" {
		return CommandResult{Success: false, Message: "domain 与 email 不能为空"}
	}
	existing, err := s.query.List.ByDomain(ctx, domain)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	if existing != nil {
		if existing.AccountID != nil && *existing.AccountID != accountID {
			return CommandResult{Success: false, Message: "域名已存在，无法重复申请: " + domain}
		}
		if owned(existing, accountID) {
			return CommandResult{Success: false, Message: "域名已存在，无法重复申请: " + domain}
		}
		return s.runIssue(ctx, accountID, profileID, domain, email, sans, folderName, force, existing.ID)
	}
	return s.runIssue(ctx, accountID, profileID, domain, email, sans, folderName, force, "")
}

func (s *Service) Reapply(ctx context.Context, accountID, id string, force bool) CommandResult {
	row, err := s.query.List.ByID(ctx, id)
	if err != nil || !owned(row, accountID) {
		return CommandResult{Success: false, Message: "证书不存在"}
	}
	email, folder := "", ""
	if row.Email != nil {
		email = *row.Email
	}
	if row.FolderName != nil {
		folder = *row.FolderName
	}
	var sans []string
	_ = json.Unmarshal(row.SANs, &sans)
	aid, pid := "", ""
	if row.AccountID != nil {
		aid = *row.AccountID
	}
	if row.ProfileID != nil {
		pid = *row.ProfileID
	}
	return s.runIssue(ctx, aid, pid, row.Domain, email, sans, folder, force, row.ID)
}

func (s *Service) runIssue(ctx context.Context, accountID, profileID, domain, email string, sans []string, folderName string, force bool, renewID string) CommandResult {
	if s.certbot == nil {
		return CommandResult{Success: false, Message: "TLS 签发未配置或未启用"}
	}
	issued, err := s.certbot.Issue(ctx, domain, email, sans, folderName, force)
	if err != nil {
		msg := err.Error()
		if issued != nil && issued.Message != "" {
			msg = issued.Message
		}
		return CommandResult{Success: false, Message: msg}
	}
	info, err := pemx.Parse(issued.CertPEM)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	now := time.Now()
	folder := folderName
	if folder == "" {
		folder = strings.ReplaceAll(domain, ".", "_")
	}
	valid := info.IsValid
	days := info.DaysRemaining
	issuer := info.Issuer
	certPEM, keyPEM := issued.CertPEM, issued.KeyPEM
	if renewID != "" {
		updates := map[string]any{
			"certificate": certPEM, "private_key": keyPEM, "sans": pemx.SansJSON(info.AllDomains), "issuer": issuer,
			"not_before": info.NotBefore, "not_after": info.NotAfter, "is_valid": valid,
			"days_remaining": days, "status": "success", "sans_changed": false, "updated_at": now,
		}
		if accountID != "" {
			updates["account_id"] = accountID
		}
		if profileID != "" {
			updates["profile_id"] = profileID
		}
		err := s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
			certificateRepo := s.repoFactory.Certificate(uow)
			return certificateRepo.Update.Fields(ctx, renewID, updates)
		})
		if err != nil {
			return CommandResult{Success: false, Message: err.Error()}
		}
		s.publishParse(ctx, renewID)
		return CommandResult{Success: true, Message: issued.Message, CertificateID: renewID, Status: "success"}
	}
	id := uuid.NewString()
	st := certDomain.State{
		ID: id, Domain: domain, Status: "success", Email: &email, FolderName: &folder,
		CertPEM: &certPEM, KeyPEM: &keyPEM, SANs: pemx.SansJSON(info.AllDomains),
		Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days, CreatedAt: now, UpdatedAt: now,
	}
	if accountID != "" {
		st.AccountID = &accountID
	}
	if profileID != "" {
		st.ProfileID = &profileID
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		return certificateRepo.Create.New(ctx, certDomain.NewFromState(st))
	})
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	s.publishParse(ctx, id)
	return CommandResult{Success: true, Message: issued.Message, CertificateID: id, Status: "success"}
}

func (s *Service) CreateManual(ctx context.Context, accountID, profileID, domain, certificate, privateKey string, sans []string, folderName, email, issuer string) CommandResult {
	existing, err := s.query.List.ByDomain(ctx, domain)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	if existing != nil {
		return CommandResult{Success: false, Message: "Certificate already exists for domain " + domain}
	}
	info, err := pemx.Parse(certificate)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	if issuer == "" {
		issuer = info.Issuer
	}
	if len(sans) == 0 {
		sans = info.AllDomains
	}
	now := time.Now()
	valid := info.IsValid
	days := info.DaysRemaining
	id := uuid.NewString()
	st := certDomain.State{
		ID: id, Domain: domain, Status: "success",
		CertPEM: &certificate, KeyPEM: &privateKey, SANs: pemx.SansJSON(sans),
		Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days, CreatedAt: now, UpdatedAt: now,
	}
	if folderName != "" {
		st.FolderName = &folderName
	}
	if email != "" {
		st.Email = &email
	}
	if accountID != "" {
		st.AccountID = &accountID
	}
	if profileID != "" {
		st.ProfileID = &profileID
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		return certificateRepo.Create.New(ctx, certDomain.NewFromState(st))
	})
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	s.publishParse(ctx, id)
	return CommandResult{Success: true, Message: "Certificate created", CertificateID: id}
}

func (s *Service) UpdateManual(ctx context.Context, accountID, id string, sans []string, folderName, email *string) CommandResult {
	cur, err := s.query.List.ByID(ctx, id)
	if err != nil || !owned(cur, accountID) {
		return CommandResult{Success: false, Message: "Not found"}
	}
	updates := map[string]any{"updated_at": time.Now()}
	if sans != nil {
		var curSans []string
		_ = json.Unmarshal(cur.SANs, &curSans)
		updates["sans"] = pemx.SansJSON(sans)
		updates["sans_changed"] = strings.Join(curSans, ",") != strings.Join(sans, ",")
	}
	if folderName != nil {
		updates["folder_name"] = *folderName
	}
	if email != nil {
		updates["email"] = *email
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		return certificateRepo.Update.Fields(ctx, id, updates)
	})
	if err != nil {
		return CommandResult{Success: false, Message: "Failed to update certificate"}
	}
	return CommandResult{Success: true, Message: "Updated"}
}

func (s *Service) Delete(ctx context.Context, accountID, id string) CommandResult {
	cur, err := s.query.List.ByID(ctx, id)
	if err != nil || !owned(cur, accountID) {
		return CommandResult{Success: false, Message: "Not found"}
	}
	var n int64
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		var e error
		n, e = certificateRepo.Delete.ByID(ctx, id)
		return e
	})
	if err != nil || n == 0 {
		return CommandResult{Success: false, Message: "Not found"}
	}
	return CommandResult{Success: true, Message: "Deleted"}
}

func (s *Service) Search(ctx context.Context, accountID, keyword string, offset, limit int) (ListResult, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, total, err := s.query.List.Page(ctx, accountID, keyword, offset, limit, false)
	if err != nil {
		return ListResult{}, err
	}
	return ListResult{Items: rows, Total: total}, nil
}

func (s *Service) ParsePreview(pem string) ParsePreviewResult {
	info, err := pemx.Parse(pem)
	if err != nil {
		return ParsePreviewResult{Success: false, Message: err.Error()}
	}
	return ParsePreviewResult{Success: true, Message: "ok", Data: info}
}

func (s *Service) InvalidateCache(ctx context.Context) CommandResult {
	if s.cache != nil && s.cache.Client() != nil {
		_ = s.cache.Client().Del(ctx, "vault:tls:certificates").Err()
	}
	if s.bus != nil {
		_ = eventbus.PublishEvent(ctx, s.bus, events.CacheInvalidateEvent{ID: "manual"})
	}
	return CommandResult{Success: true, Message: "cache invalidated"}
}

func (s *Service) HandleCacheInvalidate(ctx context.Context, _ events.CacheInvalidateEvent) error {
	if s.cache != nil && s.cache.Client() != nil {
		return s.cache.Client().Del(ctx, "vault:tls:certificates").Err()
	}
	return nil
}

func (s *Service) HandleParseCertificate(ctx context.Context, evt events.ParseCertificateEvent) error {
	row, err := s.query.List.ByID(ctx, evt.ID)
	if err != nil || row == nil {
		return err
	}
	if row.Certificate == nil || strings.TrimSpace(*row.Certificate) == "" {
		return nil
	}
	info, err := pemx.Parse(*row.Certificate)
	if err != nil {
		return err
	}
	valid := info.IsValid
	days := info.DaysRemaining
	issuer := info.Issuer
	return s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		return certificateRepo.Update.Fields(ctx, evt.ID, map[string]any{
			"issuer": issuer, "not_before": info.NotBefore, "not_after": info.NotAfter,
			"is_valid": valid, "days_remaining": days, "sans": pemx.SansJSON(info.AllDomains), "updated_at": time.Now(),
		})
	})
}

func (s *Service) ImportFromDisk(ctx context.Context) CommandResult {
	found, err := disk.ScanWebsites(s.baseDir)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	processed := 0
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		for _, f := range found {
			cur, err := certificateRepo.Get.ByDomain(ctx, f.Info.CommonName)
			if err != nil || cur == nil {
				continue
			}
			st := cur.State()
			now := time.Now()
			valid := f.Info.IsValid
			days := f.Info.DaysRemaining
			issuer := f.Info.Issuer
			folder := f.Folder
			cert, key := f.CertPEM, f.KeyPEM
			if err := certificateRepo.Update.Fields(ctx, st.ID, map[string]any{
				"folder_name": folder, "certificate": cert, "private_key": key,
				"sans": pemx.SansJSON(f.Info.AllDomains), "issuer": issuer,
				"not_before": f.Info.NotBefore, "not_after": f.Info.NotAfter,
				"is_valid": valid, "days_remaining": days, "updated_at": now,
			}); err != nil {
				return err
			}
			processed++
		}
		return nil
	})
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	return CommandResult{Success: true, Message: fmt.Sprintf("imported %d", processed), Processed: processed}
}

func (s *Service) HandleDiskRefresh(ctx context.Context, _ events.DiskRefreshEvent) error {
	s.ImportFromDisk(ctx)
	return nil
}

func (s *Service) RefreshDaysRemaining(ctx context.Context) error {
	return s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		rows, err := certificateRepo.Get.All(ctx)
		if err != nil {
			return err
		}
		for _, row := range rows {
			st := row.State()
			if st.NotAfter == nil {
				continue
			}
			days := int(time.Until(*st.NotAfter).Hours() / 24)
			valid := days > 0
			if err := certificateRepo.Update.Fields(ctx, st.ID, map[string]any{
				"days_remaining": days, "is_valid": valid, "updated_at": time.Now(),
			}); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *Service) ACMEChallengeDir() string {
	if s.certbot != nil && s.certbot.ChallengeDir != "" {
		return s.certbot.ChallengeDir
	}
	return "./data/acme"
}

func (s *Service) publishParse(ctx context.Context, id string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.ParseCertificateEvent{ID: id})
}
