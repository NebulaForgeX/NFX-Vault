package events

import "nfxvault/pkgs/kafkax/eventbus"

const (
	TKCert    eventbus.TopicKey = "cert"
	TKCertDLQ eventbus.TopicKey = "cert_poison"

	TKFile    eventbus.TopicKey = "file"
	TKFileDLQ eventbus.TopicKey = "file_poison"

	TKAnalysis    eventbus.TopicKey = "analysis"
	TKAnalysisDLQ eventbus.TopicKey = "analysis_poison"

	TKSystem    eventbus.TopicKey = "system"
	TKSystemDLQ eventbus.TopicKey = "system_poison"

	TKDNS    eventbus.TopicKey = "dns"
	TKDNSDLQ eventbus.TopicKey = "dns_poison"
)

type CertTopic struct{}

func (CertTopic) TopicKey() eventbus.TopicKey { return TKCert }

type FileTopic struct{}

func (FileTopic) TopicKey() eventbus.TopicKey { return TKFile }

type AnalysisTopic struct{}

func (AnalysisTopic) TopicKey() eventbus.TopicKey { return TKAnalysis }

type SystemTopic struct{}

func (SystemTopic) TopicKey() eventbus.TopicKey { return TKSystem }

type DNSTopic struct{}

func (DNSTopic) TopicKey() eventbus.TopicKey { return TKDNS }
