package certbot

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type Client struct {
	ChallengeDir string
	CertsDir     string
	MaxWait      time.Duration
}

type IssueResult struct {
	CertPEM    string
	KeyPEM     string
	Message    string
	RateLimit  bool
	RetryAfter string
}

func (c *Client) EnsureWebroot() {
	if c == nil || c.ChallengeDir == "" {
		return
	}
	wk := filepath.Join(c.ChallengeDir, ".well-known", "acme-challenge")
	_ = os.MkdirAll(wk, 0o755)
	for _, p := range []string{c.ChallengeDir, filepath.Join(c.ChallengeDir, ".well-known"), wk} {
		_ = os.Chmod(p, 0o777)
	}
}

func (c *Client) existingPEM(folderName string) (cert, key string, valid bool, ok bool) {
	cfg := filepath.Join(c.CertsDir, ".certbot", "config")
	cfile := filepath.Join(cfg, "live", folderName, "fullchain.pem")
	kfile := filepath.Join(cfg, "live", folderName, "privkey.pem")
	cb, e1 := os.ReadFile(cfile)
	kb, e2 := os.ReadFile(kfile)
	if e1 != nil || e2 != nil {
		return "", "", false, false
	}
	valid = true
	cmd := exec.Command("openssl", "x509", "-in", cfile, "-noout", "-checkend", "86400")
	if err := cmd.Run(); err != nil {
		valid = false
	}
	return string(cb), string(kb), valid, true
}

var rateLimitRe = regexp.MustCompile(`(?i)too many certificates.*?retry after (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})`)

func rateLimit(msg string) (bool, string) {
	m := rateLimitRe.FindStringSubmatch(msg)
	if len(m) == 2 {
		return true, m[1]
	}
	return false, ""
}

func (c *Client) Issue(ctx context.Context, domain, email string, sans []string, folderName string, force bool) (*IssueResult, error) {
	if folderName == "" {
		folderName = strings.ReplaceAll(domain, ".", "_")
	}
	c.EnsureWebroot()
	if !force {
		if cert, key, valid, ok := c.existingPEM(folderName); ok && valid {
			return &IssueResult{CertPEM: cert, KeyPEM: key, Message: "Using existing certificate"}, nil
		}
	}
	configDir := filepath.Join(c.CertsDir, ".certbot", "config")
	workDir := filepath.Join(c.CertsDir, ".certbot", "work")
	logsDir := filepath.Join(c.CertsDir, ".certbot", "logs")
	for _, d := range []string{configDir, workDir, logsDir} {
		_ = os.MkdirAll(d, 0o755)
	}
	args := []string{
		"certonly", "--non-interactive", "--agree-tos",
		"--email", email,
		"--webroot", "--webroot-path", c.ChallengeDir,
		"--cert-name", folderName,
		"--config-dir", configDir, "--work-dir", workDir, "--logs-dir", logsDir,
	}
	seen := map[string]struct{}{}
	for _, h := range append([]string{domain}, sans...) {
		h = strings.TrimSpace(h)
		if h == "" {
			continue
		}
		if _, ok := seen[h]; ok {
			continue
		}
		seen[h] = struct{}{}
		args = append(args, "-d", h)
	}
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
	msg := strings.TrimSpace(string(out))
	if err != nil {
		isRL, retry := rateLimit(msg)
		if isRL && !force {
			if cert, key, _, ok := c.existingPEM(folderName); ok {
				return &IssueResult{CertPEM: cert, KeyPEM: key, Message: "rate limit, using existing", RateLimit: true, RetryAfter: retry}, nil
			}
		}
		if isRL {
			return &IssueResult{Message: msg, RateLimit: true, RetryAfter: retry}, fmt.Errorf("certbot rate limit: %s", msg)
		}
		return &IssueResult{Message: msg}, fmt.Errorf("certbot: %w: %s", err, msg)
	}
	b, err := os.ReadFile(filepath.Join(configDir, "live", folderName, "fullchain.pem"))
	if err != nil {
		return &IssueResult{Message: msg}, err
	}
	k, err := os.ReadFile(filepath.Join(configDir, "live", folderName, "privkey.pem"))
	if err != nil {
		return &IssueResult{Message: msg}, err
	}
	return &IssueResult{CertPEM: string(b), KeyPEM: string(k), Message: "Certificate issued"}, nil
}
