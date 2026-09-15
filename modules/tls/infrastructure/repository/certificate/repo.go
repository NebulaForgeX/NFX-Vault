package certificate

import (
	"context"

	"nfxvault/modules/tls/domain/certificate"
	"nfxvault/modules/tls/infrastructure/rdb/models"

	"gorm.io/gorm"
)

func NewRepo(db *gorm.DB) *certificate.Repo {
	return &certificate.Repo{
		Create: &createH{db: db},
		Get:    &getH{db: db},
		Update: &updateH{db: db},
		Delete: &deleteH{db: db},
	}
}

func toModel(c *certificate.Certificate) *models.Certificate {
	st := c.State()
	return &models.Certificate{
		ID: st.ID, AccountID: st.AccountID, ProfileID: st.ProfileID, Domain: st.Domain, FolderName: st.FolderName,
		Status: st.Status, Email: st.Email, Certificate: st.CertPEM, PrivateKey: st.KeyPEM, SANs: st.SANs,
		Issuer: st.Issuer, NotBefore: st.NotBefore, NotAfter: st.NotAfter, IsValid: st.IsValid, DaysRemaining: st.DaysRemaining,
		SANsChanged: st.SANsChanged, LastErrorMessage: st.LastErrorMessage, LastErrorTime: st.LastErrorTime,
		CreatedAt: st.CreatedAt, UpdatedAt: st.UpdatedAt,
	}
}

func toDomain(m *models.Certificate) *certificate.Certificate {
	return certificate.NewFromState(certificate.State{
		ID: m.ID, AccountID: m.AccountID, ProfileID: m.ProfileID, Domain: m.Domain, FolderName: m.FolderName,
		Status: m.Status, Email: m.Email, CertPEM: m.Certificate, KeyPEM: m.PrivateKey, SANs: m.SANs,
		Issuer: m.Issuer, NotBefore: m.NotBefore, NotAfter: m.NotAfter, IsValid: m.IsValid, DaysRemaining: m.DaysRemaining,
		SANsChanged: m.SANsChanged, LastErrorMessage: m.LastErrorMessage, LastErrorTime: m.LastErrorTime,
		CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt,
	})
}

type createH struct{ db *gorm.DB }

func (h *createH) New(ctx context.Context, c *certificate.Certificate) error {
	return h.db.WithContext(ctx).Create(toModel(c)).Error
}

func (h *createH) FirstOrCreateByDomain(ctx context.Context, c *certificate.Certificate) error {
	m := toModel(c)
	if err := h.db.WithContext(ctx).Where("domain = ?", c.State().Domain).Attrs(m).FirstOrCreate(m).Error; err != nil {
		return err
	}
	c.Load(toDomain(m).State())
	return nil
}

type getH struct{ db *gorm.DB }

func (h *getH) ByID(ctx context.Context, id string) (*certificate.Certificate, error) {
	var m models.Certificate
	if err := h.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return toDomain(&m), nil
}

func (h *getH) ByDomain(ctx context.Context, domain string) (*certificate.Certificate, error) {
	var m models.Certificate
	if err := h.db.WithContext(ctx).First(&m, "domain = ?", domain).Error; err != nil {
		return nil, err
	}
	return toDomain(&m), nil
}

func (h *getH) All(ctx context.Context) ([]*certificate.Certificate, error) {
	var rows []models.Certificate
	if err := h.db.WithContext(ctx).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]*certificate.Certificate, 0, len(rows))
	for i := range rows {
		out = append(out, toDomain(&rows[i]))
	}
	return out, nil
}

type updateH struct{ db *gorm.DB }

func (h *updateH) Generic(ctx context.Context, c *certificate.Certificate) error {
	return h.db.WithContext(ctx).Save(toModel(c)).Error
}

func (h *updateH) Fields(ctx context.Context, id string, fields map[string]any) error {
	return h.db.WithContext(ctx).Model(&models.Certificate{}).Where("id = ?", id).Updates(fields).Error
}

type deleteH struct{ db *gorm.DB }

func (h *deleteH) ByID(ctx context.Context, id string) (int64, error) {
	res := h.db.WithContext(ctx).Delete(&models.Certificate{}, "id = ?", id)
	return res.RowsAffected, res.Error
}
