package lib

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
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

// Returns the first 32 bytes of the SHA-256 hash of the ENCRYPTION_KEY environment variable
func getEncryptionKey() []byte {
	key := []byte(os.Getenv("ENCRYPTION_KEY"))
	hash := sha256.Sum256(key)
	return hash[:32] // Use the first 32 bytes for AES-256
}

// Encrypt data using AES
func encrypt(data []byte) (string, error) {
	encryptionKey := getEncryptionKey()
	fmt.Printf("Encryption Key Length: %d\n", len(encryptionKey))

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	_, err = rand.Read(nonce)
	if err != nil {
		return "", err
	}
	cipherText := gcm.Seal(nonce, nonce, data, nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

// decrypt decrypts the data using AES-GCM.
func decrypt(encryptedString string) (string, error) {
	encryptionKey := getEncryptionKey()

	data, err := base64.StdEncoding.DecodeString(encryptedString)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// Adjusted SetSessionCookie to include more user info
func SetSessionCookie(w http.ResponseWriter, name string, sessionData SessionData) {
	// Serialize session data
	dataBytes, err := json.Marshal(sessionData)
	if err != nil {
		log.Fatal("Failed to serialize session data:", err)
	}

	// Encrypt serialized session data
	encryptedData, err := encrypt(dataBytes)
	if err != nil {
		log.Fatal("Failed to encrypt session data:", err)
	}

	// Set cookie with encrypted data
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    encryptedData,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("DEVMODE") != "true",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   3600,
	})
}

// Adjusted GetSessionCookie to return SessionData
func GetSessionCookie(r *http.Request, name string) (*SessionData, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return nil, err
	}

	// Decrypt the cookie value
	decryptedValue, err := decrypt(cookie.Value)
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

	// Validate the session data by checking if the user exists in the database
	user, err := GetUserByID(GetDBPool(), sessionData.UserID)
	if err != nil || user == nil {
		log.Printf("Session refers to a non-existent user: %v", err)
		ClearSessionCookie(c.Response().Writer, "session")
		return false
	}

	return true
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
