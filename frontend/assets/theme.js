(function (globalScope, factory) {
  "use strict";

  const themeModule = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = themeModule;
  }

  if (globalScope && globalScope.document) {
    globalScope.GOTLTheme = themeModule.createThemeController();
    globalScope.GOTLTheme.initialize(globalScope);
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const storageKey = "gotl-theme";
  const colors = {
    light: "#f4f7f8",
    dark: "#0b1218"
  };

  function isTheme(value) {
    return value === "light" || value === "dark";
  }

  function createThemeController() {
    let selectedTheme = null;
    let systemPreference = null;

    function readStoredTheme(scope) {
      try {
        const value = scope.localStorage.getItem(storageKey);
        return isTheme(value) ? value : null;
      } catch (_) {
        return null;
      }
    }

    function storeTheme(scope, theme) {
      try {
        scope.localStorage.setItem(storageKey, theme);
      } catch (_) {
        // The theme still works for this page when storage is unavailable.
      }
    }

    function preferredTheme(scope) {
      if (!systemPreference && typeof scope.matchMedia === "function") {
        systemPreference = scope.matchMedia("(prefers-color-scheme: dark)");
      }
      return systemPreference && systemPreference.matches ? "dark" : "light";
    }

    function currentTheme(scope) {
      const value = scope.document.documentElement.getAttribute("data-theme");
      return isTheme(value) ? value : preferredTheme(scope);
    }

    function updateToggle(scope, theme) {
      const button = scope.document.getElementById("theme-toggle");
      const label = scope.document.getElementById("theme-toggle-label");
      if (!button) return;

      const nextLabel = theme === "dark" ? "浅色" : "深色";
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.setAttribute("aria-label", `切换为${nextLabel}模式`);
      button.setAttribute("title", `切换为${nextLabel}模式`);
      if (label) label.textContent = theme === "dark" ? "深色" : "浅色";
    }

    function applyTheme(scope, theme) {
      const resolvedTheme = isTheme(theme) ? theme : preferredTheme(scope);
      const root = scope.document.documentElement;
      const themeColor = scope.document.querySelector('meta[name="theme-color"]');

      root.setAttribute("data-theme", resolvedTheme);
      root.style.colorScheme = resolvedTheme;
      if (themeColor) themeColor.setAttribute("content", colors[resolvedTheme]);
      updateToggle(scope, resolvedTheme);
      return resolvedTheme;
    }

    function initialize(scope) {
      selectedTheme = readStoredTheme(scope);
      const initialTheme = applyTheme(scope, selectedTheme || preferredTheme(scope));

      if (systemPreference) {
        const followSystem = function (event) {
          if (!selectedTheme) applyTheme(scope, event.matches ? "dark" : "light");
        };
        if (typeof systemPreference.addEventListener === "function") {
          systemPreference.addEventListener("change", followSystem);
        } else if (typeof systemPreference.addListener === "function") {
          systemPreference.addListener(followSystem);
        }
      }

      return initialTheme;
    }

    function bindToggle(scope) {
      const button = scope.document.getElementById("theme-toggle");
      if (!button || button.getAttribute("data-theme-bound") === "true") return;

      button.setAttribute("data-theme-bound", "true");
      updateToggle(scope, currentTheme(scope));
      button.addEventListener("click", function () {
        const nextTheme = currentTheme(scope) === "dark" ? "light" : "dark";
        selectedTheme = nextTheme;
        storeTheme(scope, nextTheme);
        applyTheme(scope, nextTheme);
      });
    }

    return {
      applyTheme: applyTheme,
      bindToggle: bindToggle,
      currentTheme: currentTheme,
      initialize: initialize
    };
  }

  return {
    createThemeController: createThemeController,
    isTheme: isTheme,
    storageKey: storageKey
  };
});
