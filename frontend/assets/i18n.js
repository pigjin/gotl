(function (globalScope, factory) {
  "use strict";

  const languageModule = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = languageModule;
  }

  if (globalScope && globalScope.document) {
    globalScope.GOTLI18n = languageModule.createLanguageController();
    globalScope.GOTLI18n.initialize(globalScope);
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const storageKey = "gotl-language";
  const preferences = ["system", "zh-CN", "en"];

  const dictionaries = {
    "zh-CN": {
      shell: {
        metaDescription: "GOTL 是一个轻量、快速的在线 Go 开发工具箱。",
        skipLink: "跳到主要内容",
        homeAria: "返回 GOTL 首页",
        toolCount: "8 个工具",
        githubAria: "在 GitHub 查看 pigjin/gotl 项目",
        settings: "设置",
        settingsTitle: "外观与语言",
        language: "语言",
        theme: "主题",
        languageSystem: "跟随浏览器",
        languageChinese: "简体中文",
        languageEnglish: "English",
        themeSystem: "跟随系统",
        themeLight: "浅色",
        themeDark: "深色"
      },
      home: {
        eyebrow: "轻量 · 快速 · 即开即用",
        titleLead: "把格式转换",
        titleAccent: "变成顺手的小事。",
        lead: "GOTL 为 Go 开发者集中提供 SQL 代码生成与数据格式转换。选择工具、粘贴内容、立即获得结果。",
        openPrimary: "打开常用工具",
        shortcut: "工具页支持",
        consoleAria: "SQL 转 Go 代码示例",
        consoleSuccess: "转换完成 · 5 行代码已生成",
        collection: "工具合集",
        catalogTitle: "选择一个工具开始",
        catalogDescription: "每个工具拥有独立工作区与示例数据，输入只停留在当前页面，不做持久化保存。",
        openTool: "打开工具",
        footerGithubAria: "在 GitHub 查看 GOTL 项目"
      },
      groups: {
        sql: {
          label: "SQL 与代码生成",
          description: "把数据库定义与查询快速变成 Go 代码或搜索 DSL。"
        },
        data: {
          label: "数据格式转换",
          description: "在 JSON、YAML、XML 与 Go 类型之间整理结构。"
        }
      },
      tool: {
        workspaceAria: "{title} 转换工作区",
        example: "示例",
        clear: "清空",
        convert: "开始转换",
        copy: "复制结果",
        resultAria: "转换结果",
        emptyTitle: "结果会显示在这里",
        emptyDescription: "确认输入内容后，点击“开始转换”或使用键盘快捷键。",
        switchTool: "切换工具",
        rootType: "根类型名",
        cacheOption: "生成缓存访问代码",
        compact: "压缩",
        format: "格式化"
      },
      status: {
        waiting: "等待转换 · Ctrl/⌘ + Enter",
        empty: "尚未生成内容",
        exampleLoaded: "已填入示例，等待转换",
        inputCleared: "输入已清空",
        analyzing: "正在分析…",
        converting: "正在转换…",
        analyzingLocal: "正在浏览器内分析结构",
        requesting: "正在请求转换接口",
        complete: "转换完成",
        resultMeta: "{lines} 行 · {characters} 个字符"
      },
      toast: {
        jsonCompacted: "JSON 已压缩为单行",
        jsonFormatted: "JSON 已格式化展开",
        copied: "结果已复制到剪贴板",
        copyFailed: "复制失败，请手动选择结果"
      },
      errors: {
        inputRequired: "请先输入需要转换的内容",
        inputEmpty: "输入内容不能为空",
        conversionFailed: "转换失败，请检查输入内容",
        jsonModule: "JSON 转换模块加载失败，请刷新页面重试",
        jsonParse: "JSON 解析失败：{message}",
        jsonFormatter: "JSON 格式化模块加载失败，请刷新页面重试",
        invalidJSON: "当前结果不是有效的 JSON",
        jsonProcessing: "JSON 处理失败",
        network: "无法连接转换接口，请稍后重试",
        http: "接口请求失败（HTTP {status}）",
        invalidResponse: "接口返回了无法识别的数据",
        serverResponse: "服务端返回：{message}",
        missingResult: "接口没有返回转换结果"
      },
      notFound: {
        title: "页面不存在 · GOTL",
        heading: "没有找到这个工具",
        description: "请返回工具合集，选择一个可用的转换页面。",
        action: "返回工具合集"
      },
      tools: {
        "sql-to-ent": {
          title: "SQL → Ent",
          summary: "将 MySQL 建表语句转换为 Ent Schema。",
          description: "粘贴 MySQL CREATE TABLE 语句，生成可直接调整使用的 Ent 字段定义与 Schema 代码。",
          inputLabel: "MySQL DDL",
          outputLabel: "Ent Schema",
          placeholder: "在这里粘贴 CREATE TABLE 语句…",
          note: "接口根据 MySQL 字段类型和约束推断 Ent 字段；生成后请结合业务规则复核 Optional、Unique 等约束。"
        },
        "sql-to-gorm": {
          title: "SQL → GORM",
          summary: "从 MySQL DDL 生成 GORM Model。",
          description: "把表结构转换成带有 gorm 与 json 标签的 Go Model，适合快速建立数据访问层。",
          inputLabel: "MySQL DDL",
          outputLabel: "GORM Model",
          placeholder: "在这里粘贴 CREATE TABLE 语句…",
          note: "输出包含 package model、字段类型、GORM 标签和 JSON 标签；时间字段会自动补充 time 包引用。"
        },
        "sql-to-go-zero": {
          title: "SQL → Go-Zero",
          summary: "生成完整的 Go-Zero Model 代码。",
          description: "根据 MySQL 表结构生成 Go-Zero Model，可选择是否包含缓存访问逻辑。",
          inputLabel: "MySQL DDL",
          outputLabel: "Go-Zero Model",
          placeholder: "在这里粘贴 CREATE TABLE 语句…",
          note: "缓存模式会生成 sqlc.CachedConn 相关代码；关闭时使用普通 sqlx.SqlConn。一次建议只转换一张表。"
        },
        "sql-to-es": {
          title: "SQL → ES DSL",
          summary: "将查询 SQL 转换为 Elasticsearch DSL。",
          description: "用熟悉的 SELECT 查询描述筛选条件，快速获得对应的 Elasticsearch Query DSL。",
          inputLabel: "Select Query",
          outputLabel: "Elasticsearch DSL",
          placeholder: "例如：SELECT * FROM users WHERE status = 'active'…",
          note: "该转换器面向 SELECT 查询；复杂 SQL 的支持范围取决于后端 elasticsql 解析能力。"
        },
        "json-to-go": {
          title: "JSON → Go",
          summary: "在浏览器中将 JSON 推断为 Go Struct。",
          description: "解析 JSON 对象或数组，推断字段类型并生成带 json 标签的 Go 类型定义，内容不会发送到服务端。",
          inputLabel: "JSON Document",
          outputLabel: "Go Struct",
          placeholder: "在这里粘贴 JSON 数据…",
          note: "转换完全在当前浏览器内完成。数组字段会综合样本推断类型，生成结果仍建议执行 gofmt 并人工复核。"
        },
        "yaml-to-go": {
          title: "YAML → Go",
          summary: "将 YAML 配置转换为 Go Struct。",
          description: "从 YAML 键值、嵌套对象与数组生成带 yaml 标签的 Go 结构体。",
          inputLabel: "YAML Document",
          outputLabel: "Go Struct",
          placeholder: "在这里粘贴 YAML 配置…",
          note: "顶层类型固定为 AutoGenerated，字段名称会转换为导出的 Go 标识符并保留 yaml 标签。"
        },
        "yaml-to-json": {
          title: "YAML → JSON",
          summary: "将 YAML 文档转换为 JSON。",
          description: "解析 YAML 对象、数组、标量、锚点与别名，输出可压缩或展开的 JSON 数据。",
          inputLabel: "YAML Document",
          outputLabel: "JSON Document",
          placeholder: "在这里粘贴 YAML 数据…",
          note: "一次转换一个 YAML 文档；多个文档会返回错误，避免内容被静默忽略。"
        },
        "xml-to-json": {
          title: "XML → JSON",
          summary: "快速把 XML 文档转换为 JSON。",
          description: "解析 XML 节点与数值内容并输出 JSON 字符串，便于接口调试和数据迁移。",
          inputLabel: "XML Document",
          outputLabel: "JSON Document",
          placeholder: "在这里粘贴 XML 文档…",
          note: "数值节点会按后端转换规则推断类型；属性、重复节点等结构请在输出后确认是否符合目标数据模型。"
        }
      }
    },
    en: {
      shell: {
        metaDescription: "GOTL is a lightweight and fast online toolkit for Go developers.",
        skipLink: "Skip to main content",
        homeAria: "Back to the GOTL home page",
        toolCount: "8 tools",
        githubAria: "View pigjin/gotl on GitHub",
        settings: "Settings",
        settingsTitle: "Appearance and language",
        language: "Language",
        theme: "Theme",
        languageSystem: "Follow browser",
        languageChinese: "简体中文",
        languageEnglish: "English",
        themeSystem: "Follow system",
        themeLight: "Light",
        themeDark: "Dark"
      },
      home: {
        eyebrow: "Lightweight · Fast · Ready to use",
        titleLead: "Make conversions",
        titleAccent: "feel effortless.",
        lead: "GOTL brings SQL code generation and data format conversion together for Go developers. Pick a tool, paste your input, and get the result.",
        openPrimary: "Open a popular tool",
        shortcut: "Tool pages support",
        consoleAria: "SQL to Go code example",
        consoleSuccess: "Converted · 5 lines generated",
        collection: "Tool Collection",
        catalogTitle: "Choose a tool to begin",
        catalogDescription: "Each tool has its own workspace and sample data. Your input stays on the current page and is never saved.",
        openTool: "Open tool",
        footerGithubAria: "View the GOTL project on GitHub"
      },
      groups: {
        sql: {
          label: "SQL and code generation",
          description: "Turn database definitions and queries into Go code or search DSL."
        },
        data: {
          label: "Data format conversion",
          description: "Move structures between JSON, YAML, XML, and Go types."
        }
      },
      tool: {
        workspaceAria: "{title} conversion workspace",
        example: "Example",
        clear: "Clear",
        convert: "Convert",
        copy: "Copy result",
        resultAria: "Conversion result",
        emptyTitle: "Your result will appear here",
        emptyDescription: "Check the input, then select “Convert” or use the keyboard shortcut.",
        switchTool: "Switch tool",
        rootType: "Root type",
        cacheOption: "Generate cache access code",
        compact: "Compact",
        format: "Format"
      },
      status: {
        waiting: "Ready · Ctrl/⌘ + Enter",
        empty: "No result yet",
        exampleLoaded: "Example loaded and ready",
        inputCleared: "Input cleared",
        analyzing: "Analyzing…",
        converting: "Converting…",
        analyzingLocal: "Analyzing in your browser",
        requesting: "Requesting conversion",
        complete: "Conversion complete",
        resultMeta: "{lines} lines · {characters} characters"
      },
      toast: {
        jsonCompacted: "JSON compacted to one line",
        jsonFormatted: "JSON formatted with indentation",
        copied: "Result copied to the clipboard",
        copyFailed: "Copy failed; select the result manually"
      },
      errors: {
        inputRequired: "Enter content to convert first",
        inputEmpty: "Input cannot be empty",
        conversionFailed: "Conversion failed; check your input",
        jsonModule: "The JSON conversion module failed to load. Refresh and try again.",
        jsonParse: "JSON parsing failed: {message}",
        jsonFormatter: "The JSON formatting module failed to load. Refresh and try again.",
        invalidJSON: "The current result is not valid JSON",
        jsonProcessing: "JSON processing failed",
        network: "Could not reach the conversion service. Try again shortly.",
        http: "Conversion request failed (HTTP {status})",
        invalidResponse: "The service returned an unrecognized response",
        serverResponse: "Server response: {message}",
        missingResult: "The service did not return a conversion result"
      },
      notFound: {
        title: "Page not found · GOTL",
        heading: "This tool could not be found",
        description: "Return to the tool collection and choose an available converter.",
        action: "Back to all tools"
      },
      tools: {
        "sql-to-ent": {
          title: "SQL → Ent",
          summary: "Convert a MySQL table definition into an Ent Schema.",
          description: "Paste a MySQL CREATE TABLE statement to generate Ent fields and schema code ready for refinement.",
          inputLabel: "MySQL DDL",
          outputLabel: "Ent Schema",
          placeholder: "Paste a CREATE TABLE statement here…",
          note: "The converter infers Ent fields from MySQL types and constraints. Review Optional, Unique, and other business rules before use."
        },
        "sql-to-gorm": {
          title: "SQL → GORM",
          summary: "Generate a GORM model from MySQL DDL.",
          description: "Turn a table definition into a Go model with gorm and json tags for a quick data access layer.",
          inputLabel: "MySQL DDL",
          outputLabel: "GORM Model",
          placeholder: "Paste a CREATE TABLE statement here…",
          note: "Output includes package model, Go field types, GORM tags, and JSON tags. Time fields automatically add the time import."
        },
        "sql-to-go-zero": {
          title: "SQL → Go-Zero",
          summary: "Generate a complete Go-Zero model.",
          description: "Create a Go-Zero model from a MySQL table definition, with optional cache access code.",
          inputLabel: "MySQL DDL",
          outputLabel: "Go-Zero Model",
          placeholder: "Paste a CREATE TABLE statement here…",
          note: "Cache mode generates sqlc.CachedConn code; disabled mode uses sqlx.SqlConn. Convert one table at a time."
        },
        "sql-to-es": {
          title: "SQL → ES DSL",
          summary: "Convert a query into Elasticsearch DSL.",
          description: "Describe filters with familiar SELECT syntax and quickly get the matching Elasticsearch Query DSL.",
          inputLabel: "Select Query",
          outputLabel: "Elasticsearch DSL",
          placeholder: "For example: SELECT * FROM users WHERE status = 'active'…",
          note: "This converter targets SELECT queries. Complex SQL support depends on the backend elasticsql parser."
        },
        "json-to-go": {
          title: "JSON → Go",
          summary: "Infer Go structs from JSON in your browser.",
          description: "Parse a JSON object or array, infer field types, and generate Go definitions with json tags without sending content to the server.",
          inputLabel: "JSON Document",
          outputLabel: "Go Struct",
          placeholder: "Paste JSON data here…",
          note: "Conversion happens entirely in your browser. Arrays are inferred from their samples; run gofmt and review the generated types before use."
        },
        "yaml-to-go": {
          title: "YAML → Go",
          summary: "Convert YAML configuration into Go structs.",
          description: "Generate Go structs with yaml tags from YAML keys, nested objects, and arrays.",
          inputLabel: "YAML Document",
          outputLabel: "Go Struct",
          placeholder: "Paste YAML configuration here…",
          note: "The root type is AutoGenerated. Keys become exported Go identifiers while preserving their yaml tags."
        },
        "yaml-to-json": {
          title: "YAML → JSON",
          summary: "Convert a YAML document into JSON.",
          description: "Parse YAML objects, arrays, scalars, anchors, and aliases into compact or formatted JSON.",
          inputLabel: "YAML Document",
          outputLabel: "JSON Document",
          placeholder: "Paste YAML data here…",
          note: "Convert one YAML document at a time. Multiple documents return an error instead of being silently ignored."
        },
        "xml-to-json": {
          title: "XML → JSON",
          summary: "Quickly convert an XML document into JSON.",
          description: "Parse XML nodes and numeric content into JSON for API debugging or data migration.",
          inputLabel: "XML Document",
          outputLabel: "JSON Document",
          placeholder: "Paste an XML document here…",
          note: "Numeric nodes follow backend inference rules. Review attributes and repeated nodes against your target data model."
        }
      }
    }
  };

  function isPreference(value) {
    return preferences.includes(value);
  }

  function getPath(source, path) {
    return String(path).split(".").reduce(function (value, part) {
      return value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined;
    }, source);
  }

  function interpolate(value, params) {
    return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g, function (match, key) {
      return params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match;
    });
  }

  function resolveBrowserLocale(scope) {
    const browserLanguages = scope.navigator && Array.isArray(scope.navigator.languages)
      ? scope.navigator.languages
      : [];
    const candidates = browserLanguages.length
      ? browserLanguages
      : [scope.navigator && (scope.navigator.language || scope.navigator.userLanguage)];
    const primary = String(candidates.find(Boolean) || "en").toLowerCase();
    return primary === "zh" || primary.startsWith("zh-") ? "zh-CN" : "en";
  }

  function createLanguageController() {
    let selectedPreference = "system";
    let activeLocale = "zh-CN";
    const listeners = new Set();

    function readStoredPreference(scope) {
      try {
        const value = scope.localStorage.getItem(storageKey);
        return isPreference(value) ? value : "system";
      } catch (_) {
        return "system";
      }
    }

    function storePreference(scope, preference) {
      try {
        scope.localStorage.setItem(storageKey, preference);
      } catch (_) {
        // The selected language still applies to this page when storage is unavailable.
      }
    }

    function resolveLocale(scope, preference) {
      return preference === "system" ? resolveBrowserLocale(scope) : preference;
    }

    function updateDocument(scope) {
      const root = scope.document && scope.document.documentElement;
      if (root) root.setAttribute("lang", activeLocale);
      const description = scope.document && scope.document.querySelector('meta[name="description"]');
      if (description) description.setAttribute("content", translate("shell.metaDescription"));
    }

    function notify() {
      listeners.forEach(function (listener) {
        listener({ preference: selectedPreference, locale: activeLocale });
      });
    }

    function initialize(scope) {
      selectedPreference = readStoredPreference(scope);
      activeLocale = resolveLocale(scope, selectedPreference);
      updateDocument(scope);
      return activeLocale;
    }

    function setPreference(scope, preference) {
      selectedPreference = isPreference(preference) ? preference : "system";
      activeLocale = resolveLocale(scope, selectedPreference);
      storePreference(scope, selectedPreference);
      updateDocument(scope);
      notify();
      return activeLocale;
    }

    function translate(path, params) {
      const localizedValue = getPath(dictionaries[activeLocale], path);
      const fallbackValue = getPath(dictionaries["zh-CN"], path);
      const value = typeof localizedValue === "undefined" ? fallbackValue : localizedValue;
      return interpolate(typeof value === "undefined" ? path : value, params);
    }

    function subscribe(listener) {
      listeners.add(listener);
      return function () {
        listeners.delete(listener);
      };
    }

    return {
      initialize: initialize,
      locale: function () { return activeLocale; },
      preference: function () { return selectedPreference; },
      setPreference: setPreference,
      subscribe: subscribe,
      t: translate
    };
  }

  return {
    createLanguageController: createLanguageController,
    dictionaries: dictionaries,
    isPreference: isPreference,
    preferences: preferences,
    resolveBrowserLocale: resolveBrowserLocale,
    storageKey: storageKey
  };
});
