package file

import "nfxvault/pkgs/errx"

const (
	CodeFileNotFound = "FILE_NOT_FOUND"
	CodeInvalidPath  = "INVALID_PATH"
)

var (
	ErrFileNotFound = errx.NotFound(CodeFileNotFound, "file not found")
	ErrInvalidPath  = errx.InvalidArg(CodeInvalidPath, "path is required")
)

/*
!FILE_NOT_FOUND
*en<file not found>
*zh<文件不存在>
*fr<fichier introuvable>

!INVALID_PATH
*en<path is required>
*zh<路径不能为空>
*fr<le chemin est requis>
*/
