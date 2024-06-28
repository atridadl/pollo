package lib

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func InitSessionMiddleware() echo.MiddlewareFunc {
	authSecret := os.Getenv("AUTH_SECRET")
	if authSecret == "" {
		log.Fatal("AUTH_SECRET environment variable is not set.")
	}

	store := sessions.NewCookieStore([]byte(authSecret))
	return session.Middleware(store)
}

// SetSessionCookie sets a secure cookie with the session ID in the client's browser
func SetSessionCookie(w http.ResponseWriter, name, value string) {
	devMode := os.Getenv("DEVMODE") == "true"
	secureFlag := !devMode
	println("Secure flag: ", secureFlag)

	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureFlag,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   3600,
	})
}

// GetSessionCookie retrieves the session cookie value by its name
func GetSessionCookie(r *http.Request, name string) (string, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

// ClearSessionCookie clears the session cookie from the client's browser
func ClearSessionCookie(w http.ResponseWriter, name string) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("DEVMODE") != "true",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1, // Set MaxAge to -1 to delete the cookie immediately.
	})
}

// Checks if the user is signed in by checking the session cookie
func IsSignedIn(c echo.Context) bool {
	_, err := GetSessionCookie(c.Request(), "session_id")
	return err == nil
}

// GenerateRandomBytes returns securely generated random bytes.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}

	return b, nil
}

// GenerateSessionID generates a new session ID.
func GenerateSessionID() (string, error) {
	bytes, err := GenerateRandomBytes(16)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
