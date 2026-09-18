package namecheap

import (
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	productionAPI = "https://api.namecheap.com/xml.response"
	sandboxAPI    = "https://api.sandbox.namecheap.com/xml.response"
	ddnsUpdateURL = "https://dynamicdns.park-your-domain.com/update"
	ipifyURL      = "https://api.ipify.org"
	ifconfigURL   = "https://ifconfig.me/ip"
)

type Credentials struct {
	APIUser  string
	UserName string
	APIKey   string
	ClientIP string
	Sandbox  bool
}

type Domain struct {
	ID        string `xml:"ID,attr" json:"id"`
	Name      string `xml:"Name,attr" json:"name"`
	Created   string `xml:"Created,attr" json:"created"`
	Expires   string `xml:"Expires,attr" json:"expires"`
	IsExpired string `xml:"IsExpired,attr" json:"is_expired"`
	IsLocked  string `xml:"IsLocked,attr" json:"is_locked"`
	AutoRenew string `xml:"AutoRenew,attr" json:"auto_renew"`
	IsOurDNS  string `xml:"IsOurDNS,attr" json:"is_our_dns"`
}

type Host struct {
	HostID             string `xml:"HostId,attr" json:"host_id"`
	Name               string `xml:"Name,attr" json:"name"`
	Type               string `xml:"Type,attr" json:"type"`
	Address            string `xml:"Address,attr" json:"address"`
	MXPref             string `xml:"MXPref,attr" json:"mx_pref"`
	TTL                string `xml:"TTL,attr" json:"ttl"`
	AssociatedAppTitle string `xml:"AssociatedAppTitle,attr" json:"associated_app_title"`
	FriendlyName       string `xml:"FriendlyName,attr" json:"friendly_name"`
	IsActive           string `xml:"IsActive,attr" json:"is_active"`
	IsDDNSEnabled      string `xml:"IsDDNSEnabled,attr" json:"is_ddns_enabled"`
}

type HostsResult struct {
	Domain    string `json:"domain"`
	EmailType string `json:"email_type"`
	IsOurDNS  bool   `json:"is_our_dns"`
	Hosts     []Host `json:"hosts"`
}

type Client struct {
	http *http.Client
}

func New() *Client {
	return &Client{http: &http.Client{Timeout: 30 * time.Second}}
}

type apiResponse struct {
	XMLName xml.Name `xml:"ApiResponse"`
	Status  string   `xml:"Status,attr"`
	Errors  []struct {
		Number  string `xml:"Number,attr"`
		Message string `xml:",chardata"`
	} `xml:"Errors>Error"`
	CommandResponse struct {
		Type    string   `xml:"Type,attr"`
		Domains []Domain `xml:"DomainGetListResult>Domain"`
		Paging  struct {
			TotalItems  int `xml:"TotalItems"`
			CurrentPage int `xml:"CurrentPage"`
			PageSize    int `xml:"PageSize"`
		} `xml:"Paging"`
		DNSGetHosts struct {
			Domain    string `xml:"Domain,attr"`
			EmailType string `xml:"EmailType,attr"`
			IsOurDNS  string `xml:"IsUsingOurDNS,attr"`
			Hosts     []Host `xml:"host"`
		} `xml:"DomainDNSGetHostsResult"`
		DNSSetHosts struct {
			Domain    string `xml:"Domain,attr"`
			IsSuccess string `xml:"IsSuccess,attr"`
		} `xml:"DomainDNSSetHostsResult"`
	} `xml:"CommandResponse"`
}

func (c *Client) GetList(ctx context.Context, cred Credentials, page, pageSize int) ([]Domain, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 100
	}
	q := url.Values{}
	q.Set("Command", "namecheap.domains.getList")
	q.Set("Page", strconv.Itoa(page))
	q.Set("PageSize", strconv.Itoa(pageSize))
	q.Set("ListType", "ALL")
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return nil, 0, err
	}
	return resp.CommandResponse.Domains, resp.CommandResponse.Paging.TotalItems, nil
}

