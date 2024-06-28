package api

import (
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

func SignInUserHandler(c echo.Context) error {
	email := c.FormValue("email")
	password := c.FormValue("password")

	// Example validation logic
	user, err := lib.GetUserByEmail(lib.GetDBPool(), email)
	if err != nil || !lib.CheckPasswordHash(password, user.Password) {
		errorMessage := `<div id="error-message" style="color: red;">Incorrect email or password</div>`
		return c.HTML(http.StatusUnauthorized, errorMessage)
	}

	// Generate a unique session ID for the user
	sessionID, err := lib.GenerateSessionID()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to generate session ID")
	}

	// Set the session cookie with the generated session ID
	lib.SetSessionCookie(c.Response().Writer, "session", lib.SessionData{
		SessionID: sessionID,
		Name:      user.Name,
		UserID:    user.ID,
		Email:     user.Email,
		Roles:     []string{"user"},
	})

	// Proceed with login success logic
	c.Response().Header().Set("HX-Redirect", "/")
	return c.NoContent(http.StatusOK)
}
