package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"strings"

	"github.com/gin-gonic/gin"
	yaml "github.com/goccy/go-yaml"
	"github.com/miaogaolin/gotl/response"
)

func YamlToJson(c *gin.Context) {
	data, err := convertYAMLToJSON(c.PostForm("schema"))
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, data)
}

func convertYAMLToJSON(schema string) (string, error) {
	if strings.TrimSpace(schema) == "" {
		return "", errors.New("YAML content cannot be empty")
	}

	decoder := yaml.NewDecoder(strings.NewReader(schema), yaml.UseOrderedMap())
	var value interface{}
	if err := decoder.Decode(&value); err != nil {
		return "", err
	}

	var extra interface{}
	if err := decoder.Decode(&extra); err == nil {
		return "", errors.New("YAML content must contain exactly one document")
	} else if !errors.Is(err, io.EOF) {
		return "", err
	}

	data, err := yaml.MarshalWithOptions(value, yaml.JSON())
	if err != nil {
		return "", err
	}

	var compact bytes.Buffer
	if err := json.Compact(&compact, data); err != nil {
		return "", err
	}
	return compact.String(), nil
}
