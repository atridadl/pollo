package lib

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type SessionData struct {
	SessionID string   `json:"sessionID"`
	UserID    string   `json:"userId"`
	Name      string   `json:"name"`
	Email     string   `json:"email"`
	Roles     []string `json:"roles"`
}

func InitSessionMiddleware() echo.MiddlewareFunc {
	authSecret := os.Getenv("AUTH_SECRET")
	if authSecret == "" {
		log.Fatal("AUTH_SECRET environment variable is not set.")
	}

	store := sessions.NewCookieStore([]byte(authSecret))
	return session.Middleware(store)
}

// Adjusted SetSessionCookie to include more user info
func SetSessionCookie(w http.ResponseWriter, name string, sessionData SessionData) error {
	// Create session in database
	expiresAt := time.Now().Add(48 * time.Hour) // Set expiration to 1 hour from now
	sessionID, err := CreateSession(GetDBPool(), sessionData.UserID, expiresAt)
	if err != nil {
		return err
	}

	sessionData.SessionID = sessionID

	// Serialize session data
	dataBytes, err := json.Marshal(sessionData)
	if err != nil {
		return err
	}

	// Encrypt serialized session data
	encryptedData, err := Encrypt(dataBytes)
	if err != nil {
		return err
	}

	// Set cookie with encrypted data
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    encryptedData,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("DEVMODE") != "true",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   3600, // 1 hour
	})

	return nil
}

// Adjusted GetSessionCookie to return SessionData
func GetSessionCookie(r *http.Request, name string) (*SessionData, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return nil, err
	}

	// Decrypt the cookie value
	decryptedValue, err := Decrypt(cookie.Value)
	if err != nil {
		return nil, err
	}

	// Deserialize session data
	var sessionData SessionData
	err = json.Unmarshal([]byte(decryptedValue), &sessionData)
	if err != nil {
		return nil, err
	}

	return &sessionData, nil
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
		MaxAge:   -1, // This will delete the cookie
	})
}

// Checks if the user is signed in by checking the session cookie
func IsSignedIn(c echo.Context) bool {
	sessionData, err := GetSessionCookie(c.Request(), "session")
	if err != nil {
		log.Printf("Error retrieving session cookie: %v", err)
		return false
	}

	// Validate the session in the database
	validSessionData, err := ValidateSession(GetDBPool(), sessionData.SessionID)
	if err != nil || validSessionData == nil {
		log.Printf("Invalid session: %v", err)
		ClearSessionCookie(c.Response().Writer, "session")
		return false
	}

	return true
}

// GenerateSessionID generates a new session ID.
func GenerateSessionID() (string, error) {
	bytes, err := GenerateRandomBytes(16)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func CreateSession(dbPool *pgxpool.Pool, userID string, expiresAt time.Time) (string, error) {
	sessionID := GenerateNewID("session")
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
		sessionID, userID, expiresAt)
	if err != nil {
		return "", err
	}
	return sessionID, nil
}

func ValidateSession(dbPool *pgxpool.Pool, sessionID string) (*SessionData, error) {
	var userID string
	var expiresAt time.Time
	err := dbPool.QueryRow(context.Background(),
		"SELECT user_id, expires_at FROM sessions WHERE id = $1 AND expires_at > NOW()",
		sessionID).Scan(&userID, &expiresAt)
	if err != nil {
		return nil, err
	}

	user, err := GetUserByID(dbPool, userID)
	if err != nil {
		return nil, err
	}

	return &SessionData{
		SessionID: sessionID,
		UserID:    user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Roles:     []string{"user"},
	}, nil
}

func DeleteSession(dbPool *pgxpool.Pool, sessionID string) error {
	_, err := dbPool.Exec(context.Background(),
		"DELETE FROM sessions WHERE id = $1", sessionID)
	return err
}
