package resource

import (
	"context"

	"nfxvault/pkgs/cachex"
	"nfxvault/pkgs/kafkax"
	"nfxvault/pkgs/postgresqlx"
)

type Service struct {
	postgres *postgresqlx.Connection
	cache    *cachex.Connection
	kafkaCfg *kafkax.Config
}

func NewService(
	postgres *postgresqlx.Connection,
	cache *cachex.Connection,
	kafkaCfg *kafkax.Config,
) *Service {
	return &Service{postgres: postgres, cache: cache, kafkaCfg: kafkaCfg}
}

func (s *Service) CheckPostgres(ctx context.Context) error {
	if s.postgres == nil {
		return context.Canceled
	}
	return s.postgres.Check(ctx)
}

func (s *Service) CheckRedis(ctx context.Context) error {
	if s.cache == nil {
		return context.Canceled
	}
	return s.cache.Check(ctx)
}

func (s *Service) CheckKafka(ctx context.Context) error {
	if s.kafkaCfg == nil {
		return context.Canceled
	}
	return nil
}
