package main

import (
	"context"
	"errors"
	"fmt"

	"github.com/ddannyll/prepper/pkg/config"
	"github.com/ddannyll/prepper/pkg/dbconnection"

	_ "github.com/ddannyll/prepper/docs"
	"github.com/ddannyll/prepper/pkg/handlers"
	"github.com/ddannyll/prepper/pkg/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"

	"go.uber.org/fx"
)

// @title			prepper API
// @version		0.1
// @description	Backend API sepcifications for prepper
func newFiberServer(
	lc fx.Lifecycle,
	userHandler *handlers.UserHandler,
	pingHandler *handlers.PingHandler,
	authMiddleware *handlers.AuthMiddleware,
	config config.EnvVars,
) {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			ctx.Set(fiber.HeaderContentType, fiber.MIMETextPlainCharsetUTF8)
			// Overwrite the default error handler since we don't want to
			// send potentially sensitive information in the event of
			// unexpected errors

			// If a handled error (one that is passed as *fiber.Error)
			// we just send that back normally
			var e *fiber.Error
			if errors.As(err, &e) {
				return ctx.Status(e.Code).SendString(e.Error())
			}

			// Otherwise send Internal Server Error
			return ctx.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
		},
	})

	// Middleware
	app.Use(cors.New())
	app.Use(logger.New())

	// Docs
	app.Get("/swagger/*", swagger.HandlerDefault)

	// API Routes
	app.Get("/ping", pingHandler.Ping)
	userGroup := app.Group("/user")
	userGroup.Post("/signup", userHandler.SignUpUser)
	userGroup.Post("/signin", userHandler.SignInUser)
	userGroup.Post("/signout", userHandler.SignOutUser)
	userGroup.Get("/healthcheck", authMiddleware.AuthenticateRoute, userHandler.HealthCheckUser)

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			fmt.Printf("Starting Fiber - %s:%s\n", config.LISTEN_ON, config.PORT)
			go app.Listen(fmt.Sprintf("%s:%s", config.LISTEN_ON, config.PORT))
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return app.Shutdown()
		},
	})
}

func main2() {
	fx.New(
		fx.Provide(
			config.LoadEnv,

			dbconnection.GetDBClient,

			storage.NewSessionStorage,
			handlers.NewUserHandler,
			handlers.NewPingHandler,
			handlers.NewAuthMiddleware,
		),
		fx.Invoke(newFiberServer),
	).Run()
}