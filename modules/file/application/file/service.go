package fileapp

import (
	"context"
	"os"
	"strings"

	"nfxvault/events"
	fsstore "nfxvault/modules/file/infrastructure/fs"
	certQuery "nfxvault/modules/tls/query/certificate"
	"nfxvault/pkgs/kafkax/eventbus"
)

type Service struct {
	certs *certQuery.Query
	fs    *fsstore.Store
	bus   *eventbus.BusPublisher
}

func NewService(certs *certQuery.Query, fs *fsstore.Store, bus *eventbus.BusPublisher) *Service {
	return &Service{certs: certs, fs: fs, bus: bus}
}

type CommandResult struct {
	Success       bool           `json:"success"`
	Message       string         `json:"message"`
	Store         string         `json:"store,omitempty"`
	Path          string         `json:"path,omitempty"`
	ItemType      string         `json:"item_type,omitempty"`
	Items         []fsstore.Entry `json:"items,omitempty"`
	Content       *string        `json:"content,omitempty"`
	Filename      *string        `json:"filename,omitempty"`
	FolderName    string         `json:"folder_name,omitempty"`
	Domain        string         `json:"domain,omitempty"`
	CertificateID string         `json:"certificate_id,omitempty"`
	Exported      int            `json:"exported,omitempty"`
}

func (s *Service) List(subpath string) CommandResult {
	store, path, items, err := s.fs.List(subpath)
	if err != nil {
		msg := "Directory not found: " + subpath
		if os.IsPermission(err) {
			msg = "Invalid path"
		}
		return CommandResult{Success: false, Message: msg, Items: []fsstore.Entry{}}
	}
	return CommandResult{Success: true, Message: "Directory listed successfully", Store: store, Path: path, Items: items}
}

func (s *Service) Content(subpath string) CommandResult {
	b, name, err := s.fs.Read(subpath)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	c, n := string(b), name
	return CommandResult{Success: true, Message: "File read successfully", Content: &c, Filename: &n}
}

func (s *Service) Download(subpath string) (content []byte, filename, mimeType string, err error) {
	return s.fs.Download(subpath)
}

func (s *Service) Delete(ctx context.Context, store, p, itemType string) CommandResult {
	if store == "" {
		store = "websites"
	}
	if strings.EqualFold(itemType, "folder") || strings.EqualFold(itemType, "dir") || strings.EqualFold(itemType, "directory") {
		s.publishDeleteFolder(ctx, store, p)
	} else {
		s.publishDeleteFile(ctx, store, p, itemType)
	}
	if err := s.fs.Delete(store, p, itemType); err != nil {
		msg := err.Error()
		if os.IsNotExist(err) {
			msg = "Path not found: " + p
		}
		return CommandResult{Success: false, Message: msg, Store: store, Path: p, ItemType: itemType}
	}
	return CommandResult{Success: true, Message: "Successfully deleted " + itemType + ": " + store + "/" + p, Store: store, Path: p, ItemType: itemType}
}

func (s *Service) HandleDeleteFolder(ctx context.Context, evt events.DeleteFolderEvent) error {
	path := evt.Path
	if path == "" {
		path = evt.FolderName
	}
	return s.fs.Delete(evt.Store, path, "folder")
}

func (s *Service) HandleDeleteFileOrFolder(ctx context.Context, evt events.DeleteFileOrFolderEvent) error {
	return s.fs.Delete(evt.Store, evt.Path, evt.ItemType)
}

func (s *Service) ExportSingle(ctx context.Context, certificateID string) CommandResult {
	row, err := s.certs.List.ByID(ctx, certificateID)
	if err != nil || row == nil {
		return CommandResult{Success: false, Message: "certificate not found", CertificateID: certificateID}
	}
	folder := row.Domain
	if row.FolderName != nil && *row.FolderName != "" {
		folder = *row.FolderName
	}
	cert, key := "", ""
	if row.Certificate != nil {
		cert = *row.Certificate
	}
	if row.PrivateKey != nil {
		key = *row.PrivateKey
	}
	if err := s.fs.WriteCertificate(folder, cert, key); err != nil {
		return CommandResult{Success: false, Message: err.Error(), CertificateID: certificateID}
	}
	s.publishExport(ctx, certificateID)
	return CommandResult{
		Success: true, Message: "Successfully exported certificate for " + row.Domain + " to websites/" + folder,
		Store: "websites", FolderName: folder, Domain: row.Domain, CertificateID: certificateID,
	}
}

func (s *Service) HandleExportCertificate(ctx context.Context, evt events.ExportCertificateEvent) error {
	s.ExportSingle(ctx, evt.ID)
	return nil
}

func (s *Service) ExportAll(ctx context.Context) CommandResult {
	rows, err := s.certs.List.All(ctx)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	n := 0
	for _, row := range rows {
		if s.ExportSingle(ctx, row.ID).Success {
			n++
		}
	}
	return CommandResult{Success: true, Message: "exported", Exported: n}
}

func (s *Service) publishDeleteFolder(ctx context.Context, store, path string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.DeleteFolderEvent{Store: store, Path: path, FolderName: path})
}

func (s *Service) publishDeleteFile(ctx context.Context, store, path, itemType string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.DeleteFileOrFolderEvent{Store: store, Path: path, ItemType: itemType})
}

func (s *Service) publishExport(ctx context.Context, id string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.ExportCertificateEvent{ID: id})
}
