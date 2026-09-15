package tlsapp

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type CertbotClient struct {
	ChallengeDir string
	CertsDir     string
	MaxWait      time.Duration
}

func (c *CertbotClient) Issue(ctx context.Context, domain, email string, sans []string, folderName string, force bool) (certPEM, keyPEM string, msg string, err error) {
	if folderName == "" {
		folderName = strings.ReplaceAll(domain, ".", "_")
	}
	configDir := filepath.Join(c.CertsDir, ".certbot", "config")
	workDir := filepath.Join(c.CertsDir, ".certbot", "work")
	logsDir := filepath.Join(c.CertsDir, ".certbot", "logs")
	for _, d := range []string{c.ChallengeDir, filepath.Join(c.ChallengeDir, ".well-known", "acme-challenge"), configDir, workDir, logsDir} {
		_ = os.MkdirAll(d, 0o755)
	}
	liveCert := filepath.Join(configDir, "live", folderName, "fullchain.pem")
	liveKey := filepath.Join(configDir, "live", folderName, "privkey.pem")
	if !force {
		if b, e := os.ReadFile(liveCert); e == nil {
			if k, e2 := os.ReadFile(liveKey); e2 == nil {
				return string(b), string(k), "Using existing certificate", nil
			}
		}
	}
	domains := []string{"-d", domain}
	for _, s := range sans {
		s = strings.TrimSpace(s)
		if s != "" && !strings.EqualFold(s, domain) {
			domains = append(domains, "-d", s)
		}
	}
	args := []string{
		"certonly", "--non-interactive", "--agree-tos",
		"--email", email,
		"--webroot", "--webroot-path", c.ChallengeDir,
		"--cert-name", folderName,
		"--config-dir", configDir, "--work-dir", workDir, "--logs-dir", logsDir,
	}
	args = append(args, domains...)
	if force {
		args = append(args, "--force-renewal")
	}
	wait := c.MaxWait
	if wait <= 0 {
		wait = 5 * time.Minute
	}
	cctx, cancel := context.WithTimeout(ctx, wait)
	defer cancel()
	cmd := exec.CommandContext(cctx, "certbot", args...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", "", string(out), fmt.Errorf("certbot: %w: %s", err, strings.TrimSpace(string(out)))
	}
	b, err := os.ReadFile(liveCert)
	if err != nil {
		return "", "", string(out), err
	}
	k, err := os.ReadFile(liveKey)
	if err != nil {
		return "", "", string(out), err
	}
	return string(b), string(k), "Certificate issued", nil
}
