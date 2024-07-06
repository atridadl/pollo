package lib

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       string
	Name     string
	Email    string
	Password string
}

// HashPassword hashes the given password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash checks if the given password matches the hashed password.
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GetUserByEmail fetches a user by email from the database.
func GetUserByEmail(dbPool *pgxpool.Pool, email string) (*User, error) {
	if dbPool == nil {
		return nil, errors.New("database connection pool is not initialized")
	}

	var user User
	// Ensure the ID is being scanned as a string.
	err := dbPool.QueryRow(context.Background(), "SELECT id::text, name, email, password FROM users WHERE email = $1", email).Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByID fetches a user by ID from the database.
func GetUserByID(dbPool *pgxpool.Pool, id string) (*User, error) {
	if dbPool == nil {
		return nil, errors.New("database connection pool is not initialized")
	}

	var user User
	// Ensure the ID is being scanned as a string.
	err := dbPool.QueryRow(context.Background(), "SELECT id::text, name, email, password FROM users WHERE id = $1", id).Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// SaveUser saves a new user to the database.
func SaveUser(dbPool *pgxpool.Pool, user *User) error {
	if dbPool == nil {
		return errors.New("database connection pool is not initialized")
	}

	commandTag, err := dbPool.Exec(context.Background(), "INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)", GenerateNewID("user"), user.Name, user.Email, user.Password)
	if err != nil {
		return err
	}
	if commandTag.RowsAffected() != 1 {
		return errors.New("expected one row to be affected")
	}
	return nil
}

func AuthenticatedMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		isSignedIn := IsSignedIn(c)

		// Check if user is authenticated
		if !isSignedIn {
			// Redirect to signin page if not authenticated
			return c.Redirect(http.StatusFound, "/signin")
		}

		// Proceed with the request if authenticated
		return next(c)
	}
}
