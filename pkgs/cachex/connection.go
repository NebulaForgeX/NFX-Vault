package cachex

import (
	"context"
	"nfxvault/pkgs/cachex/connection"
)

type ConnConfig = connection.Config
type Connection = connection.Connection

func InitConn(ctx context.Context, cfg ConnConfig) (*Connection, error) {
	return connection.Init(ctx, cfg)
}
