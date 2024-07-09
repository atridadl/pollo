package lib

import (
	"html/template"
	"path/filepath"
	"runtime"

	templatefs "pollo/pages/templates"

	"github.com/labstack/echo/v4"
)

type TemplateData struct {
	Props      interface{}
	IsLoggedIn bool
}

func RenderTemplate(c echo.Context, layout string, partials []string, props interface{}) error {
	// Get the name of the current file
	_, filename, _, _ := runtime.Caller(1)
	page := filepath.Base(filename)
	page = page[:len(page)-len(filepath.Ext(page))] // remove the file extension

	// Build the list of templates
	templates := []string{
		"layouts/" + layout + ".html",
		page + ".html",
	}
	for _, partial := range partials {
		templates = append(templates, "partials/"+partial+".html")
	}

	// Parse the templates
	ts, err := template.ParseFS(templatefs.FS, templates...)
	if err != nil {
		LogError.Print(err.Error())
		return err
	}

	// Wrap the props with the IsLoggedIn status
	isLoggedIn := IsSignedIn(c)
	templateData := TemplateData{
		Props:      props,
		IsLoggedIn: isLoggedIn,
	}

	// Execute the layout template with the wrapped props
	err = ts.ExecuteTemplate(c.Response().Writer, layout, templateData)
	if err != nil {
		LogError.Print(err.Error())
		return err
	}

	return nil
}
