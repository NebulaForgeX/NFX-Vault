package config

import (
	"nfxvault/pkgs/cachex"
	"nfxvault/pkgs/connections/otelx"
	"nfxvault/pkgs/env"
	"nfxvault/pkgs/httpx"
	"nfxvault/pkgs/kafkax"
	"nfxvault/pkgs/logx"
	"nfxvault/pkgs/postgresqlx"
	"nfxvault/pkgs/tokenx"
)

type Config struct {
	Env         env.Env
	Server      ServerConfig       `koanf:"server"`
	PostgreSQL  postgresqlx.Config `koanf:"postgresql"`
	Cache       cachex.ConnConfig  `koanf:"cache"`
	Logger      logx.LoggerConfig  `koanf:"logger"`
	KafkaConfig kafkax.Config      `koanf:"kafka"`
	GRPCClient  GRPCClientConfig   `koanf:"grpc_client"`
	Token       tokenx.Config      `koanf:"token"`
	I18n        I18nConfig         `koanf:"i18n"`
	OTEL        otelx.Config       `koanf:"otel"`
}

type I18nConfig struct {
	ErrorsLangsPath string `koanf:"errors_langs_path"`
}

type GRPCClientConfig struct {
	AuthAddr     string `koanf:"auth_addr"`
	TLSAddr      string `koanf:"tls_addr"`
	FileAddr     string `koanf:"file_addr"`
	AnalysisAddr string `koanf:"analysis_addr"`
	SystemAddr   string `koanf:"system_addr"`
	DNSAddr      string `koanf:"dns_addr"`
}

type ServerConfig struct {
	Name      string                `koanf:"name"`
	Host      string                `koanf:"host"`
	HTTPPort  int                   `koanf:"http_port"`
	GRPCPort  int                   `koanf:"grpc_port"`
	AccessLog httpx.AccessLogConfig `koanf:"access_log"`
}
