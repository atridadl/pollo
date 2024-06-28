package api

import (
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

func RegisterUserHandler(c echo.Context) error {
	email := c.FormValue("email")
	password := c.FormValue("password")

	hashedPassword, err := lib.HashPassword(password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to hash password")
	}

	user := lib.User{Email: email, Password: hashedPassword}
	if err := lib.SaveUser(lib.GetDBPool(), &user); err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to save user")
	}

	sessionID, err := lib.GenerateSessionID()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to generate session ID")
	}

	// Set the session cookie using the helper function
	lib.SetSessionCookie(c.Response().Writer, "session_id", sessionID)

	// Redirect or respond with a success status code
	c.Response().Header().Set("HX-Redirect", "/")
	return c.NoContent(http.StatusOK)
}
