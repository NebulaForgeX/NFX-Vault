package models

import (
	"time"

	"github.com/google/uuid"
)

type NamecheapCredential struct {
	ID               uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	AccountID        uuid.UUID  `gorm:"column:account_id;type:uuid"`
	ProfileID        *uuid.UUID `gorm:"column:profile_id;type:uuid"`
	APIUser          string     `gorm:"column:api_user"`
	UserName         string     `gorm:"column:user_name"`
	APIKey           string     `gorm:"column:api_key"`
	ClientIP         string     `gorm:"column:client_ip"`
	Sandbox          bool       `gorm:"column:sandbox"`
	LastVerifiedAt   *time.Time `gorm:"column:last_verified_at"`
	LastErrorMessage *string    `gorm:"column:last_error_message"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
}

func (NamecheapCredential) TableName() string { return "dns.namecheap_credentials" }

type NamecheapDdnsHost struct {
	ID               uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	AccountID        uuid.UUID  `gorm:"column:account_id;type:uuid"`
	ProfileID        *uuid.UUID `gorm:"column:profile_id;type:uuid"`
	CredentialID     *uuid.UUID `gorm:"column:credential_id;type:uuid"`
	Domain           string     `gorm:"column:domain"`
	Host             string     `gorm:"column:host"`
	DDNSPassword     string     `gorm:"column:ddns_password"`
	LastIPv4         *string    `gorm:"column:last_ipv4"`
	LastSyncedAt     *time.Time `gorm:"column:last_synced_at"`
	LastErrorMessage *string    `gorm:"column:last_error_message"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
}

func (NamecheapDdnsHost) TableName() string { return "dns.namecheap_ddns_hosts" }
