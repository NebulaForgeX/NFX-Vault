package certificate

import (
	"context"
	"errors"

	"nfxvault/modules/tls/infrastructure/rdb/views"
	certQuery "nfxvault/modules/tls/query/certificate"

	"gorm.io/gorm"
)

type handler struct{ db *gorm.DB }

func NewQuery(db *gorm.DB) *certQuery.Query { return &certQuery.Query{List: &handler{db: db}} }

func toVO(r views.TlsCertificatesActiveView) certQuery.CertificateVO {
	return certQuery.CertificateVO{
		ID: r.ID, AccountID: r.AccountID, ProfileID: r.ProfileID, Domain: r.Domain, FolderName: r.FolderName,
		Status: r.Status, Email: r.Email, Certificate: r.Certificate, PrivateKey: r.PrivateKey, SANs: r.SANs,
		Issuer: r.Issuer, NotBefore: r.NotBefore, NotAfter: r.NotAfter, IsValid: r.IsValid, DaysRemaining: r.DaysRemaining,
		SANsChanged: r.SANsChanged, LastErrorMessage: r.LastErrorMessage, LastErrorTime: r.LastErrorTime,
		CreatedAt: r.CreatedAt, UpdatedAt: r.UpdatedAt,
	}
}

func (h *handler) Page(ctx context.Context, keyword string, offset, limit int, stripSecrets bool) ([]certQuery.CertificateVO, int64, error) {
	q := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName())
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("domain ILIKE ? OR folder_name ILIKE ? OR email ILIKE ?", like, like, like)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []views.TlsCertificatesActiveView
	if err := q.Order("updated_at desc").Offset(offset).Limit(limit).Find(&rows).Error; err != nil {
		return nil, 0, err
	}
	out := make([]certQuery.CertificateVO, 0, len(rows))
	for _, r := range rows {
		vo := toVO(r)
		if stripSecrets {
			vo.Certificate = nil
			vo.PrivateKey = nil
		}
		out = append(out, vo)
	}
	return out, total, nil
}

func (h *handler) ByID(ctx context.Context, id string) (*certQuery.CertificateVO, error) {
	var row views.TlsCertificatesActiveView
	if err := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName()).Where("id = ?", id).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	vo := toVO(row)
	return &vo, nil
}

func (h *handler) ByDomain(ctx context.Context, domain string) (*certQuery.CertificateVO, error) {
	var row views.TlsCertificatesActiveView
	if err := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName()).Where("domain = ?", domain).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	vo := toVO(row)
	return &vo, nil
}

func (h *handler) All(ctx context.Context) ([]certQuery.CertificateVO, error) {
	var rows []views.TlsCertificatesActiveView
	if err := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName()).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]certQuery.CertificateVO, 0, len(rows))
	for _, r := range rows {
		out = append(out, toVO(r))
	}
	return out, nil
}