func (c *Client) GetAllDomains(ctx context.Context, cred Credentials) ([]Domain, error) {
	const pageSize = 100
	page := 1
	var all []Domain
	for {
		items, total, err := c.GetList(ctx, cred, page, pageSize)
		if err != nil {
			return nil, err
		}
		all = append(all, items...)
		if total <= 0 || len(all) >= total || len(items) == 0 {
			break
		}
		page++
	}
	return all, nil
}

func (c *Client) GetHosts(ctx context.Context, cred Credentials, domain string) (*HostsResult, error) {
	sld, tld, err := SplitDomain(domain)
	if err != nil {
		return nil, err
	}
	q := url.Values{}
	q.Set("Command", "namecheap.domains.dns.getHosts")
	q.Set("SLD", sld)
	q.Set("TLD", tld)
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return nil, err
	}
	r := resp.CommandResponse.DNSGetHosts
	return &HostsResult{
		Domain:    r.Domain,
		EmailType: r.EmailType,
		IsOurDNS:  strings.EqualFold(r.IsOurDNS, "true"),
		Hosts:     r.Hosts,
	}, nil
}

func (c *Client) SetHosts(ctx context.Context, cred Credentials, domain, emailType string, hosts []Host) error {
	sld, tld, err := SplitDomain(domain)
	if err != nil {
		return err
	}
	q := url.Values{}
	q.Set("Command", "namecheap.domains.dns.setHosts")
	q.Set("SLD", sld)
	q.Set("TLD", tld)
	if emailType != "" {
		q.Set("EmailType", emailType)
	}
	for i, h := range hosts {
		n := strconv.Itoa(i + 1)
		q.Set("HostName"+n, h.Name)
		q.Set("RecordType"+n, h.Type)
		q.Set("Address"+n, h.Address)
		if h.MXPref != "" {
			q.Set("MXPref"+n, h.MXPref)
		}
		if h.TTL != "" {
			q.Set("TTL"+n, h.TTL)
		}
		if h.AssociatedAppTitle != "" {
			q.Set("AssociatedAppTitle"+n, h.AssociatedAppTitle)
		}
		if h.FriendlyName != "" {
			q.Set("FriendlyName"+n, h.FriendlyName)
		}
		if h.IsActive != "" {
			q.Set("IsActive"+n, h.IsActive)
		}
		if h.IsDDNSEnabled != "" {
			q.Set("IsDDNSEnabled"+n, h.IsDDNSEnabled)
		}
	}
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return err
	}
	if resp.CommandResponse.DNSSetHosts.IsSuccess != "" && !strings.EqualFold(resp.CommandResponse.DNSSetHosts.IsSuccess, "true") {
		return fmt.Errorf("namecheap setHosts failed for %s", domain)
	}
	return nil
}

func (c *Client) UpdateARecord(ctx context.Context, cred Credentials, domain, host, ip string) error {
	hosts, err := c.GetHosts(ctx, cred, domain)
	if err != nil {
		return err
	}
	if !hosts.IsOurDNS && len(hosts.Hosts) == 0 {
		return fmt.Errorf("domain %s is not using Namecheap DNS", domain)
	}
	host = NormalizeHost(host)
	found := false
	for i := range hosts.Hosts {
		if strings.EqualFold(hosts.Hosts[i].Name, host) && strings.EqualFold(hosts.Hosts[i].Type, "A") {
			hosts.Hosts[i].Address = ip
			found = true
		}
	}
	if !found {
		hosts.Hosts = append(hosts.Hosts, Host{
			Name:    host,
			Type:    "A",
			Address: ip,
			TTL:     "1800",
			MXPref:  "10",
		})
	}
	return c.SetHosts(ctx, cred, domain, hosts.EmailType, hosts.Hosts)
}

type ddnsResponse struct {
	XMLName  xml.Name `xml:"interface-response"`
	IP       string   `xml:"IP"`
	ErrCount int      `xml:"ErrCount"`
	Errors   []string `xml:"errors>Err1"`
}

