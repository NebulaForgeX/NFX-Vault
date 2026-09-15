package fsstore

import (
	"io/fs"
	"mime"
	"os"
	"path/filepath"
	"strings"
)

type Store struct{ BaseDir string }

func New(baseDir string) *Store { return &Store{BaseDir: baseDir} }

func (s *Store) WebsitesDir() string { return filepath.Join(s.BaseDir, "Websites") }

func (s *Store) Resolve(store, subpath string) (storeDir, target string, err error) {
	if store == "" {
		store = "websites"
	}
	folder := "Websites"
	if !strings.EqualFold(store, "websites") {
		folder = store
	}
	storeDir = filepath.Join(s.BaseDir, folder)
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

type Entry struct {
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Path     string  `json:"path"`
	Size     *int64  `json:"size"`
	Modified float64 `json:"modified"`
}

func (s *Store) List(subpath string) (store, path string, items []Entry, err error) {
	storeDir, target, err := s.Resolve("websites", subpath)
	if err != nil {
		return "websites", subpath, nil, err
	}
	info, err := os.Stat(target)
	if err != nil {
		return "websites", subpath, nil, err
	}
	if !info.IsDir() {
		return "websites", subpath, nil, fs.ErrInvalid
	}
	entries, err := os.ReadDir(target)
	if err != nil {
		return "websites", subpath, nil, err
	}
	items = make([]Entry, 0, len(entries))
	for _, e := range entries {
		if strings.HasPrefix(e.Name(), ".") {
			continue
		}
		st, _ := e.Info()
		rel, _ := filepath.Rel(storeDir, filepath.Join(target, e.Name()))
		itemType := "file"
		var size *int64
		if e.IsDir() {
			itemType = "directory"
		} else if st != nil {
			n := st.Size()
			size = &n
		}
		mod := float64(0)
		if st != nil {
			mod = float64(st.ModTime().Unix())
		}
		items = append(items, Entry{Name: e.Name(), Type: itemType, Path: filepath.ToSlash(rel), Size: size, Modified: mod})
	}
	path = strings.Trim(strings.TrimPrefix(subpath, "/"), "\\")
	return "websites", path, items, nil
}

func (s *Store) Read(subpath string) (content []byte, filename string, err error) {
	_, target, err := s.Resolve("websites", subpath)
	if err != nil {
		return nil, "", err
	}
	b, err := os.ReadFile(target)
	if err != nil {
		return nil, "", err
	}
	return b, filepath.Base(target), nil
}

func (s *Store) Download(subpath string) (content []byte, filename, mimeType string, err error) {
	b, name, err := s.Read(subpath)
	if err != nil {
		return nil, "", "", err
	}
	mt := mime.TypeByExtension(filepath.Ext(name))
	if mt == "" {
		mt = "application/octet-stream"
	}
	return b, name, mt, nil
}

func (s *Store) Delete(store, p, itemType string) error {
	if store == "" {
		store = "websites"
	}
	_, target, err := s.Resolve(store, p)
	if err != nil {
		return err
	}
	st, err := os.Stat(target)
	if err != nil {
		return err
	}
	isDir := st.IsDir()
	switch strings.ToLower(itemType) {
	case "file":
		if isDir {
			return fs.ErrInvalid
		}
		return os.Remove(target)
	case "folder", "dir", "directory":
		if !isDir {
			return fs.ErrInvalid
		}
		return os.RemoveAll(target)
	default:
		if isDir {
			return os.RemoveAll(target)
		}
		return os.Remove(target)
	}
}

func (s *Store) WriteCertificate(folder, certPEM, keyPEM string) error {
	dir := filepath.Join(s.WebsitesDir(), folder)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	if certPEM != "" {
		if err := os.WriteFile(filepath.Join(dir, "cert.crt"), []byte(certPEM), 0o644); err != nil {
			return err
		}
	}
	if keyPEM != "" {
		if err := os.WriteFile(filepath.Join(dir, "key.key"), []byte(keyPEM), 0o600); err != nil {
			return err
		}
	}
	return nil
}
