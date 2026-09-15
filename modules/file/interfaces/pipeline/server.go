package pipeline

import (
	"context"
	"time"

	"nfxvault/events"
	fileapp "nfxvault/modules/file/application/file"
	"nfxvault/pkgs/kafkax"
	"nfxvault/pkgs/kafkax/eventbus"
	"nfxvault/pkgs/logx"

	"github.com/ThreeDotsLabs/watermill/message"
	wmMiddleware "github.com/ThreeDotsLabs/watermill/message/router/middleware"
)

type Deps interface {
	KafkaConfig() *kafkax.Config
	BusPublisher() *eventbus.BusPublisher
	FileSvc() *fileapp.Service
}

type Router struct {
	*eventbus.EventRouter
	svc *fileapp.Service
}

func NewServer(d Deps) (*Router, error) {
	sub, err := kafkax.NewSubscriber(d.KafkaConfig())
	if err != nil {
		return nil, err
	}
	router, err := eventbus.NewEventRouter(sub, eventbus.EventRouterConfig{
		CloseTimeout: 10 * time.Second,
		Logger:       logx.NewZapWatermillLogger(logx.L()),
	})
	if err != nil {
		return nil, err
	}
	r := &Router{EventRouter: router, svc: d.FileSvc()}
	router.AddMiddleware(
		wmMiddleware.CorrelationID,
		wmMiddleware.Recoverer,
		wmMiddleware.Retry{MaxRetries: 3, InitialInterval: 200 * time.Millisecond, MaxInterval: 2 * time.Second, Multiplier: 2.0}.Middleware,
		wmMiddleware.Timeout(30*time.Second),
	)
	return r, nil
}

func (r *Router) RegisterRoutes() {
	eventbus.RegisterHandler(r.EventRouter, func(ctx context.Context, evt events.DeleteFolderEvent, msg *message.Message) error {
		return r.svc.HandleDeleteFolder(ctx, evt)
	})
	eventbus.RegisterHandler(r.EventRouter, func(ctx context.Context, evt events.DeleteFileOrFolderEvent, msg *message.Message) error {
		return r.svc.HandleDeleteFileOrFolder(ctx, evt)
	})
	eventbus.RegisterHandler(r.EventRouter, func(ctx context.Context, evt events.ExportCertificateEvent, msg *message.Message) error {
		return r.svc.HandleExportCertificate(ctx, evt)
	})
}

func (r *Router) Run(ctx context.Context) error {
	logx.S().Info("Starting pipeline router...")
	return r.Router.Run(ctx)
}

func (r *Router) Close() error { return r.Router.Close() }
