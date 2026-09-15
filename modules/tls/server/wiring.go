package server

import (
	"context"
	"fmt"
	"time"

	authconn "nfxvault/connections/auth"
	tlsapp "nfxvault/modules/tls/application/tls"
	"nfxvault/modules/tls/config"
	"nfxvault/pkgs/cachex"
	"nfxvault/pkgs/health"
	"nfxvault/pkgs/kafkax"
	"nfxvault/pkgs/kafkax/eventbus"
	"nfxvault/pkgs/postgresqlx"
	"nfxvault/pkgs/security/token"
	"nfxvault/pkgs/security/token/servertoken"
	"nfxvault/pkgs/tokenx"

	"google.golang.org/grpc"
)

type Dependencies struct {
	healthMgr           *health.Manager
	cache               *cachex.Connection
	postgres            *postgresqlx.Connection
	kafkaConfig         *kafkax.Config
	busPublisher        *eventbus.BusPublisher
	appSvc              *tlsapp.Service
	userTokenVerifier   token.Verifier
	serverTokenVerifier token.Verifier
	errorsLangsPath     string
	conns               []*grpc.ClientConn
	identityAuth        *authconn.Client
}

func NewDeps(ctx context.Context, cfg *config.Config) (*Dependencies, error) {
	postgres, err := postgresqlx.Init(ctx, cfg.PostgreSQL)
	if err != nil {
		return nil, fmt.Errorf("init PostgreSQL: %w", err)
	}
	cacheConn, err := cachex.InitConn(ctx, cfg.Cache)
	if err != nil {
		return nil, fmt.Errorf("init Redis: %w", err)
	}
	healthMgr := health.NewManager(ctx, 30*time.Second)
	healthMgr.Register(postgres)
	healthMgr.Register(cacheConn)
	kafkaConfig := cfg.KafkaConfig
	busPublisher, err := kafkax.NewPublisher(&kafkaConfig)
	if err != nil {
		return nil, fmt.Errorf("kafka publisher: %w", err)
	}
	tokenxInstance := tokenx.New(cfg.Token)
	userTokenVerifier := &tokenxVerifierAdapter{tokenx: tokenxInstance}
	serverTokenVerifier := servertoken.NewVerifier(
		&servertoken.HMACSigner{Key: []byte(cfg.Token.SecretKey)},
		cfg.Token.Issuer,
		servertoken.WithAllowedSkew(5*time.Second),
	)
	identityClient, err := authconn.Dial(authconn.GRPCConfig{
		Addr:           cfg.GRPCClient.AuthAddr,
		TokenSecretKey: cfg.Token.SecretKey,
		TokenIssuer:    cfg.Token.Issuer,
		CallerService:  "tls",
	})
	if err != nil {
		return nil, fmt.Errorf("dial identity auth: %w", err)
	}
	errorsLangsPath := cfg.I18n.ErrorsLangsPath
	if errorsLangsPath == "" {
		errorsLangsPath = "./errors/langs"
	}
	wait := time.Duration(cfg.Cert.MaxWaitSeconds) * time.Second
	if wait <= 0 {
		wait = 5 * time.Minute
	}
	certbot := &tlsapp.CertbotClient{
		ChallengeDir: cfg.Cert.ACMEChallengeDir,
		CertsDir:     cfg.Cert.BaseDir,
		MaxWait:      wait,
	}
	d := &Dependencies{
		healthMgr: healthMgr, postgres: postgres, cache: cacheConn, kafkaConfig: &kafkaConfig,
		busPublisher: busPublisher, userTokenVerifier: userTokenVerifier, serverTokenVerifier: serverTokenVerifier,
		errorsLangsPath: errorsLangsPath, identityAuth: identityClient,
	}
	d.appSvc = tlsapp.NewService(postgres.DB(), cacheConn, busPublisher, certbot, cfg.Cert.BaseDir)
	if cfg.Cert.ScheduleEnabled {
		go func() {
			t := time.NewTicker(time.Hour)
			defer t.Stop()
			_ = d.appSvc.RefreshDaysRemaining(ctx)
			for {
				select {
				case <-ctx.Done():
					return
				case <-t.C:
					_ = d.appSvc.RefreshDaysRemaining(ctx)
				}
			}
		}()
	}
	return d, nil
}

func (d *Dependencies) Cleanup() {
	d.healthMgr.Stop()
	d.postgres.Close()
	d.cache.Close()
	if d.identityAuth != nil {
		_ = d.identityAuth.Close()
	}
	for _, c := range d.conns {
		_ = c.Close()
	}
}

func (d *Dependencies) AppSvc() *tlsapp.Service              { return d.appSvc }
func (d *Dependencies) UserTokenVerifier() token.Verifier    { return d.userTokenVerifier }
func (d *Dependencies) ServerTokenVerifier() token.Verifier  { return d.serverTokenVerifier }
func (d *Dependencies) KafkaConfig() *kafkax.Config          { return d.kafkaConfig }
func (d *Dependencies) BusPublisher() *eventbus.BusPublisher { return d.busPublisher }
func (d *Dependencies) ErrorsLangsPath() string              { return d.errorsLangsPath }
func (d *Dependencies) AuthClient() *authconn.Client         { return d.identityAuth }

type tokenxVerifierAdapter struct{ tokenx *tokenx.Tokenx }

func (a *tokenxVerifierAdapter) Verify(ctx context.Context, tokenStr string) (*token.Claims, error) {
	claims, err := a.tokenx.VerifyAccessToken(tokenStr)
	if err != nil {
		return nil, err
	}
	return &token.Claims{Registered: claims.RegisteredClaims, Raw: map[string]any{
		"account_id": claims.AccountID, "profile_id": claims.ProfileID, "profile_scope": claims.ProfileScope,
	}}, nil
}
