package pipeline

import (
	"context"
	"time"

	"nfxvault/pkgs/kafkax"
	"nfxvault/pkgs/kafkax/eventbus"
	"nfxvault/pkgs/logx"
)

type Deps interface {
	KafkaConfig() *kafkax.Config
	BusPublisher() *eventbus.BusPublisher
}

type Router struct {
	*eventbus.EventRouter
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
	return &Router{EventRouter: router}, nil
}

func (r *Router) RegisterRoutes() {}

func (r *Router) Run(ctx context.Context) error {
	logx.S().Info("Starting pipeline router...")
	return r.Router.Run(ctx)
}

func (r *Router) Close() error { return r.Router.Close() }
