package main

import (
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

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
	postgresHost := os.Getenv("POSTGRES_HOST")
	postgresPort := os.Getenv("POSTGRES_PORT")
	postgresUser := os.Getenv("POSTGRES_USER")
	postgresPassword := os.Getenv("POSTGRES_PASSWORD")
	postgresDB := os.Getenv("POSTGRES_DB")
	if postgresHost == "" || postgresPort == "" || postgresUser == "" || postgresPassword == "" || postgresDB == "" {
		log.Fatal("Darta environment variable is not set.")
	}

	portNumber, err := strconv.Atoi(postgresPort)
	if err != nil {
		log.Fatalf("Invalid database port: %v", err)
	}

	if err := lib.InitializeDBPool(postgresHost, postgresUser, postgresPassword, postgresDB, portNumber); err != nil {
		log.Fatalf("Failed to initialize DB pool: %v", err)
	}

	// Initialize the database schema
	dbPool := lib.GetDBPool()
	if err := lib.InitializeSchema(dbPool); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// Initialize Echo router
	e := echo.New()

	// Initialize the session store
	e.Use(lib.InitSessionMiddleware())

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.RequestID())
	e.Use(middleware.Secure())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(50)))

	// Static server
	fs := http.FS(PublicFS)
	e.GET("/public/*", echo.WrapHandler(http.FileServer(fs)))

	// Page routes
	e.GET("/", pages.Home)
	e.GET("/signin", pages.SignIn)
	e.GET("/register", pages.Register)
	e.GET("/dashboard", pages.Dashboard, lib.AuthenticatedMiddleware)

	// API Routes:
	apiGroup := e.Group("/api")
	apiGroup.GET("/ping", api.Ping)

	apiGroup.GET("/sse", func(c echo.Context) error {
		return api.SSE(c)
	})
	// Public routes
	apiGroup.POST("/register", api.RegisterUserHandler)
	apiGroup.POST("/signin", api.SignInUserHandler)
	apiGroup.POST("/signout", api.SignOutUserHandler)

	// Webhook Routes:
	webhookGroup := e.Group("/webhook")
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
