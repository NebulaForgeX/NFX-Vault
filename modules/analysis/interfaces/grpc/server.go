package grpc

import (
	"nfxvault/modules/analysis/application/resource"
	systemapp "nfxvault/modules/analysis/application/system"
	grpcHandler "nfxvault/modules/analysis/interfaces/grpc/handler"
	"nfxvault/pkgs/grpcx/interceptor"
	"nfxvault/pkgs/security/token"
	"nfxvault/pkgs/security/token/servertoken"
	healthpb "nfxvault/protos/gen/common/health"
	systemstatepb "nfxvault/protos/gen/system/system_state"

	"google.golang.org/grpc"
)

type Deps interface {
	AppSvc() *systemapp.Service
	ResourceSvc() *resource.Service
	ServerTokenVerifier() token.Verifier
}

func NewServer(d Deps) *grpc.Server {
	s := grpc.NewServer(grpc.ChainUnaryInterceptor(interceptor.UnaryErrorHandler(), servertoken.UnaryAuthInterceptor(d.ServerTokenVerifier())))
	systemstatepb.RegisterSystemStateServiceServer(s, grpcHandler.NewSystemHandler(d.AppSvc()))
	healthpb.RegisterHealthServiceServer(s, grpcHandler.NewHealthHandler(d.ResourceSvc(), "system"))
	return s
}
