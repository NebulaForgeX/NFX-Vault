package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"os/signal"
	"syscall"

	"nfxvault/modules/file/config"
	"nfxvault/modules/file/server"
	"nfxvault/pkgs/connections/otelx"
	"nfxvault/pkgs/env"
	"nfxvault/pkgs/logx"

	"go.uber.org/zap"
)

func main() {
	envStr := flag.String("env", "prod", "Environment (dev/prod)")
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load(ctx, env.Env(*envStr))
	if err != nil {
		log.Fatalf("load config failed: %v", err)
	}

	if err := logx.Init(cfg.Logger, "file-messaging-service", env.Env(*envStr)); err != nil {
		log.Fatalf("logger init failed: %v", err)
	}
	defer logx.Sync()

	otelShutdown, err := otelx.Init(ctx, cfg.OTEL, "file", env.Env(*envStr))
	if err != nil {
		log.Fatalf("otel init failed: %v", err)
	}
	defer func() { _ = otelShutdown(context.Background()) }()

	if err := server.RunMessaging(ctx, cfg); err != nil && !errors.Is(err, context.Canceled) {
		logx.L().Fatal("messaging server stopped with error", zap.Error(err))
	}

	logx.L().Info("messaging server shutdown gracefully")
}
