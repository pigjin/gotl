package handler

import (
	"io/fs"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miaogaolin/gotl/frontend"
)

var toolPagePaths = []string{
	"/tools/json-to-go",
	"/tools/sql-to-ent",
	"/tools/sql-to-gorm",
	"/tools/sql-to-go-zero",
	"/tools/sql-to-es",
	"/tools/yaml-to-go",
	"/tools/yaml-to-json",
	"/tools/xml-to-json",
}

func registerWebRoutes(r *gin.Engine) {
	assets, err := fs.Sub(frontend.Files, "assets")
	if err != nil {
		panic(err)
	}

	r.StaticFS("/assets", http.FS(assets))
	r.GET("/", serveFrontend)
	for _, route := range toolPagePaths {
		r.GET(route, serveFrontend)
	}
}

func serveFrontend(c *gin.Context) {
	page, err := frontend.Files.ReadFile("index.html")
	if err != nil {
		c.String(http.StatusInternalServerError, "frontend is unavailable")
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", page)
}
