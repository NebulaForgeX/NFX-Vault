package disk

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	pemx "nfxvault/modules/tls/infrastructure/pem"
)

type Found struct {
	Folder  string
	CertPEM string
	KeyPEM  string
	Info    *pemx.CertInfo
}

func WebsitesDir(baseDir string) string {
	return filepath.Join(baseDir, "Websites")
}

func ScanWebsites(baseDir string) ([]Found, error) {
	root := WebsitesDir(baseDir)
	if _, err := os.Stat(root); err != nil {
		return nil, nil
	}
	var out []Found
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil || !d.IsDir() || path == root {
			return nil
		}
		if strings.HasPrefix(d.Name(), ".") {
			return filepath.SkipDir
		}
		cb, e1 := os.ReadFile(filepath.Join(path, "cert.crt"))
		kb, e2 := os.ReadFile(filepath.Join(path, "key.key"))
		if e1 != nil || e2 != nil {
			return filepath.SkipDir
		}
		info, err := pemx.Parse(string(cb))
		if err != nil || info.CommonName == "" {
			return filepath.SkipDir
		}
		out = append(out, Found{Folder: filepath.Base(path), CertPEM: string(cb), KeyPEM: string(kb), Info: info})
		return filepath.SkipDir
	})
	return out, err
}
