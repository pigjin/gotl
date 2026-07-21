"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const themeModule = require("./assets/theme.js");

function createElement() {
  const attributes = new Map();
  return {
    style: {},
    textContent: "",
    listener: null,
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    addEventListener(name, listener) {
      if (name === "click") this.listener = listener;
    },
    click() {
      if (this.listener) this.listener();
    }
  };
}

function createScope(options = {}) {
  const root = createElement();
  const meta = createElement();
  const button = createElement();
  const label = createElement();
  const stored = new Map();
  const media = {
    matches: Boolean(options.prefersDark),
    listener: null,
    addEventListener(name, listener) {
      if (name === "change") this.listener = listener;
    }
  };
  if (options.storedTheme) stored.set(themeModule.storageKey, options.storedTheme);

  return {
    root,
    meta,
    button,
    label,
    media,
    stored,
    scope: {
      document: {
        documentElement: root,
        getElementById(id) {
          if (id === "theme-toggle") return button;
          if (id === "theme-toggle-label") return label;
          return null;
        },
        querySelector(selector) {
          return selector === 'meta[name="theme-color"]' ? meta : null;
        }
      },
      localStorage: {
        getItem(key) {
          return stored.has(key) ? stored.get(key) : null;
        },
        setItem(key, value) {
          stored.set(key, value);
        }
      },
      matchMedia() {
        return media;
      }
    }
  };
}

test("uses the system preference when no theme was selected", function () {
  const fixture = createScope({ prefersDark: true });
  const controller = themeModule.createThemeController();

  assert.equal(controller.initialize(fixture.scope), "dark");
  assert.equal(fixture.root.getAttribute("data-theme"), "dark");
  assert.equal(fixture.meta.getAttribute("content"), "#0b1218");
});

test("restores a stored preference over the system preference", function () {
  const fixture = createScope({ prefersDark: true, storedTheme: "light" });
  const controller = themeModule.createThemeController();

  assert.equal(controller.initialize(fixture.scope), "light");
  assert.equal(fixture.root.style.colorScheme, "light");
});

test("toggles and stores the selected theme", function () {
  const fixture = createScope();
  const controller = themeModule.createThemeController();

  controller.initialize(fixture.scope);
  controller.bindToggle(fixture.scope);
  fixture.button.click();

  assert.equal(fixture.root.getAttribute("data-theme"), "dark");
  assert.equal(fixture.stored.get(themeModule.storageKey), "dark");
  assert.equal(fixture.button.getAttribute("aria-pressed"), "true");
  assert.equal(fixture.button.getAttribute("aria-label"), "切换为浅色模式");
  assert.equal(fixture.label.textContent, "深色");
});

test("continues following system changes until the user makes a selection", function () {
  const fixture = createScope();
  const controller = themeModule.createThemeController();

  controller.initialize(fixture.scope);
  fixture.media.listener({ matches: true });

  assert.equal(fixture.root.getAttribute("data-theme"), "dark");
});

test("stops following system changes after a manual selection", function () {
  const fixture = createScope();
  const controller = themeModule.createThemeController();

  controller.initialize(fixture.scope);
  controller.bindToggle(fixture.scope);
  fixture.button.click();
  fixture.media.listener({ matches: false });

  assert.equal(fixture.root.getAttribute("data-theme"), "dark");
});
