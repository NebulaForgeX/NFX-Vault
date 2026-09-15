package grpc

import (
	"nfxvault/pkgs/grpcx/interceptor"
	"nfxvault/pkgs/security/token"
	"nfxvault/pkgs/security/token/servertoken"

	"google.golang.org/grpc"
)

type Deps interface {
	ServerTokenVerifier() token.Verifier
}

func NewServer(d Deps) *grpc.Server {
	return grpc.NewServer(grpc.ChainUnaryInterceptor(
		interceptor.UnaryErrorHandler(),
		servertoken.UnaryAuthInterceptor(d.ServerTokenVerifier()),
	))
}
