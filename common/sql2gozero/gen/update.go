package gen

import (
	"strings"

	"github.com/miaogaolin/gotl/common/sql2gozero/template"
	"github.com/zeromicro/go-zero/core/collection"
	"github.com/zeromicro/go-zero/tools/goctl/util"
	"github.com/zeromicro/go-zero/tools/goctl/util/pathx"
	"github.com/zeromicro/go-zero/tools/goctl/util/stringx"
)

func genUpdate(table Table, withCache, postgreSql bool) (string, string, error) {
	expressionValues := make([]string, 0)
	for _, field := range table.Fields {
		camel := field.Name.ToCamel()
		if camel == "CreateTime" || camel == "UpdateTime" {
			continue
		}

		if field.Name.Source() == table.PrimaryKey.Name.Source() {
			continue
		}

		expressionValues = append(expressionValues, "data."+camel)
	}

	keySet := collection.NewSet[string]()
	keyVariableSet := collection.NewSet[string]()
	keySet.Add(table.PrimaryCacheKey.DataKeyExpression)
	keyVariableSet.Add(table.PrimaryCacheKey.KeyLeft)
	for _, key := range table.UniqueCacheKey {
		keySet.Add(key.DataKeyExpression)
		keyVariableSet.Add(key.KeyLeft)
	}

	if postgreSql {
		expressionValues = append([]string{"data." + table.PrimaryKey.Name.ToCamel()}, expressionValues...)
	} else {
		expressionValues = append(expressionValues, "data."+table.PrimaryKey.Name.ToCamel())
	}
	camelTableName := table.Name.ToCamel()
	text, err := pathx.LoadTemplate(category, updateTemplateFile, template.Update)
	if err != nil {
		return "", "", err
	}

	output, err := util.With("update").
		Parse(text).
		Execute(map[string]interface{}{
			"withCache":             withCache,
			"upperStartCamelObject": camelTableName,
			"keys":                  strings.Join(keySet.Keys(), "\n"),
			"keyValues":             strings.Join(keyVariableSet.Keys(), ", "),
			"primaryCacheKey":       table.PrimaryCacheKey.DataKeyExpression,
			"primaryKeyVariable":    table.PrimaryCacheKey.KeyLeft,
			"lowerStartCamelObject": stringx.From(camelTableName).Untitle(),
			"originalPrimaryKey":    wrapWithRawString(table.PrimaryKey.Name.Source(), postgreSql),
			"expressionValues":      strings.Join(expressionValues, ", "),
			"postgreSql":            postgreSql,
			"data":                  table,
		})
	if err != nil {
		return "", "", nil
	}

	// update interface method
	text, err = pathx.LoadTemplate(category, updateMethodTemplateFile, template.UpdateMethod)
	if err != nil {
		return "", "", err
	}

	updateMethodOutput, err := util.With("updateMethod").
		Parse(text).
		Execute(map[string]interface{}{
			"upperStartCamelObject": camelTableName,
			"data":                  table,
		})
	if err != nil {
		return "", "", nil
	}

	return output.String(), updateMethodOutput.String(), nil
}
