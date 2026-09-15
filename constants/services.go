package constants

const (
	ServiceTLS      = "tls"
	ServiceFile     = "file"
	ServiceAnalysis = "analysis"
	ServiceSystem   = "system"
)

func AllServices() []string {
	return []string{
		ServiceTLS,
		ServiceFile,
		ServiceAnalysis,
		ServiceSystem,
	}
}
