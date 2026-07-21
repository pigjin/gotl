(function (root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.GOTLSyntax = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const languageRules = {
    SQL: [
      rule("comment", /--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\//g),
      rule("string", /'(?:''|\\.|[^'\\])*'|"(?:""|\\.|[^"\\])*"|`(?:``|[^`])*`/g),
      rule("number", /\b(?:0x[\da-f]+|\d+(?:\.\d+)?)\b/gi),
      rule("keyword", keywordPattern([
        "ADD", "ALL", "ALTER", "AND", "AS", "ASC", "AUTO_INCREMENT", "BETWEEN", "BY", "CASE",
        "CHECK", "COLUMN", "COMMENT", "CONSTRAINT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_TIME",
        "CURRENT_TIMESTAMP", "DATABASE", "DEFAULT", "DELETE", "DESC", "DISTINCT", "DROP", "ELSE", "END",
        "ENGINE", "EXISTS", "FALSE", "FOREIGN", "FROM", "FULL", "GROUP", "HAVING", "IF", "IN", "INDEX",
        "INNER", "INSERT", "INTO", "IS", "JOIN", "KEY", "LEFT", "LIKE", "LIMIT", "MODIFY", "NOT", "NULL",
        "ON", "OR", "ORDER", "OUTER", "PRIMARY", "REFERENCES", "RIGHT", "SELECT", "SET", "TABLE", "THEN",
        "TRUE", "UNION", "UNIQUE", "UPDATE", "USE", "USING", "VALUES", "WHEN", "WHERE", "WITH"
      ])),
      rule("type", keywordPattern([
        "BIGINT", "BINARY", "BIT", "BLOB", "BOOLEAN", "CHAR", "DATE", "DATETIME", "DECIMAL", "DOUBLE",
        "ENUM", "FLOAT", "INT", "INTEGER", "JSON", "LONGBLOB", "LONGTEXT", "MEDIUMINT", "MEDIUMTEXT",
        "NUMERIC", "REAL", "SET", "SMALLINT", "TEXT", "TIME", "TIMESTAMP", "TINYINT", "TINYTEXT", "VARBINARY",
        "VARCHAR", "YEAR"
      ])),
      rule("operator", /<>|!=|<=|>=|:=|[-+*/%=<>]/g),
      rule("punctuation", /[(),.;]/g)
    ],
    GO: [
      rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//g),
      rule("string", /`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g),
      rule("number", /\b(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[bB][01](?:_?[01])*|0[oO][0-7](?:_?[0-7])*|\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?i?)\b/g),
      rule("keyword", keywordPattern([
        "break", "case", "chan", "const", "continue", "default", "defer", "else", "fallthrough", "for", "func",
        "go", "goto", "if", "import", "interface", "map", "package", "range", "return", "select", "struct",
        "switch", "type", "var"
      ], false)),
      rule("type", keywordPattern([
        "any", "bool", "byte", "comparable", "complex64", "complex128", "error", "float32", "float64", "int",
        "int8", "int16", "int32", "int64", "rune", "string", "uint", "uint8", "uint16", "uint32", "uint64",
        "uintptr"
      ], false)),
      rule("builtin", keywordPattern([
        "append", "cap", "clear", "close", "complex", "copy", "delete", "imag", "len", "make", "max", "min",
        "new", "panic", "print", "println", "real", "recover"
      ], false)),
      rule("literal", /\b(?:false|iota|nil|true)\b/g),
      rule("operator", /<<=?|>>=?|&\^=?|:=|\.\.\.|==|!=|<=|>=|&&|\|\||\+\+|--|[-+*/%&|^!<>=:]/g),
      rule("punctuation", /[()[\]{},.;]/g)
    ],
    JSON: [
      rule("key", /"(?:\\.|[^"\\])*"(?=\s*:)/g),
      rule("string", /"(?:\\.|[^"\\])*"/g),
      rule("number", /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g),
      rule("literal", /\b(?:false|null|true)\b/g),
      rule("punctuation", /[{}[\],:]/g)
    ],
    YAML: [
      rule("comment", /#[^\n]*/g),
      rule("string", /"(?:\\.|[^"\\])*"|'(?:''|[^'])*'/g),
      rule("key", /(?:^|\n)[ \t-]*[A-Za-z0-9_.-]+(?=\s*:)/g, renderYAMLKey),
      rule("number", /\b[-+]?(?:0x[\da-f]+|0o[0-7]+|\d+(?:\.\d+)?(?:e[-+]?\d+)?)\b/gi),
      rule("literal", /\b(?:false|null|true|yes|no|on|off|~)\b/gi),
      rule("meta", /(?:^|\n)%[^\n]*|[&*!][A-Za-z0-9_.-]+/g),
      rule("punctuation", /[{}[\],:|>]/g),
      rule("operator", /(^|\n)([ \t]*)-/g, renderYAMLDash)
    ]
  };

  function rule(name, pattern, render) {
    return { name: name, pattern: pattern, render: render };
  }

  function keywordPattern(words, ignoreCase) {
    return new RegExp("\\b(?:" + words.join("|") + ")\\b", ignoreCase === false ? "g" : "gi");
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function token(name, value) {
    return '<span class="syntax-' + name + '">' + escapeHTML(value) + "</span>";
  }

  function renderYAMLKey(value) {
    const match = value.match(/^(.*?)([A-Za-z0-9_.-]+)$/s);
    return match ? escapeHTML(match[1]) + token("key", match[2]) : token("key", value);
  }

  function renderYAMLDash(value) {
    const dashIndex = value.lastIndexOf("-");
    return escapeHTML(value.slice(0, dashIndex)) + token("operator", "-");
  }

  function renderXMLTag(value) {
    const match = value.match(/^<(\/?)([A-Za-z_][\w:.-]*)([\s\S]*?)(\/?)>$/);
    if (!match) return token("tag", value);

    let result = token("punctuation", "<" + match[1]) + token("tag", match[2]);
    const attributes = match[3];
    const attributePattern = /([A-Za-z_:][\w:.-]*)(\s*=\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
    let cursor = 0;
    let attributeMatch;

    while ((attributeMatch = attributePattern.exec(attributes))) {
      result += escapeHTML(attributes.slice(cursor, attributeMatch.index));
      result += token("attribute", attributeMatch[1]);
      result += token("operator", attributeMatch[2]);
      result += token("string", attributeMatch[3]);
      cursor = attributeMatch.index + attributeMatch[0].length;
    }

    result += escapeHTML(attributes.slice(cursor));
    result += token("punctuation", match[4] + ">");
    return result;
  }

  function highlightWithRules(source, rules) {
    let result = "";
    let cursor = 0;

    while (cursor < source.length) {
      let winner = null;

      rules.forEach(function (item, priority) {
        item.pattern.lastIndex = cursor;
        const match = item.pattern.exec(source);
        if (!match) return;
        if (!winner || match.index < winner.match.index || (match.index === winner.match.index && priority < winner.priority)) {
          winner = { item: item, match: match, priority: priority };
        }
      });

      if (!winner) {
        result += escapeHTML(source.slice(cursor));
        break;
      }

      result += escapeHTML(source.slice(cursor, winner.match.index));
      result += winner.item.render
        ? winner.item.render(winner.match[0])
        : token(winner.item.name, winner.match[0]);
      cursor = winner.match.index + winner.match[0].length;
    }

    return result;
  }

  function highlightXML(source) {
    return highlightWithRules(source, [
      rule("comment", /<!--[\s\S]*?-->/g),
      rule("meta", /<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>/gi),
      rule("tag", /<\/?[A-Za-z_][\w:.-]*(?:\s+[A-Za-z_:][\w:.-]*(?:\s*=\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'))?)*\s*\/?>/g, renderXMLTag),
      rule("entity", /&(?:#\d+|#x[\da-f]+|[A-Za-z][\w.-]*);/gi)
    ]);
  }

  function highlight(source, language) {
    const value = String(source == null ? "" : source);
    const normalizedLanguage = String(language || "").toUpperCase();

    if (normalizedLanguage === "XML") {
      return highlightXML(value);
    }

    const rules = languageRules[normalizedLanguage];
    return rules ? highlightWithRules(value, rules) : escapeHTML(value);
  }

  return {
    escapeHTML: escapeHTML,
    highlight: highlight
  };
});
