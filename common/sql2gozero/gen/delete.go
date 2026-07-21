package gen

import (
	"strings"

	"github.com/miaogaolin/gotl/common/sql2gozero/template"
	"github.com/zeromicro/go-zero/core/collection"
	"github.com/zeromicro/go-zero/tools/goctl/util"
	"github.com/zeromicro/go-zero/tools/goctl/util/pathx"
	"github.com/zeromicro/go-zero/tools/goctl/util/stringx"
)

func genDelete(table Table, withCache, postgreSql bool) (string, string, error) {
	keySet := collection.NewSet[string]()
	keyVariableSet := collection.NewSet[string]()
	keySet.Add(table.PrimaryCacheKey.KeyExpression)
	keyVariableSet.Add(table.PrimaryCacheKey.KeyLeft)
	for _, key := range table.UniqueCacheKey {
		keySet.Add(key.DataKeyExpression)
		keyVariableSet.Add(key.KeyLeft)
	}

	camel := table.Name.ToCamel()
	text, err := pathx.LoadTemplate(category, deleteTemplateFile, template.Delete)
	if err != nil {
		return "", "", err
	}

	output, err := util.With("delete").
		Parse(text).
		Execute(map[string]interface{}{
			"upperStartCamelObject":     camel,
			"withCache":                 withCache,
			"containsIndexCache":        table.ContainsUniqueCacheKey,
			"lowerStartCamelPrimaryKey": stringx.From(table.PrimaryKey.Name.ToCamel()).Untitle(),
			"dataType":                  table.PrimaryKey.DataType,
			"keys":                      strings.Join(keySet.Keys(), "\n"),
			"originalPrimaryKey":        wrapWithRawString(table.PrimaryKey.Name.Source(), postgreSql),
			"keyValues":                 strings.Join(keyVariableSet.Keys(), ", "),
			"postgreSql":                postgreSql,
			"data":                      table,
		})
	if err != nil {
		return "", "", err
	}

	// interface method
	text, err = pathx.LoadTemplate(category, deleteMethodTemplateFile, template.DeleteMethod)
	if err != nil {
		return "", "", err
	}

	deleteMethodOut, err := util.With("deleteMethod").
		Parse(text).
		Execute(map[string]interface{}{
			"lowerStartCamelPrimaryKey": stringx.From(table.PrimaryKey.Name.ToCamel()).Untitle(),
			"dataType":                  table.PrimaryKey.DataType,
			"data":                      table,
		})
	if err != nil {
		return "", "", err
	}

	return output.String(), deleteMethodOut.String(), nil
}
