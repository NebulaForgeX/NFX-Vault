package commands

import "github.com/google/uuid"

type UpsertCredentialCmd struct {
	AccountID uuid.UUID
	ProfileID uuid.UUID
	APIUser   string
	UserName  string
	APIKey    string
	ClientIP  string
	Sandbox   bool
}

type DeleteCredentialCmd struct {
	AccountID uuid.UUID
}

type VerifyCredentialCmd struct {
	AccountID uuid.UUID
}
