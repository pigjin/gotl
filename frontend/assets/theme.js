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
  const preferences = ["system", "light", "dark"];
  const colors = {
    light: "#f4f7f8",
    dark: "#0b1218"
  };

  function isTheme(value) {
    return value === "light" || value === "dark";
  }

  function isPreference(value) {
    return preferences.includes(value);
  }

  function createThemeController() {
    let selectedPreference = "system";
    let systemPreference = null;
    let systemListenerBound = false;
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
        // The selected theme still applies to this page when storage is unavailable.
      }
    }

    function preferredTheme(scope) {
      if (!systemPreference && typeof scope.matchMedia === "function") {
        systemPreference = scope.matchMedia("(prefers-color-scheme: dark)");
      }
      return systemPreference && systemPreference.matches ? "dark" : "light";
    }

    function resolveTheme(scope, preference) {
      return isTheme(preference) ? preference : preferredTheme(scope);
    }

    function currentTheme(scope) {
      const value = scope.document.documentElement.getAttribute("data-theme");
      return isTheme(value) ? value : resolveTheme(scope, selectedPreference);
    }

    function notify(scope) {
      const state = {
        preference: selectedPreference,
        theme: currentTheme(scope)
      };
      listeners.forEach(function (listener) {
        listener(state);
      });
    }

    function applyPreference(scope, preference, shouldNotify) {
      const resolvedTheme = resolveTheme(scope, preference);
      const root = scope.document.documentElement;
      const themeColor = scope.document.querySelector('meta[name="theme-color"]');

      root.setAttribute("data-theme", resolvedTheme);
      root.setAttribute("data-theme-preference", preference);
      root.style.colorScheme = resolvedTheme;
      if (themeColor) themeColor.setAttribute("content", colors[resolvedTheme]);
      if (shouldNotify) notify(scope);
      return resolvedTheme;
    }

    function bindSystemListener(scope) {
      preferredTheme(scope);
      if (!systemPreference || systemListenerBound) return;

      const followSystem = function () {
        if (selectedPreference === "system") applyPreference(scope, "system", true);
      };
      if (typeof systemPreference.addEventListener === "function") {
        systemPreference.addEventListener("change", followSystem);
      } else if (typeof systemPreference.addListener === "function") {
        systemPreference.addListener(followSystem);
      }
      systemListenerBound = true;
    }

    function initialize(scope) {
      selectedPreference = readStoredPreference(scope);
      bindSystemListener(scope);
      return applyPreference(scope, selectedPreference, false);
    }

    function setPreference(scope, preference) {
      selectedPreference = isPreference(preference) ? preference : "system";
      bindSystemListener(scope);
      storePreference(scope, selectedPreference);
      return applyPreference(scope, selectedPreference, true);
    }

    function subscribe(listener) {
      listeners.add(listener);
      return function () {
        listeners.delete(listener);
      };
    }

    return {
      applyPreference: function (scope, preference) {
        selectedPreference = isPreference(preference) ? preference : "system";
        return applyPreference(scope, selectedPreference, true);
      },
      currentTheme: currentTheme,
      initialize: initialize,
      preference: function () { return selectedPreference; },
      setPreference: setPreference,
      subscribe: subscribe
    };
  }

  return {
    createThemeController: createThemeController,
    isPreference: isPreference,
    isTheme: isTheme,
    preferences: preferences,
    storageKey: storageKey
  };
});
