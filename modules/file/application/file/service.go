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

func firstSegment(subpath string) string {
	rel := strings.Trim(strings.ReplaceAll(subpath, "\\", "/"), "/")
	if rel == "" || rel == "." {
		return ""
	}
	return strings.Split(rel, "/")[0]
}

func (s *Service) ownedFolders(ctx context.Context, accountID string) (map[string]struct{}, error) {
	rows, _, err := s.certs.List.Page(ctx, accountID, "", 0, 5000, true)
	if err != nil {
		return nil, err
	}
	out := make(map[string]struct{}, len(rows))
	for _, row := range rows {
		name := row.Domain
		if row.FolderName != nil && *row.FolderName != "" {
			name = *row.FolderName
		}
		out[name] = struct{}{}
	}
	return out, nil
}

func (s *Service) pathAllowed(ctx context.Context, accountID, subpath string) bool {
	seg := firstSegment(subpath)
	if seg == "" {
		return true
	}
	folders, err := s.ownedFolders(ctx, accountID)
	if err != nil {
		return false
	}
	_, ok := folders[seg]
	return ok
}

func (s *Service) List(ctx context.Context, accountID, subpath string) CommandResult {
	if !s.pathAllowed(ctx, accountID, subpath) {
		return CommandResult{Success: false, Message: "Directory not found: " + subpath, Items: []fsstore.Entry{}}
	}
	store, path, items, err := s.fs.List(subpath)
	if err != nil {
		msg := "Directory not found: " + subpath
		if os.IsPermission(err) {
			msg = "Invalid path"
		}
		return CommandResult{Success: false, Message: msg, Items: []fsstore.Entry{}}
	}
	if firstSegment(subpath) == "" {
		folders, ferr := s.ownedFolders(ctx, accountID)
		if ferr != nil {
			return CommandResult{Success: false, Message: ferr.Error(), Items: []fsstore.Entry{}}
		}
		filtered := make([]fsstore.Entry, 0, len(items))
		for _, item := range items {
			if _, ok := folders[item.Name]; ok {
				filtered = append(filtered, item)
			}
		}
		items = filtered
	}
	return CommandResult{Success: true, Message: "Directory listed successfully", Store: store, Path: path, Items: items}
}

func (s *Service) Content(ctx context.Context, accountID, subpath string) CommandResult {
	if !s.pathAllowed(ctx, accountID, subpath) || firstSegment(subpath) == "" {
		return CommandResult{Success: false, Message: "not found"}
	}
	b, name, err := s.fs.Read(subpath)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	c, n := string(b), name
	return CommandResult{Success: true, Message: "File read successfully", Content: &c, Filename: &n}
}

func (s *Service) Download(ctx context.Context, accountID, subpath string) (content []byte, filename, mimeType string, err error) {
	if !s.pathAllowed(ctx, accountID, subpath) || firstSegment(subpath) == "" {
		return nil, "", "", os.ErrNotExist
	}
	return s.fs.Download(subpath)
}

func (s *Service) Delete(ctx context.Context, accountID, store, p, itemType string) CommandResult {
	if !s.pathAllowed(ctx, accountID, p) || firstSegment(p) == "" {
		return CommandResult{Success: false, Message: "Path not found: " + p, Store: store, Path: p, ItemType: itemType}
	}
	if store == "" {
		store = "websites"
	}
	if strings.EqualFold(itemType, "folder") || strings.EqualFold(itemType, "dir") || strings.EqualFold(itemType, "directory") {
		s.publishDeleteFolder(ctx, accountID, store, p)
	} else {
		s.publishDeleteFile(ctx, accountID, store, p, itemType)
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
	if evt.AccountID == "" || !s.pathAllowed(ctx, evt.AccountID, path) {
		return nil
	}
	return s.fs.Delete(evt.Store, path, "folder")
}

func (s *Service) HandleDeleteFileOrFolder(ctx context.Context, evt events.DeleteFileOrFolderEvent) error {
	if evt.AccountID == "" || !s.pathAllowed(ctx, evt.AccountID, evt.Path) {
		return nil
	}
	return s.fs.Delete(evt.Store, evt.Path, evt.ItemType)
}

func (s *Service) ExportSingle(ctx context.Context, accountID, certificateID string) CommandResult {
	row, err := s.certs.List.ByID(ctx, certificateID)
	if err != nil || row == nil || row.AccountID == nil || *row.AccountID != accountID {
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
	s.publishExport(ctx, accountID, certificateID)
	return CommandResult{
		Success: true, Message: "Successfully exported certificate for " + row.Domain + " to websites/" + folder,
		Store: "websites", FolderName: folder, Domain: row.Domain, CertificateID: certificateID,
	}
}

func (s *Service) HandleExportCertificate(ctx context.Context, evt events.ExportCertificateEvent) error {
	row, err := s.certs.List.ByID(ctx, evt.ID)
	if err != nil || row == nil || row.AccountID == nil {
		return err
	}
	if evt.AccountID != "" && *row.AccountID != evt.AccountID {
		return nil
	}
	s.ExportSingle(ctx, *row.AccountID, evt.ID)
	return nil
}

func (s *Service) ExportAll(ctx context.Context, accountID string) CommandResult {
	rows, _, err := s.certs.List.Page(ctx, accountID, "", 0, 5000, false)
	if err != nil {
		return CommandResult{Success: false, Message: err.Error()}
	}
	n := 0
	for _, row := range rows {
		if s.ExportSingle(ctx, accountID, row.ID).Success {
			n++
		}
	}
	return CommandResult{Success: true, Message: "exported", Exported: n}
}

func (s *Service) publishDeleteFolder(ctx context.Context, accountID, store, path string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.DeleteFolderEvent{AccountID: accountID, Store: store, Path: path, FolderName: path})
}

func (s *Service) publishDeleteFile(ctx context.Context, accountID, store, path, itemType string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.DeleteFileOrFolderEvent{AccountID: accountID, Store: store, Path: path, ItemType: itemType})
}

func (s *Service) publishExport(ctx context.Context, accountID, id string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.ExportCertificateEvent{AccountID: accountID, ID: id})
}
