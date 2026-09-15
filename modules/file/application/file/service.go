package fileapp

import (
	"context"
	"encoding/json"
	"io/fs"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"time"

	"nfxvault/events"
	tlsapp "nfxvault/modules/tls/application/tls"
	"nfxvault/pkgs/kafkax/eventbus"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db      *gorm.DB
	bus     *eventbus.BusPublisher
	baseDir string
}

func NewService(db *gorm.DB, bus *eventbus.BusPublisher, baseDir string) *Service {
	return &Service{db: db, bus: bus, baseDir: baseDir}
}

func (s *Service) websitesDir() string {
	return filepath.Join(s.baseDir, "Websites")
}

func (s *Service) resolve(store, subpath string) (storeDir, target string, err error) {
	if store == "" {
		store = "websites"
	}
	folder := "Websites"
	if !strings.EqualFold(store, "websites") {
		folder = store
	}
	storeDir = filepath.Join(s.baseDir, folder)
	rel := strings.Trim(strings.ReplaceAll(subpath, "\\", "/"), "/")
	rel = filepath.Clean(rel)
	if rel == "." {
		rel = ""
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(os.PathSeparator)) || strings.HasPrefix(rel, "../") {
		return "", "", os.ErrPermission
	}
	if rel == "" {
		target = storeDir
	} else {
		target = filepath.Join(storeDir, rel)
	}
	storeAbs, err := filepath.Abs(storeDir)
	if err != nil {
		return "", "", err
	}
	targetAbs, err := filepath.Abs(target)
	if err != nil {
		return "", "", err
	}
	if targetAbs != storeAbs && !strings.HasPrefix(targetAbs, storeAbs+string(os.PathSeparator)) {
		return "", "", os.ErrPermission
	}
	return storeAbs, targetAbs, nil
}

func (s *Service) List(subpath string) map[string]any {
	storeDir, target, err := s.resolve("websites", subpath)
	if err != nil {
		return map[string]any{"success": false, "message": "Invalid path", "items": []any{}}
	}
	info, err := os.Stat(target)
	if err != nil {
		return map[string]any{"success": false, "message": "Directory not found: " + subpath, "items": []any{}}
	}
	if !info.IsDir() {
		return map[string]any{"success": false, "message": "Path is not a directory", "items": []any{}}
	}
	entries, err := os.ReadDir(target)
	if err != nil {
		return map[string]any{"success": false, "message": err.Error(), "items": []any{}}
	}
	items := make([]map[string]any, 0, len(entries))
	for _, e := range entries {
		if strings.HasPrefix(e.Name(), ".") {
			continue
		}
		st, _ := e.Info()
		rel, _ := filepath.Rel(storeDir, filepath.Join(target, e.Name()))
		itemType := "file"
		var size any
		if e.IsDir() {
			itemType = "directory"
		} else if st != nil {
			size = st.Size()
		}
		mod := float64(0)
		if st != nil {
			mod = float64(st.ModTime().Unix())
		}
		items = append(items, map[string]any{
			"name":     e.Name(),
			"type":     itemType,
			"path":     filepath.ToSlash(rel),
			"size":     size,
			"modified": mod,
		})
	}
	return map[string]any{
		"success": true,
		"message": "Directory listed successfully",
		"store":   "websites",
		"path":    strings.Trim(strings.TrimPrefix(subpath, "/"), "\\"),
		"items":   items,
	}
}

func (s *Service) Content(subpath string) map[string]any {
	_, target, err := s.resolve("websites", subpath)
	if err != nil {
		return map[string]any{"success": false, "message": "invalid path", "content": nil, "filename": nil}
	}
	b, err := os.ReadFile(target)
	if err != nil {
		return map[string]any{"success": false, "message": err.Error(), "content": nil, "filename": nil}
	}
	return map[string]any{"success": true, "message": "File read successfully", "content": string(b), "filename": filepath.Base(target)}
}

func (s *Service) Download(subpath string) (content []byte, filename, mimeType string, err error) {
	_, target, err := s.resolve("websites", subpath)
	if err != nil {
		return nil, "", "", os.ErrNotExist
	}
	b, err := os.ReadFile(target)
	if err != nil {
		return nil, "", "", err
	}
	mt := mime.TypeByExtension(filepath.Ext(target))
	if mt == "" {
		mt = "application/octet-stream"
	}
	return b, filepath.Base(target), mt, nil
}

