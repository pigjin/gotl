(function () {
  "use strict";

  const githubURL = "https://github.com/pigjin/gotl";
  const i18n = window.GOTLI18n;
  const theme = window.GOTLTheme;
  const tools = [
    { slug: "sql-to-ent", group: "sql", glyph: "ENT", endpoint: "/sql2ent", field: "ddl", inputLanguage: "SQL", outputLanguage: "GO", tint: "#e3eefc" },
    { slug: "sql-to-gorm", group: "sql", glyph: "GRM", endpoint: "/sql2gorm", field: "ddl", inputLanguage: "SQL", outputLanguage: "GO", tint: "#dff4f0" },
    { slug: "sql-to-go-zero", group: "sql", glyph: "GZ", endpoint: "/sql2gozero", field: "ddl", inputLanguage: "SQL", outputLanguage: "GO", option: "cache", tint: "#f2e9fb" },
    { slug: "sql-to-es", group: "sql", glyph: "ES", endpoint: "/sql2es", field: "schema", inputLanguage: "SQL", outputLanguage: "JSON", tint: "#fcefdc" },
    { slug: "json-to-go", group: "data", glyph: "{ }", local: true, inputLanguage: "JSON", outputLanguage: "GO", option: "typeName", tint: "#dff4f0" },
    { slug: "yaml-to-go", group: "data", glyph: "YML", endpoint: "/yaml2go", field: "schema", inputLanguage: "YAML", outputLanguage: "GO", tint: "#e7edf9" },
    { slug: "yaml-to-json", group: "data", glyph: "Y/J", endpoint: "/yaml2json", field: "schema", inputLanguage: "YAML", outputLanguage: "JSON", tint: "#e8f3e5" },
    { slug: "xml-to-json", group: "data", glyph: "XML", endpoint: "/xml2json", field: "schema", inputLanguage: "XML", outputLanguage: "JSON", tint: "#f9e8e8" }
  ];
  const groupKeys = ["sql", "data"];
  const app = document.getElementById("app");
  const toast = document.getElementById("toast");
  const toolStates = new Map();
  const pathname = normalizePath(window.location.pathname);
  let toastTimer;
  let currentToast = null;

  bindShellInteractions();
  localizeShell();
  syncSettingsControls();
  renderCurrentRoute();

  i18n.subscribe(function () {
    localizeShell();
    syncSettingsControls();
    refreshToast();
    renderCurrentRoute();
  });
  theme.subscribe(function () {
    syncSettingsControls();
  });

  function t(key, params) {
    return i18n.t(key, params);
  }

  function normalizePath(path) {
    if (!path || path === "/") return "/";
    return path.replace(/\/+$/, "");
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function highlightCode(value, language) {
    if (window.GOTLSyntax && typeof window.GOTLSyntax.highlight === "function") {
      return window.GOTLSyntax.highlight(value, language);
    }
    return escapeHTML(value);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function localizeShell() {
    setText("skip-link", t("shell.skipLink"));
    setText("header-tool-count", t("shell.toolCount"));
    setText("settings-toggle-label", t("shell.settings"));
    setText("settings-title", t("shell.settingsTitle"));
    setText("language-legend", t("shell.language"));
    setText("language-system-label", t("shell.languageSystem"));
    setText("language-zh-label", t("shell.languageChinese"));
    setText("language-en-label", t("shell.languageEnglish"));
    setText("theme-legend", t("shell.theme"));
    setText("theme-system-label", t("shell.themeSystem"));
    setText("theme-light-label", t("shell.themeLight"));
    setText("theme-dark-label", t("shell.themeDark"));

    const brand = document.getElementById("brand-link");
    const github = document.getElementById("header-github-link");
    const settingsToggle = document.getElementById("settings-toggle");
    if (brand) brand.setAttribute("aria-label", t("shell.homeAria"));
    if (github) {
      github.setAttribute("aria-label", t("shell.githubAria"));
      github.setAttribute("title", t("shell.githubAria"));
    }
    if (settingsToggle) {
      settingsToggle.setAttribute("aria-label", t("shell.settingsTitle"));
      settingsToggle.setAttribute("title", t("shell.settingsTitle"));
    }
  }

  function bindShellInteractions() {
    const control = document.getElementById("settings-control");
    const toggle = document.getElementById("settings-toggle");
    const menu = document.getElementById("settings-menu");
    if (!control || !toggle || !menu) return;

    function closeSettings(restoreFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggle.focus();
    }

    function openSettings() {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      syncSettingsControls();
      window.requestAnimationFrame(function () {
        const checked = menu.querySelector('input[type="radio"]:checked');
        if (checked) checked.focus();
      });
    }

    toggle.addEventListener("click", function () {
      if (menu.hidden) openSettings();
      else closeSettings(false);
    });

    document.addEventListener("pointerdown", function (event) {
      if (!menu.hidden && !control.contains(event.target)) closeSettings(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.hidden) {
        event.preventDefault();
        closeSettings(true);
      }
    });

    menu.querySelectorAll('input[name="language-preference"]').forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.checked) i18n.setPreference(window, input.value);
      });
    });
    menu.querySelectorAll('input[name="theme-preference"]').forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.checked) theme.setPreference(window, input.value);
      });
    });
  }

  function syncSettingsControls() {
    const languageInput = document.querySelector(`input[name="language-preference"][value="${i18n.preference()}"]`);
    const themeInput = document.querySelector(`input[name="theme-preference"][value="${theme.preference()}"]`);
    if (languageInput) languageInput.checked = true;
    if (themeInput) themeInput.checked = true;
  }

  function renderCurrentRoute() {
    if (pathname === "/") {
      renderHome();
      return;
    }

    const match = pathname.match(/^\/tools\/([^/]+)$/);
    const tool = match ? tools.find(function (item) { return item.slug === match[1]; }) : null;
    if (tool) renderTool(tool);
    else renderNotFound();
  }

  function toolCopy(tool) {
    const prefix = `tools.${tool.slug}`;
    return {
      title: t(`${prefix}.title`),
      summary: t(`${prefix}.summary`),
      description: t(`${prefix}.description`),
      inputLabel: t(`${prefix}.inputLabel`),
      outputLabel: t(`${prefix}.outputLabel`),
      placeholder: t(`${prefix}.placeholder`),
      note: t(`${prefix}.note`)
    };
  }

  function renderHome() {
    document.title = "GOTL · Online Go Tools";
    document.body.classList.remove("tool-page");
    app.innerHTML = `
      <main id="main-content" class="home-page">
        <section class="home-hero" aria-labelledby="hero-title">
          <div class="hero-copy">
            <p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>${escapeHTML(t("home.eyebrow"))}</p>
            <h1 id="hero-title">${escapeHTML(t("home.titleLead"))}<span>${escapeHTML(t("home.titleAccent"))}</span></h1>
            <p class="hero-lead">${escapeHTML(t("home.lead"))}</p>
            <div class="hero-actions">
              <a class="primary-link" href="/tools/sql-to-gorm">${escapeHTML(t("home.openPrimary"))} <span class="arrow" aria-hidden="true">→</span></a>
              <span class="shortcut-note">${escapeHTML(t("home.shortcut"))} <kbd>Ctrl/⌘</kbd> + <kbd>Enter</kbd></span>
            </div>
          </div>
          <div class="hero-console" aria-label="${escapeHTML(t("home.consoleAria"))}">
            <div class="console-top">
              <span class="console-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span>model.go</span>
              <span>GOTL</span>
            </div>
            <div class="console-body" aria-hidden="true">
              <div class="console-line"><span class="line-no">01</span><span><span class="code-keyword">type</span> User <span class="code-keyword">struct</span> {</span></div>
              <div class="console-line"><span class="line-no">02</span><span>&nbsp;&nbsp;ID <span class="code-type">int64</span> <span class="code-string">&#96;json:&quot;id&quot;&#96;</span></span></div>
              <div class="console-line"><span class="line-no">03</span><span>&nbsp;&nbsp;Name <span class="code-type">string</span> <span class="code-string">&#96;json:&quot;name&quot;&#96;</span></span></div>
              <div class="console-line"><span class="line-no">04</span><span>&nbsp;&nbsp;Active <span class="code-type">bool</span> <span class="code-string">&#96;json:&quot;active&quot;&#96;</span></span></div>
              <div class="console-line"><span class="line-no">05</span><span>}</span></div>
              <div class="console-success">${escapeHTML(t("home.consoleSuccess"))}</div>
            </div>
          </div>
        </section>

        <section id="tools" class="catalog-section" aria-labelledby="catalog-title">
          <div class="section-heading">
            <div>
              <p class="section-kicker">${escapeHTML(t("home.collection"))}</p>
              <h2 id="catalog-title">${escapeHTML(t("home.catalogTitle"))}</h2>
            </div>
            <p>${escapeHTML(t("home.catalogDescription"))}</p>
          </div>
          ${renderToolGroups()}
        </section>

        <footer class="site-footer">
          <span>GOTL · Online Go Tools</span>
          <a class="footer-github-link" href="${githubURL}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(t("home.footerGithubAria"))}">GitHub · pigjin/gotl <span aria-hidden="true">↗</span></a>
        </footer>
      </main>`;
  }

  function renderToolGroups() {
    return groupKeys.map(function (groupKey) {
      const cards = tools.filter(function (tool) {
        return tool.group === groupKey;
      }).map(function (tool) {
        const copy = toolCopy(tool);
        const index = String(tools.indexOf(tool) + 1).padStart(2, "0");
        return `
          <a class="tool-card" href="/tools/${tool.slug}" style="--card-tint:${tool.tint}">
            <div class="card-top">
              <span class="tool-glyph" aria-hidden="true">${escapeHTML(tool.glyph)}</span>
              <span class="card-number">${index}</span>
            </div>
            <h3>${escapeHTML(copy.title)}</h3>
            <p>${escapeHTML(copy.summary)}</p>
            <span class="card-link-label">${escapeHTML(t("home.openTool"))} <span aria-hidden="true">→</span></span>
          </a>`;
      }).join("");

      return `
        <div class="tool-group">
          <h3 class="group-title">${escapeHTML(t(`groups.${groupKey}.label`))} · ${escapeHTML(t(`groups.${groupKey}.description`))}</h3>
          <div class="tool-grid">${cards}</div>
        </div>`;
    }).join("");
  }

  function getToolState(tool) {
    if (!toolStates.has(tool.slug)) {
      toolStates.set(tool.slug, {
        input: exampleFor(tool),
        output: "",
        hasOutput: false,
        busy: false,
        cache: false,
        typeName: "AutoGenerated",
        status: { key: "status.waiting", params: null, kind: "" },
        outputStatus: { key: "status.empty", params: null, kind: "" },
        renderVersion: 0
      });
    }
    return toolStates.get(tool.slug);
  }

  function statusText(status) {
    return status && status.key ? t(status.key, status.params) : "";
  }

  function renderTool(tool) {
    const copy = toolCopy(tool);
    const state = getToolState(tool);
    state.renderVersion += 1;
    const version = state.renderVersion;
    document.title = `${copy.title} · GOTL`;
    document.body.classList.add("tool-page");
    app.innerHTML = `
      <div class="tool-layout">
        ${renderSidebar(tool)}
        <main id="main-content" class="tool-main">
          ${renderMobileToolNav(tool)}
          <section id="tool-workspace" class="workspace" aria-label="${escapeHTML(t("tool.workspaceAria", { title: copy.title }))}"${state.busy ? ' aria-busy="true"' : ""}>
            <article class="editor-panel">
              <header class="panel-header input-panel-header${tool.option ? " has-option" : ""}">
                <div class="panel-title">
                  <span>${escapeHTML(copy.inputLabel)}</span>
                  <span class="panel-language">${escapeHTML(tool.inputLanguage)}</span>
                </div>
                ${renderOptionStrip(tool, state)}
                <div class="panel-actions">
                  <button id="example-button" class="ghost-button" type="button"${state.busy ? " disabled" : ""}>${escapeHTML(t("tool.example"))}</button>
                  <button id="clear-button" class="ghost-button" type="button"${state.busy ? " disabled" : ""}>${escapeHTML(t("tool.clear"))}</button>
                </div>
              </header>
              <label class="sr-only" for="tool-input">${escapeHTML(copy.inputLabel)}</label>
              <div class="code-editor">
                <pre id="tool-input-highlight" class="code-highlight" aria-hidden="true"><code></code></pre>
                <textarea id="tool-input" class="code-input" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${escapeHTML(copy.placeholder)}"></textarea>
              </div>
              <footer class="panel-footer">
                <div id="tool-status" class="panel-status${state.status.kind ? ` ${state.status.kind}` : ""}" role="status" aria-live="polite">${escapeHTML(statusText(state.status))}</div>
                <button id="convert-button" class="primary-button convert-button" type="button"${state.busy ? " disabled" : ""}>${escapeHTML(state.busy ? t(tool.local ? "status.analyzing" : "status.converting") : t("tool.convert"))}${state.busy ? "" : ' <span aria-hidden="true">→</span>'}</button>
              </footer>
            </article>

            <article id="output-panel" class="editor-panel${state.hasOutput ? " has-output" : ""}">
              <header class="panel-header output-panel-header${tool.outputLanguage === "JSON" ? " has-json-actions" : ""}">
                <div class="panel-title">
                  <span>${escapeHTML(copy.outputLabel)}</span>
                  <span class="panel-language">${escapeHTML(tool.outputLanguage)}</span>
                </div>
                <div class="panel-actions">
                  ${renderJSONActions(tool, state)}
                  <button id="copy-button" class="ghost-button" type="button"${state.hasOutput && !state.busy ? "" : " disabled"}>${escapeHTML(t("tool.copy"))}</button>
                </div>
              </header>
              <div class="output-wrap">
                <pre id="tool-output" class="code-output" tabindex="0" aria-label="${escapeHTML(t("tool.resultAria"))}"><code>${state.hasOutput ? highlightCode(state.output, tool.outputLanguage) : ""}</code></pre>
                <div class="empty-output" aria-hidden="true">
                  <span class="empty-output-mark">→_</span>
                  <strong>${escapeHTML(t("tool.emptyTitle"))}</strong>
                  <span>${escapeHTML(t("tool.emptyDescription"))}</span>
                </div>
              </div>
              <footer class="panel-footer">
                <div id="output-meta" class="panel-status${state.outputStatus.kind ? ` ${state.outputStatus.kind}` : ""}">${escapeHTML(statusText(state.outputStatus))}</div>
              </footer>
            </article>
          </section>
        </main>
      </div>`;

    bindToolInteractions(tool, state, version);
  }

  function renderSidebar(activeTool) {
    return `<aside class="tool-sidebar">${groupKeys.map(function (groupKey) {
      const links = tools.filter(function (tool) {
        return tool.group === groupKey;
      }).map(function (tool) {
        const copy = toolCopy(tool);
        const active = tool.slug === activeTool.slug;
        return `
          <a class="sidebar-link${active ? " active" : ""}" href="/tools/${tool.slug}"${active ? ' aria-current="page"' : ""}>
            <span class="sidebar-glyph" aria-hidden="true">${escapeHTML(tool.glyph)}</span>
            <span>${escapeHTML(copy.title)}</span>
          </a>`;
      }).join("");
      const label = t(`groups.${groupKey}.label`);
      return `<p class="sidebar-label">${escapeHTML(label)}</p><nav class="sidebar-nav" aria-label="${escapeHTML(label)}">${links}</nav>`;
    }).join("")}</aside>`;
  }

  function renderMobileToolNav(activeTool) {
    const options = tools.map(function (tool) {
      return `<option value="${tool.slug}"${tool.slug === activeTool.slug ? " selected" : ""}>${escapeHTML(toolCopy(tool).title)}</option>`;
    }).join("");
    return `
      <div class="mobile-tool-nav">
        <label for="mobile-tool-select">${escapeHTML(t("tool.switchTool"))}</label>
        <select id="mobile-tool-select">${options}</select>
      </div>`;
  }

  function renderOptionStrip(tool, state) {
    if (tool.option === "typeName") {
      return `
        <div class="option-strip">
          <div class="option-field">
            <label for="type-name">${escapeHTML(t("tool.rootType"))}</label>
            <input id="type-name" class="text-field" type="text" value="${escapeHTML(state.typeName)}" spellcheck="false" autocomplete="off" maxlength="80">
          </div>
        </div>`;
    }

    if (tool.option === "cache") {
      return `
        <div class="option-strip">
          <label class="switch-field" for="cache-option">
            <input id="cache-option" type="checkbox"${state.cache ? " checked" : ""}>
            <span class="switch-track" aria-hidden="true"></span>
            <span class="option-label">${escapeHTML(t("tool.cacheOption"))}</span>
          </label>
        </div>`;
    }

    return "";
  }

  function renderJSONActions(tool, state) {
    if (tool.outputLanguage !== "JSON") return "";
    const disabled = state.hasOutput && !state.busy ? "" : " disabled";
    return `
      <button id="compact-button" class="ghost-button" type="button"${disabled}>${escapeHTML(t("tool.compact"))}</button>
      <button id="format-button" class="ghost-button" type="button"${disabled}>${escapeHTML(t("tool.format"))}</button>`;
  }

  function bindToolInteractions(tool, state, version) {
    const input = document.getElementById("tool-input");
    const inputHighlight = document.querySelector("#tool-input-highlight code");
    const outputViewport = document.getElementById("tool-output");
    const output = document.querySelector("#tool-output code");
    const outputPanel = document.getElementById("output-panel");
    const convertButton = document.getElementById("convert-button");
    const exampleButton = document.getElementById("example-button");
    const clearButton = document.getElementById("clear-button");
    const copyButton = document.getElementById("copy-button");
    const compactButton = document.getElementById("compact-button");
    const formatButton = document.getElementById("format-button");
    const status = document.getElementById("tool-status");
    const outputMeta = document.getElementById("output-meta");
    const workspace = document.getElementById("tool-workspace");
    const mobileSelect = document.getElementById("mobile-tool-select");
    const typeName = document.getElementById("type-name");
    const cache = document.getElementById("cache-option");

    input.value = state.input;
    updateInputHighlight(true);

    mobileSelect.addEventListener("change", function () {
      window.location.assign(`/tools/${this.value}`);
    });

    exampleButton.addEventListener("click", function () {
      state.input = exampleFor(tool);
      input.value = state.input;
      updateInputHighlight(true);
      input.focus();
      setToolStatus("status.exampleLoaded", null, "");
    });

    clearButton.addEventListener("click", function () {
      state.input = "";
      input.value = "";
      updateInputHighlight(true);
      clearOutput();
      setToolStatus("status.inputCleared", null, "");
      input.focus();
    });

    convertButton.addEventListener("click", convert);
    copyButton.addEventListener("click", copyResult);
    if (compactButton) compactButton.addEventListener("click", function () {
      transformJSON("compact", "toast.jsonCompacted");
    });
    if (formatButton) formatButton.addEventListener("click", function () {
      transformJSON("format", "toast.jsonFormatted");
    });
    input.addEventListener("input", function () {
      state.input = input.value;
      updateInputHighlight(false);
    });
    input.addEventListener("scroll", syncInputScroll, { passive: true });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Tab") {
        event.preventDefault();
        insertAtSelection(input, "  ");
        state.input = input.value;
        updateInputHighlight(false);
        return;
      }
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        convert();
      }
    });

    if (typeName) {
      typeName.addEventListener("input", function () {
        state.typeName = typeName.value;
      });
      typeName.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          convert();
        }
      });
    }
    if (cache) {
      cache.addEventListener("change", function () {
        state.cache = cache.checked;
      });
    }

    function updateInputHighlight(resetScroll) {
      const source = input.value.endsWith("\n") ? input.value + " " : input.value;
      inputHighlight.innerHTML = highlightCode(source, tool.inputLanguage);
      if (resetScroll) {
        input.scrollTop = 0;
        input.scrollLeft = 0;
      }
      syncInputScroll();
    }

    function syncInputScroll() {
      inputHighlight.style.transform = `translate(${-input.scrollLeft}px, ${-input.scrollTop}px)`;
    }

    function setToolStatus(key, params, kind) {
      state.status = { key: key, params: params, kind: kind || "" };
      setStatusElement(status, state.status);
    }

    function setOutputStatus(key, params, kind) {
      state.outputStatus = { key: key, params: params, kind: kind || "" };
      setStatusElement(outputMeta, state.outputStatus);
    }

    function updateBusyUI() {
      if (state.busy) workspace.setAttribute("aria-busy", "true");
      else workspace.removeAttribute("aria-busy");
      convertButton.disabled = state.busy;
      exampleButton.disabled = state.busy;
      clearButton.disabled = state.busy;
      setResultActionsDisabled(!state.hasOutput || state.busy);
      if (state.busy) {
        convertButton.textContent = t(tool.local ? "status.analyzing" : "status.converting");
      } else {
        convertButton.innerHTML = `${escapeHTML(t("tool.convert"))} <span aria-hidden="true">→</span>`;
      }
    }

    async function convert() {
      if (state.busy) return;
      const source = input.value.trim();
      state.input = input.value;
      if (!source) {
        clearOutput();
        setToolStatus("errors.inputRequired", null, "error");
        showToastKey("errors.inputEmpty", null, true);
        input.focus();
        return;
      }

      state.busy = true;
      updateBusyUI();
      setToolStatus(tool.local ? "status.analyzingLocal" : "status.requesting", null, "loading");

      try {
        const result = tool.local ? convertJSON(source, state) : await callAPI(tool, source, state);
        const value = tool.outputLanguage === "JSON" ? formatJSONResult(result) : result;
        renderOutput(value);
        setToolStatus("status.complete", null, "success");
      } catch (error) {
        clearOutput();
        const normalized = normalizeError(error, "errors.conversionFailed");
        setToolStatus(normalized.key, normalized.params, "error");
        showToastKey(normalized.key, normalized.params, true);
      } finally {
        state.busy = false;
        updateBusyUI();
        if (version !== state.renderVersion) renderCurrentRoute();
      }
    }

    function convertJSON(source, currentState) {
      if (typeof window.jsonToGo !== "function") throw uiError("errors.jsonModule");
      const type = currentState.typeName.trim() || "AutoGenerated";
      const result = window.jsonToGo(source, type);
      if (result.error) throw uiError("errors.jsonParse", { message: result.error });
      return result.go;
    }

    async function copyResult() {
      if (!state.output) return;
      try {
        await copyText(state.output);
        showToastKey("toast.copied");
      } catch (_) {
        showToastKey("toast.copyFailed", null, true);
      }
    }

    function transformJSON(action, successKey) {
      const formatter = window.GOTLJSON;
      if (!formatter || typeof formatter[action] !== "function") {
        showToastKey("errors.jsonFormatter", null, true);
        return;
      }

      try {
        renderOutput(formatter[action](state.output));
        showToastKey(successKey);
      } catch (error) {
        const normalized = error && error.code === "INVALID_JSON"
          ? { key: "errors.invalidJSON", params: null }
          : normalizeError(error, "errors.jsonProcessing");
        showToastKey(normalized.key, normalized.params, true);
      }
    }

    function formatJSONResult(value) {
      const formatter = window.GOTLJSON;
      if (!formatter || typeof formatter.format !== "function") throw uiError("errors.jsonFormatter");
      try {
        return formatter.format(value);
      } catch (error) {
        if (error && error.code === "INVALID_JSON") throw uiError("errors.invalidJSON");
        throw error;
      }
    }

    function renderOutput(value) {
      state.output = value;
      state.hasOutput = true;
      output.innerHTML = highlightCode(value, tool.outputLanguage);
      outputViewport.scrollTop = 0;
      outputViewport.scrollLeft = 0;
      outputPanel.classList.add("has-output");
      setResultActionsDisabled(state.busy);
      const lineCount = value ? value.split("\n").length : 0;
      setOutputStatus("status.resultMeta", { lines: lineCount, characters: value.length }, "success");
    }

    function setResultActionsDisabled(disabled) {
      copyButton.disabled = disabled;
      if (compactButton) compactButton.disabled = disabled;
      if (formatButton) formatButton.disabled = disabled;
    }

    function clearOutput() {
      state.output = "";
      state.hasOutput = false;
      output.textContent = "";
      outputViewport.scrollTop = 0;
      outputViewport.scrollLeft = 0;
      outputPanel.classList.remove("has-output");
      setResultActionsDisabled(true);
      setOutputStatus("status.empty", null, "");
    }
  }

  async function callAPI(tool, source, state) {
    const body = new URLSearchParams();
    body.set(tool.field, source);
    if (tool.option === "cache") body.set("cache", state.cache ? "1" : "0");

    let response;
    try {
      response = await fetch(tool.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: body.toString()
      });
    } catch (_) {
      throw uiError("errors.network");
    }

    if (!response.ok) throw uiError("errors.http", { status: response.status });

    let payload;
    try {
      payload = await response.json();
    } catch (_) {
      throw uiError("errors.invalidResponse");
    }

    if (payload && payload.error) throw uiError("errors.serverResponse", { message: payload.error });
    if (!payload || payload.data === null || typeof payload.data === "undefined") {
      throw uiError("errors.missingResult");
    }
    return typeof payload.data === "string" ? payload.data : JSON.stringify(payload.data, null, 2);
  }

  function uiError(key, params) {
    const error = new Error(key);
    error.translationKey = key;
    error.translationParams = params || null;
    return error;
  }

  function normalizeError(error, fallbackKey) {
    if (error && error.translationKey) {
      return { key: error.translationKey, params: error.translationParams || null };
    }
    return { key: fallbackKey, params: null };
  }

  function setStatusElement(element, status) {
    element.textContent = statusText(status);
    element.classList.remove("success", "error", "loading");
    if (status.kind) element.classList.add(status.kind);
  }

  function insertAtSelection(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.selectionStart = input.selectionEnd = start + text.length;
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("copy failed");
  }

  function showToastKey(key, params, isError) {
    currentToast = { key: key, params: params || null, isError: Boolean(isError) };
    window.clearTimeout(toastTimer);
    refreshToast();
    toast.classList.add("visible");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("visible");
      currentToast = null;
    }, 2400);
  }

  function refreshToast() {
    if (!currentToast) return;
    toast.textContent = t(currentToast.key, currentToast.params);
    toast.classList.toggle("error", currentToast.isError);
  }

  function exampleFor(tool) {
    if (tool.inputLanguage === "SQL" && tool.slug !== "sql-to-es") {
      const comments = i18n.locale() === "zh-CN"
        ? { id: "主键", name: "用户名", email: "邮箱" }
        : { id: "primary key", name: "user name", email: "email" };
      return `CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '${comments.id}',
  name VARCHAR(64) NOT NULL DEFAULT '' COMMENT '${comments.name}',
  email VARCHAR(128) DEFAULT NULL COMMENT '${comments.email}',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    }
    if (tool.slug === "sql-to-es") {
      return "SELECT id, name FROM users WHERE status = 'active' AND age >= 18 ORDER BY created_at DESC LIMIT 20";
    }
    if (tool.slug === "json-to-go") {
      return `{
  "id": 1001,
  "name": "GOTL",
  "enabled": true,
  "tags": ["go", "tools"],
  "owner": {
    "user_id": 7,
    "email": "dev@example.com"
  }
}`;
    }
    if (tool.slug === "yaml-to-go") {
      return `app:
  name: gotl
  debug: false
server:
  host: 0.0.0.0
  ports:
    - 8080
    - 8081
features:
  cache: true`;
    }
    if (tool.slug === "yaml-to-json") {
      return `app:
  name: gotl
  debug: false
server:
  host: 0.0.0.0
  ports:
    - 8080
    - 8081
features:
  - converter
  - formatter`;
    }
    return `<tool>
  <name>GOTL</name>
  <version>1</version>
  <features>
    <feature>SQL Converter</feature>
    <feature>Data Formatter</feature>
  </features>
</tool>`;
  }

  function renderNotFound() {
    document.title = t("notFound.title");
    document.body.classList.remove("tool-page");
    app.innerHTML = `
      <main id="main-content" class="not-found">
        <span class="not-found-code">404</span>
        <h1>${escapeHTML(t("notFound.heading"))}</h1>
        <p>${escapeHTML(t("notFound.description"))}</p>
        <a class="primary-link" href="/">${escapeHTML(t("notFound.action"))} <span aria-hidden="true">→</span></a>
      </main>`;
  }
})();
