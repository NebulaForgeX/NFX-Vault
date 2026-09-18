package analysis

import "nfxvault/pkgs/errx"

const (
	CodeAnalysisFailed = "ANALYSIS_FAILED"
)

var (
	ErrAnalysisFailed = errx.Internal(CodeAnalysisFailed, "certificate analysis failed")
)

/*
!ANALYSIS_FAILED
*en<certificate analysis failed>
*zh<证书分析失败>
*fr<échec de l'analyse du certificat>
*/
