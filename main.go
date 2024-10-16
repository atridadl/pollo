package main

import (
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"pollo/api"
	"pollo/api/webhooks"
	"pollo/lib"
	"pollo/pages"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

//go:embed public/*
var PublicFS embed.FS

func main() {
	// Load environment variables
	godotenv.Load(".env")

	// Initialize the database connection pool
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	if err := lib.InitializeDBPool(databaseURL); err != nil {
		log.Fatalf("Failed to initialize DB pool: %v", err)
	}

	// Initialize the database schema
	dbPool := lib.GetDBPool()
	if err := lib.InitializeSchema(dbPool); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// ------------------------------
	// Middlewares:
	// ------------------------------
	logMiddleware := middleware.Logger()
	recoverMiddleware := middleware.Recover()
	requestIDMiddleware := middleware.RequestID()
	securityMiddleware := middleware.Secure()
	gzipMiddleware := middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	})
	rateLimitMiddleware := middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(50))
	removeTrailingSlashMiddleware := middleware.RemoveTrailingSlash()

	// Initialize Echo router route groups
	e := echo.New()
	e.Pre(removeTrailingSlashMiddleware)
	e.Use(logMiddleware)
	e.Use(recoverMiddleware)
	e.Use(requestIDMiddleware)
	e.Use(securityMiddleware)
	e.Use(rateLimitMiddleware)
	e.Use(lib.InitSessionMiddleware())

	publicPageRoute := e.Group("", gzipMiddleware)
	protectedPageRoute := e.Group("", lib.AuthenticatedPageMiddleware, gzipMiddleware)
	authFlowPageRoute := e.Group("", lib.AuthFlowPageMiddleware, gzipMiddleware)
	publicApiRoute := e.Group("/api")
	protectedApiRoute := e.Group("/api", lib.AuthenticatedEndpointMiddleware)
	webhookGroup := e.Group("/webhook")

	// ------------------------------
	// Static Server:
	// ------------------------------
	fs := http.FS(PublicFS)
	e.GET("/public/*", echo.WrapHandler(http.FileServer(fs)))

	// ------------------------------
	// Page Routes:
	// ------------------------------
	publicPageRoute.GET("/", pages.Home)
	authFlowPageRoute.GET("/signin", pages.SignIn)
	authFlowPageRoute.GET("/register", pages.Register)
	protectedPageRoute.GET("/dashboard", pages.Dashboard)
	protectedPageRoute.GET("/room/:id", pages.Room)

	// ------------------------------
	// API Routes:
	// ------------------------------
	// Generic API routes (public)
	publicApiRoute.GET("/ping", api.Ping)
	publicApiRoute.GET("/sse", func(c echo.Context) error {
		return api.SSE(c)
	})

	// Auth routes (public)
	publicApiRoute.POST("/register", api.RegisterUserHandler)
	publicApiRoute.POST("/signin", api.SignInUserHandler)
	publicApiRoute.POST("/signout", api.SignOutUserHandler)

	// Rooms routes (protected)
	protectedApiRoute.POST("/room", api.CreateRoomHandler)
	protectedApiRoute.GET("/room", api.GetAllRoomsHandler)
	protectedApiRoute.DELETE("/room/:id", api.DeleteRoomHandler)

	// Webhook Routes:
	webhookGroup.POST("/clerk", webhooks.ClerkWebhookHandler)

	// Parse command-line arguments for IP and port
	ip := flag.String("ip", "", "IP address to bind the server to")
	port := flag.String("port", "3000", "Port to bind the server to")
	flag.Parse()

	// Start server with HTTP/2 support
	s := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", *ip, *port),
		Handler: e,
	}
	e.Logger.Fatal(e.StartServer(s))
	lib.LogSuccess.Println("Server started on port", *port)
}
