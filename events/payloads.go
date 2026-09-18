package events

import "nfxvault/pkgs/kafkax/eventbus"

const (
	EventOperationRefresh     eventbus.EventType = "operation.refresh"
	EventCacheInvalidate      eventbus.EventType = "cache.invalidate"
	EventParseCertificate     eventbus.EventType = "certificate.parse"
	EventDeleteFolder         eventbus.EventType = "folder.delete"
	EventDeleteFileOrFolder   eventbus.EventType = "file_or_folder.delete"
	EventExportCertificate    eventbus.EventType = "certificate.export"
)

type DiskRefreshEvent struct {
	CertTopic
	Store   string `json:"store,omitempty"`
	Trigger string `json:"trigger,omitempty"`
}

func (DiskRefreshEvent) EventType() eventbus.EventType { return EventOperationRefresh }

type CacheInvalidateEvent struct {
	CertTopic
	ID string `json:"id,omitempty"`
}

func (CacheInvalidateEvent) EventType() eventbus.EventType { return EventCacheInvalidate }

type ParseCertificateEvent struct {
	CertTopic
	ID string `json:"id"`
}

func (ParseCertificateEvent) EventType() eventbus.EventType { return EventParseCertificate }

type DeleteFolderEvent struct {
	FileTopic
	AccountID  string `json:"account_id,omitempty"`
	Store      string `json:"store,omitempty"`
	FolderName string `json:"folder_name,omitempty"`
	Path       string `json:"path,omitempty"`
}

func (DeleteFolderEvent) EventType() eventbus.EventType { return EventDeleteFolder }

type DeleteFileOrFolderEvent struct {
	FileTopic
	AccountID string `json:"account_id,omitempty"`
	Store     string `json:"store,omitempty"`
	Path      string `json:"path,omitempty"`
	ItemType  string `json:"item_type,omitempty"`
}

func (DeleteFileOrFolderEvent) EventType() eventbus.EventType { return EventDeleteFileOrFolder }

type ExportCertificateEvent struct {
	FileTopic
	AccountID string `json:"account_id,omitempty"`
	ID        string `json:"id"`
}

func (ExportCertificateEvent) EventType() eventbus.EventType { return EventExportCertificate }
