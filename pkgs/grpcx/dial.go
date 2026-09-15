package grpcx

import (
	"fmt"

	"nfxvault/pkgs/security/token/servertoken"
	"nfxvault/pkgs/tokenx"

	"google.golang.org/grpc"
)

func Dial(addr, serviceID string, tok tokenx.Config) (*grpc.ClientConn, error) {
	if addr == "" {
		return nil, fmt.Errorf("empty grpc address for %s", serviceID)
	}
	provider := servertoken.NewProvider(
		&servertoken.HMACSigner{Key: []byte(tok.SecretKey)},
		tok.Issuer,
		serviceID,
	)
	return grpc.NewClient(addr, DefaultClientOptions(provider)...)
}
