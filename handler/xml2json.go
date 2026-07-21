package handler

import (
	"bytes"
	"encoding/xml"
	"errors"
	"io"
	"strings"

	"github.com/basgys/goxml2json"
	"github.com/gin-gonic/gin"
	"github.com/miaogaolin/gotl/response"
)

func XmlToJson(c *gin.Context) {
	schema := c.PostForm("schema")
	if err := validateXML(schema); err != nil {
		response.Error(c, err)
		return
	}

	content := bytes.NewReader([]byte(schema))
	b, err := xml2json.Convert(content,
		xml2json.WithTypeConverter(xml2json.Float))
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, b.String())

}

func validateXML(schema string) error {
	if strings.TrimSpace(schema) == "" {
		return errors.New("XML content cannot be empty")
	}

	decoder := xml.NewDecoder(strings.NewReader(schema))
	for {
		_, err := decoder.Token()
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			return err
		}
	}
}