func (s *Service) Delete(ctx context.Context, store, p, itemType string) map[string]any {
	if store == "" {
		store = "websites"
	}
	s.publish(map[string]string{"kind": "delete_file", "store": store, "path": p, "item_type": itemType})
	_, target, err := s.resolve(store, p)
	if err != nil {
		return map[string]any{"success": false, "message": "invalid path", "store": store, "path": p, "item_type": itemType}
	}
	st, err := os.Stat(target)
	if err != nil {
		return map[string]any{"success": false, "message": "Path not found: " + p, "store": store, "path": p, "item_type": itemType}
	}
	isDir := st.IsDir()
	switch strings.ToLower(itemType) {
	case "file":
		if isDir {
			return map[string]any{"success": false, "message": "Path is not a file: " + p, "store": store, "path": p, "item_type": itemType}
		}
		if err := os.Remove(target); err != nil {
			return map[string]any{"success": false, "message": err.Error(), "store": store, "path": p, "item_type": itemType}
		}
	case "folder", "dir", "directory":
		if !isDir {
			return map[string]any{"success": false, "message": "Path is not a folder: " + p, "store": store, "path": p, "item_type": itemType}
		}
		if err := os.RemoveAll(target); err != nil {
			return map[string]any{"success": false, "message": err.Error(), "store": store, "path": p, "item_type": itemType}
		}
	default:
		if isDir {
			if err := os.RemoveAll(target); err != nil {
				return map[string]any{"success": false, "message": err.Error(), "store": store, "path": p, "item_type": itemType}
			}
		} else if err := os.Remove(target); err != nil {
			return map[string]any{"success": false, "message": err.Error(), "store": store, "path": p, "item_type": itemType}
		}
	}
	return map[string]any{"success": true, "message": "Successfully deleted " + itemType + ": " + store + "/" + p, "store": store, "path": p, "item_type": itemType}
}

func (s *Service) ExportSingle(ctx context.Context, certificateID string) map[string]any {
	var row tlsapp.Certificate
	if err := s.db.WithContext(ctx).First(&row, "id = ?", certificateID).Error; err != nil {
		return map[string]any{"success": false, "message": "certificate not found", "certificate_id": certificateID}
	}
	folder := row.Domain
	if row.FolderName != nil && *row.FolderName != "" {
		folder = *row.FolderName
	}
	dir := filepath.Join(s.websitesDir(), folder)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return map[string]any{"success": false, "message": err.Error(), "certificate_id": certificateID}
	}
	if row.Certificate != nil {
		_ = os.WriteFile(filepath.Join(dir, "cert.crt"), []byte(*row.Certificate), 0o644)
	}
	if row.PrivateKey != nil {
		_ = os.WriteFile(filepath.Join(dir, "key.key"), []byte(*row.PrivateKey), 0o600)
	}
	s.publish(map[string]string{"kind": "export", "id": certificateID})
	return map[string]any{
		"success":        true,
		"message":        "Successfully exported certificate for " + row.Domain + " to websites/" + folder,
		"store":          "websites",
		"folder_name":    folder,
		"domain":         row.Domain,
		"certificate_id": certificateID,
	}
}

func (s *Service) ExportAll(ctx context.Context) map[string]any {
	var rows []tlsapp.Certificate
	if err := s.db.WithContext(ctx).Find(&rows).Error; err != nil {
		return map[string]any{"success": false, "message": err.Error()}
	}
	n := 0
	for _, row := range rows {
		if s.ExportSingle(ctx, row.ID)["success"] == true {
			n++
		}
	}
	return map[string]any{"success": true, "message": "exported", "exported": n}
}

func (s *Service) ImportFromDisk(ctx context.Context) map[string]any {
	root := s.websitesDir()
	if _, err := os.Stat(root); err != nil {
		return map[string]any{"success": true, "message": "Directory not found: " + root, "processed": 0}
	}
	processed := 0
	_ = filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil || !d.IsDir() || path == root {
			return nil
		}
		if strings.HasPrefix(d.Name(), ".") {
			return filepath.SkipDir
		}
		certFile := filepath.Join(path, "cert.crt")
		keyFile := filepath.Join(path, "key.key")
		cb, e1 := os.ReadFile(certFile)
		kb, e2 := os.ReadFile(keyFile)
		if e1 != nil || e2 != nil {
			return nil
		}
		info, err := tlsapp.ParsePEM(string(cb))
		if err != nil || info.CommonName == "" {
			return nil
		}
		folder := filepath.Base(path)
		cert := string(cb)
		key := string(kb)
		now := time.Now()
		valid := info.IsValid
		days := info.DaysRemaining
		issuer := info.Issuer
		row := tlsapp.Certificate{
			ID: uuid.NewString(), Domain: info.CommonName, FolderName: &folder, Status: "success",
			Certificate: &cert, PrivateKey: &key, SANs: mustJSON(info.AllDomains),
			Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
			IsValid: &valid, DaysRemaining: &days, CreatedAt: now, UpdatedAt: now,
		}
		if err := s.db.WithContext(ctx).Where("domain = ?", info.CommonName).FirstOrCreate(&row).Error; err == nil {
			processed++
		}
		return filepath.SkipDir
	})
	return map[string]any{"success": true, "processed": processed}
}

func (s *Service) publish(payload map[string]string) {
	if s.bus == nil {
		return
	}
	b, _ := json.Marshal(payload)
	topic := "nfxvault.file"
	if name, ok := s.bus.GetTopic(events.TKFile); ok && name != "" {
		topic = name
	}
	_ = s.bus.Publish(topic, message.NewMessage(uuid.NewString(), b))
}

func mustJSON(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}
