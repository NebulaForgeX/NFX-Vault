package models

import (
	"encoding/json"
	"time"
)

type Certificate struct {
	ID               string          `gorm:"column:id;type:uuid;primaryKey"`
	AccountID        *string         `gorm:"column:account_id;type:uuid"`
	ProfileID        *string         `gorm:"column:profile_id;type:uuid"`
	Domain           string          `gorm:"column:domain"`
	FolderName       *string         `gorm:"column:folder_name"`
	Status           string          `gorm:"column:status"`
	Email            *string         `gorm:"column:email"`
	Certificate      *string         `gorm:"column:certificate"`
	PrivateKey       *string         `gorm:"column:private_key"`
	SANs             json.RawMessage `gorm:"column:sans;type:jsonb"`
	Issuer           *string         `gorm:"column:issuer"`
	NotBefore        *time.Time      `gorm:"column:not_before"`
	NotAfter         *time.Time      `gorm:"column:not_after"`
	IsValid          *bool           `gorm:"column:is_valid"`
	DaysRemaining    *int            `gorm:"column:days_remaining"`
	SANsChanged      bool            `gorm:"column:sans_changed"`
	LastErrorMessage *string         `gorm:"column:last_error_message"`
	LastErrorTime    *time.Time      `gorm:"column:last_error_time"`
	CreatedAt        time.Time       `gorm:"column:created_at"`
	UpdatedAt        time.Time       `gorm:"column:updated_at"`
}

func (Certificate) TableName() string { return "vault.tls_certificates" }