func (c *Client) UpdateDDNS(ctx context.Context, domain, host, password, ip string) error {
	host = NormalizeHost(host)
	q := url.Values{}
	q.Set("host", host)
	q.Set("domain", strings.ToLower(strings.TrimSpace(domain)))
	q.Set("password", password)
	if ip != "" {
		q.Set("ip", ip)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, ddnsUpdateURL+"?"+q.Encode(), nil)
	if err != nil {
		return err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("namecheap ddns: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return fmt.Errorf("namecheap ddns read: %w", err)
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("namecheap ddns http %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	var parsed ddnsResponse
	if err := xml.Unmarshal(body, &parsed); err != nil {
		return fmt.Errorf("namecheap ddns xml: %w", err)
	}
	if parsed.ErrCount > 0 {
		msg := strings.Join(parsed.Errors, "; ")
		if msg == "" {
			msg = "dynamic dns update failed"
		}
		return fmt.Errorf("namecheap ddns: %s", msg)
	}
	return nil
}

func (c *Client) OutboundIPv4(ctx context.Context) (string, error) {
	ip, err := c.fetchText(ctx, ipifyURL)
	if err != nil {
		ip, err = c.fetchText(ctx, ifconfigURL)
		if err != nil {
			return "", fmt.Errorf("detect outbound ipv4: %w", err)
		}
	}
	parsed := net.ParseIP(strings.TrimSpace(ip))
	if parsed == nil || parsed.To4() == nil {
		return "", fmt.Errorf("outbound address is not ipv4: %s", ip)
	}
	return parsed.To4().String(), nil
}

func (c *Client) fetchText(ctx context.Context, rawURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return "", err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if err != nil {
		return "", err
	}
	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("%s http %d", rawURL, resp.StatusCode)
	}
	return strings.TrimSpace(string(body)), nil
}

func (c *Client) xmlCall(ctx context.Context, cred Credentials, extra url.Values, dest *apiResponse) error {
	if strings.TrimSpace(cred.APIUser) == "" || strings.TrimSpace(cred.APIKey) == "" || strings.TrimSpace(cred.ClientIP) == "" {
		return fmt.Errorf("namecheap credentials incomplete")
	}
	userName := strings.TrimSpace(cred.UserName)
	if userName == "" {
		userName = strings.TrimSpace(cred.APIUser)
	}
	q := url.Values{}
	q.Set("ApiUser", strings.TrimSpace(cred.APIUser))
	q.Set("ApiKey", strings.TrimSpace(cred.APIKey))
	q.Set("UserName", userName)
	q.Set("ClientIp", strings.TrimSpace(cred.ClientIP))
	for k, vs := range extra {
		for _, v := range vs {
			q.Set(k, v)
		}
	}
	endpoint := productionAPI
	if cred.Sandbox {
		endpoint = sandboxAPI
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint+"?"+q.Encode(), nil)
	if err != nil {
		return err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("namecheap api: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return fmt.Errorf("namecheap api read: %w", err)
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("namecheap api http %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	if err := xml.Unmarshal(body, dest); err != nil {
		return fmt.Errorf("namecheap api xml: %w", err)
	}
	if !strings.EqualFold(dest.Status, "OK") {
		msgs := make([]string, 0, len(dest.Errors))
		for _, e := range dest.Errors {
			msg := strings.TrimSpace(e.Message)
			if e.Number != "" {
				msg = e.Number + ": " + msg
			}
			if msg != "" {
				msgs = append(msgs, msg)
			}
		}
		if len(msgs) == 0 {
			return fmt.Errorf("namecheap api status %s", dest.Status)
		}
		return fmt.Errorf("namecheap api: %s", strings.Join(msgs, "; "))
	}
	return nil
}

func SplitDomain(domain string) (sld, tld string, err error) {
	domain = strings.ToLower(strings.TrimSpace(domain))
	domain = strings.TrimSuffix(domain, ".")
	if domain == "" {
		return "", "", fmt.Errorf("domain is empty")
	}
	i := strings.IndexByte(domain, '.')
	if i <= 0 || i == len(domain)-1 {
		return "", "", fmt.Errorf("invalid domain %q", domain)
	}
	return domain[:i], domain[i+1:], nil
}

func NormalizeHost(host string) string {
	host = strings.TrimSpace(host)
	if host == "" {
		return "@"
	}
	return host
}
