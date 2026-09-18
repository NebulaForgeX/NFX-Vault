package system

import "nfxvault/pkgs/errx"

const (
	CodeSystemState          = "SYSTEM_STATE"
	CodeSystemStateNotFound  = "SYSTEM_STATE_NOT_FOUND"
	CodeSystemAlreadyInit    = "SYSTEM_ALREADY_INITIALIZED"
	CodeSystemNotInitialized = "SYSTEM_NOT_INITIALIZED"
)

var (
	ErrSystemState         = errx.Internal(CodeSystemState, "system state operation failed")
	ErrSystemStateNotFound = errx.NotFound(CodeSystemStateNotFound, "system state not found")
	ErrAlreadyInitialized  = errx.Conflict(CodeSystemAlreadyInit, "system already initialized")
	ErrNotInitialized      = errx.FailedPrecond(CodeSystemNotInitialized, "system not initialized")
)

/*
!SYSTEM_STATE
*en<system state operation failed>
*zh<系统状态操作失败>
*fr<échec de l'opération d'état système>

!SYSTEM_STATE_NOT_FOUND
*en<system state not found>
*zh<系统状态不存在>
*fr<état du système introuvable>

!SYSTEM_ALREADY_INITIALIZED
*en<system already initialized>
*zh<系统已初始化>
*fr<système déjà initialisé>

!SYSTEM_NOT_INITIALIZED
*en<system not initialized>
*zh<系统未初始化>
*fr<système non initialisé>
*/
