"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const themeModule = require("./assets/theme.js");

function createElement() {
  const attributes = new Map();
  return {
    style: {},
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    }
  };
}

function createScope(options = {}) {
  const root = createElement();
  const meta = createElement();
  const stored = new Map();
  const media = {
    matches: Boolean(options.prefersDark),
    listener: null,
    addEventListener(name, listener) {
      if (name === "change") this.listener = listener;
    },
    dispatch(matches) {
      this.matches = matches;
      if (this.listener) this.listener({ matches });
    }
  };
  if (typeof options.storedPreference !== "undefined") {
    stored.set(themeModule.storageKey, options.storedPreference);
  }

  return {
    root,
    meta,
    media,
    stored,
    scope: {
      document: {
        documentElement: root,
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

test("defaults to the system preference", function () {
  const fixture = createScope({ prefersDark: true });
  const controller = themeModule.createThemeController();

  assert.equal(controller.initialize(fixture.scope), "dark");
  assert.equal(controller.preference(), "system");
  assert.equal(fixture.root.getAttribute("data-theme"), "dark");
  assert.equal(fixture.root.getAttribute("data-theme-preference"), "system");
  assert.equal(fixture.meta.getAttribute("content"), "#0b1218");
});

test("restores legacy light and dark preferences", function () {
  const fixture = createScope({ prefersDark: true, storedPreference: "light" });
  const controller = themeModule.createThemeController();

  assert.equal(controller.initialize(fixture.scope), "light");
  assert.equal(controller.preference(), "light");
  assert.equal(fixture.root.style.colorScheme, "light");
});

test("stores direct light and dark selections", function () {
  const fixture = createScope();
  const controller = themeModule.createThemeController();

  controller.initialize(fixture.scope);
  assert.equal(controller.setPreference(fixture.scope, "dark"), "dark");
  assert.equal(fixture.stored.get(themeModule.storageKey), "dark");
  assert.equal(controller.preference(), "dark");
  assert.equal(fixture.meta.getAttribute("content"), "#0b1218");
});

test("manual themes ignore later system changes", function () {
  const fixture = createScope();
  const controller = themeModule.createThemeController();

  controller.initialize(fixture.scope);
  controller.setPreference(fixture.scope, "dark");
  fixture.media.dispatch(false);

  assert.equal(controller.currentTheme(fixture.scope), "dark");
});

test("switching back to system resumes live system changes", function () {
  const fixture = createScope({ prefersDark: true });
  const controller = themeModule.createThemeController();

  controller.initialize(fixture.scope);
  controller.setPreference(fixture.scope, "light");
  controller.setPreference(fixture.scope, "system");
  fixture.media.dispatch(false);

  assert.equal(fixture.stored.get(themeModule.storageKey), "system");
  assert.equal(controller.preference(), "system");
  assert.equal(controller.currentTheme(fixture.scope), "light");
  assert.equal(fixture.root.getAttribute("data-theme"), "light");
});

test("invalid stored preferences fall back to system", function () {
  const fixture = createScope({ prefersDark: true, storedPreference: "sepia" });
  const controller = themeModule.createThemeController();

  assert.equal(controller.initialize(fixture.scope), "dark");
  assert.equal(controller.preference(), "system");
});
