package tlsapp

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"nfxvault/events"
	"nfxvault/pkgs/cachex"
	"nfxvault/pkgs/kafkax/eventbus"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db       *gorm.DB
	cache    *cachex.Connection
	bus      *eventbus.BusPublisher
	certbot  *CertbotClient
	baseDir  string
}

func NewService(db *gorm.DB, cache *cachex.Connection, bus *eventbus.BusPublisher, certbot *CertbotClient, baseDir string) *Service {
	return &Service{db: db, cache: cache, bus: bus, certbot: certbot, baseDir: baseDir}
}

type Certificate struct {
	ID               string          `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	AccountID        *string         `gorm:"column:account_id;type:uuid" json:"account_id,omitempty"`
	ProfileID        *string         `gorm:"column:profile_id;type:uuid" json:"profile_id,omitempty"`
	Domain           string          `gorm:"column:domain" json:"domain"`
	FolderName       *string         `gorm:"column:folder_name" json:"folder_name"`
	Status           string          `gorm:"column:status" json:"status"`
	Email            *string         `gorm:"column:email" json:"email"`
	Certificate      *string         `gorm:"column:certificate" json:"certificate,omitempty"`
	PrivateKey       *string         `gorm:"column:private_key" json:"private_key,omitempty"`
	SANs             json.RawMessage `gorm:"column:sans;type:jsonb" json:"sans"`
	Issuer           *string         `gorm:"column:issuer" json:"issuer"`
	NotBefore        *time.Time      `gorm:"column:not_before" json:"not_before"`
	NotAfter         *time.Time      `gorm:"column:not_after" json:"not_after"`
	IsValid          *bool           `gorm:"column:is_valid" json:"is_valid"`
	DaysRemaining    *int            `gorm:"column:days_remaining" json:"days_remaining"`
	SANsChanged      bool            `gorm:"column:sans_changed" json:"sans_changed"`
	LastErrorMessage *string         `gorm:"column:last_error_message" json:"last_error_message"`
	LastErrorTime    *time.Time      `gorm:"column:last_error_time" json:"last_error_time"`
	CreatedAt        time.Time       `gorm:"column:created_at" json:"created_at"`
	UpdatedAt        time.Time       `gorm:"column:updated_at" json:"updated_at"`
}

func (Certificate) TableName() string { return "vault.tls_certificates" }

type ListResult struct {
	Items []Certificate `json:"items"`
	Total int64         `json:"total"`
}

func (s *Service) List(ctx context.Context, offset, limit int) (ListResult, error) {
	if limit <= 0 {
		limit = 20
	}
	var total int64
	var rows []Certificate
	q := s.db.WithContext(ctx).Model(&Certificate{})
	if err := q.Count(&total).Error; err != nil {
		return ListResult{}, err
	}
	if err := q.Order("updated_at desc").Offset(offset).Limit(limit).Find(&rows).Error; err != nil {
		return ListResult{}, err
	}
	for i := range rows {
		rows[i].Certificate = nil
		rows[i].PrivateKey = nil
	}
	return ListResult{Items: rows, Total: total}, nil
}

func (s *Service) Detail(ctx context.Context, id string) (*Certificate, error) {
	var row Certificate
	if err := s.db.WithContext(ctx).First(&row, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (s *Service) Apply(ctx context.Context, domain, email string, sans []string, folderName string, force bool) map[string]any {
	domain = strings.TrimSpace(domain)
	email = strings.TrimSpace(email)
	if domain == "" || email == "" {
		return map[string]any{"success": false, "message": "domain 与 email 不能为空"}
	}
	var existing Certificate
	if err := s.db.WithContext(ctx).First(&existing, "domain = ?", domain).Error; err == nil {
		return map[string]any{"success": false, "message": "域名已存在，无法重复申请: " + domain}
	}
	return s.runIssue(ctx, domain, email, sans, folderName, force, "")
}

func (s *Service) Reapply(ctx context.Context, id string, force bool) map[string]any {
	row, err := s.Detail(ctx, id)
	if err != nil {
		return map[string]any{"success": false, "message": "证书不存在"}
	}
	email := ""
	if row.Email != nil {
		email = *row.Email
	}
	folder := ""
	if row.FolderName != nil {
		folder = *row.FolderName
	}
	var sans []string
	_ = json.Unmarshal(row.SANs, &sans)
	return s.runIssue(ctx, row.Domain, email, sans, folder, force, row.ID)
}

func (s *Service) runIssue(ctx context.Context, domain, email string, sans []string, folderName string, force bool, renewID string) map[string]any {
	if s.certbot == nil {
		return map[string]any{"success": false, "message": "TLS 签发未配置或未启用"}
	}
	certPEM, keyPEM, msg, err := s.certbot.Issue(ctx, domain, email, sans, folderName, force)
	if err != nil {
		return map[string]any{"success": false, "message": err.Error()}
	}
	info, err := ParsePEM(certPEM)
	if err != nil {
		return map[string]any{"success": false, "message": err.Error()}
	}
	now := time.Now()
	folder := folderName
	if folder == "" {
		folder = strings.ReplaceAll(domain, ".", "_")
	}
	valid := info.IsValid
	days := info.DaysRemaining
	issuer := info.Issuer
	row := Certificate{
		Domain: domain, Status: "success", Email: &email, FolderName: &folder,
		Certificate: &certPEM, PrivateKey: &keyPEM, SANs: sansJSON(info.AllDomains),
		Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days, UpdatedAt: now,
	}
	if renewID != "" {
		row.ID = renewID
		if err := s.db.WithContext(ctx).Model(&Certificate{}).Where("id = ?", renewID).Updates(map[string]any{
			"certificate": certPEM, "private_key": keyPEM, "sans": row.SANs, "issuer": issuer,
			"not_before": info.NotBefore, "not_after": info.NotAfter, "is_valid": valid,
			"days_remaining": days, "status": "success", "sans_changed": false, "updated_at": now,
		}).Error; err != nil {
			return map[string]any{"success": false, "message": err.Error()}
		}
		s.publish("parse", renewID)
		return map[string]any{"success": true, "message": msg, "certificate_id": renewID, "status": "success"}
	}
	row.ID = uuid.NewString()
	row.CreatedAt = now
	if err := s.db.WithContext(ctx).Create(&row).Error; err != nil {
		return map[string]any{"success": false, "message": err.Error()}
	}
	s.publish("parse", row.ID)
	return map[string]any{"success": true, "message": msg, "certificate_id": row.ID, "status": "success"}
}

func (s *Service) CreateManual(ctx context.Context, domain, certificate, privateKey string, sans []string, folderName, email, issuer string) map[string]any {
	var existing Certificate
	if err := s.db.WithContext(ctx).First(&existing, "domain = ?", domain).Error; err == nil {
		return map[string]any{"success": false, "message": "Certificate already exists for domain " + domain}
	}
	info, err := ParsePEM(certificate)
	if err != nil {
		return map[string]any{"success": false, "message": err.Error()}
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
	row := Certificate{
		ID: uuid.NewString(), Domain: domain, Status: "success",
		Certificate: &certificate, PrivateKey: &privateKey, SANs: sansJSON(sans),
		Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days, CreatedAt: now, UpdatedAt: now,
	}
	if folderName != "" {
		row.FolderName = &folderName
	}
	if email != "" {
		row.Email = &email
	}
	if err := s.db.WithContext(ctx).Create(&row).Error; err != nil {
		return map[string]any{"success": false, "message": err.Error()}
	}
	s.publish("parse", row.ID)
	return map[string]any{"success": true, "message": "Certificate created", "certificate_id": row.ID}
}

func (s *Service) UpdateManual(ctx context.Context, id string, sans []string, folderName, email *string) map[string]any {
	cur, err := s.Detail(ctx, id)
	if err != nil {
		return map[string]any{"success": false, "message": "Not found"}
	}
	updates := map[string]any{"updated_at": time.Now()}
	if sans != nil {
		var curSans []string
		_ = json.Unmarshal(cur.SANs, &curSans)
		updates["sans"] = sansJSON(sans)
		updates["sans_changed"] = strings.Join(curSans, ",") != strings.Join(sans, ",")
	}
	if folderName != nil {
		updates["folder_name"] = *folderName
	}
	if email != nil {
		updates["email"] = *email
	}
	if err := s.db.WithContext(ctx).Model(&Certificate{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return map[string]any{"success": false, "message": "Failed to update certificate"}
	}
	return map[string]any{"success": true, "message": "Updated"}
}

func (s *Service) Delete(ctx context.Context, id string) map[string]any {
	res := s.db.WithContext(ctx).Delete(&Certificate{}, "id = ?", id)
	if res.Error != nil || res.RowsAffected == 0 {
		return map[string]any{"success": false, "message": "Not found"}
	}
	return map[string]any{"success": true, "message": "Deleted"}
}

func (s *Service) Search(ctx context.Context, keyword string, offset, limit int) (ListResult, error) {
	if limit <= 0 {
		limit = 20
	}
	q := s.db.WithContext(ctx).Model(&Certificate{})
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("domain ILIKE ? OR folder_name ILIKE ? OR email ILIKE ?", like, like, like)
	}
	var total int64
	var rows []Certificate
	if err := q.Count(&total).Error; err != nil {
		return ListResult{}, err
	}
	if err := q.Order("updated_at desc").Offset(offset).Limit(limit).Find(&rows).Error; err != nil {
		return ListResult{}, err
	}
	return ListResult{Items: rows, Total: total}, nil
}

func (s *Service) ParsePreview(pem string) map[string]any {
	info, err := ParsePEM(pem)
	if err != nil {
		return map[string]any{"success": false, "message": err.Error()}
	}
	return map[string]any{"success": true, "message": "ok", "data": info}
}

func (s *Service) InvalidateCache(ctx context.Context) map[string]any {
	if s.cache != nil {
		_ = s.cache
	}
	s.publish("cache_invalidate", "manual")
	return map[string]any{"success": true, "message": "cache invalidated"}
}

func (s *Service) RefreshDaysRemaining(ctx context.Context) error {
	var rows []Certificate
	if err := s.db.WithContext(ctx).Find(&rows).Error; err != nil {
		return err
	}
	for _, row := range rows {
		if row.NotAfter == nil {
			continue
		}
		days := int(time.Until(*row.NotAfter).Hours() / 24)
		valid := days > 0
		_ = s.db.WithContext(ctx).Model(&Certificate{}).Where("id = ?", row.ID).Updates(map[string]any{
			"days_remaining": days, "is_valid": valid, "updated_at": time.Now(),
		}).Error
	}
	return nil
}

func (s *Service) ACMEChallengeDir() string {
	if s.certbot != nil && s.certbot.ChallengeDir != "" {
		return s.certbot.ChallengeDir
	}
	return "./data/acme"
}

func (s *Service) publish(kind, id string) {
	if s.bus == nil {
		return
	}
	payload, _ := json.Marshal(map[string]string{"kind": kind, "id": id})
	topic := "nfxvault.cert"
	if name, ok := s.bus.GetTopic(events.TKCert); ok && name != "" {
		topic = name
	}
	_ = s.bus.Publish(topic, message.NewMessage(uuid.NewString(), payload))
}
