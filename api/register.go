package api

import (
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

func RegisterUserHandler(c echo.Context) error {
	name := c.FormValue("name")
	email := c.FormValue("email")
	password := c.FormValue("password")

	// Check if the email already exists
	existingUser, err := lib.GetUserByEmail(lib.GetDBPool(), email)
	if err == nil && existingUser != nil {
		// User with the given email already exists
		errorMessage := `<div id="error-message" style="color: red;">An account with this email already exists!</div>`
		return c.HTML(http.StatusBadRequest, errorMessage)
	}

	// Proceed with the existing registration logic
	hashedPassword, err := lib.HashPassword(password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to hash password")
	}

	user := lib.User{Name: name, Email: email, Password: hashedPassword}
	if err := lib.SaveUser(lib.GetDBPool(), &user); err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to save user")
	}

	// Redirect or respond with a success status code
	c.Response().Header().Set("HX-Redirect", "/signin")
	return c.NoContent(http.StatusOK)
}
