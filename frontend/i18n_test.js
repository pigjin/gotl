"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const languageModule = require("./assets/i18n.js");

function createElement() {
  const attributes = new Map();
  return {
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
  if (typeof options.storedPreference !== "undefined") {
    stored.set(languageModule.storageKey, options.storedPreference);
  }
  return {
    root,
    meta,
    stored,
    scope: {
      navigator: {
        languages: options.languages || [],
        language: options.language || "en-US"
      },
      document: {
        documentElement: root,
        querySelector(selector) {
          return selector === 'meta[name="description"]' ? meta : null;
        }
      },
      localStorage: {
        getItem(key) {
          return stored.has(key) ? stored.get(key) : null;
        },
        setItem(key, value) {
          stored.set(key, value);
        }
      }
    }
  };
}

test("system preference resolves Chinese browser locales", function () {
  const fixture = createScope({ languages: ["zh-Hans-CN", "en-US"] });
  const controller = languageModule.createLanguageController();

  assert.equal(controller.initialize(fixture.scope), "zh-CN");
  assert.equal(controller.preference(), "system");
  assert.equal(fixture.root.getAttribute("lang"), "zh-CN");
  assert.match(fixture.meta.getAttribute("content"), /Go 开发工具箱/);
});

test("system preference uses English for non-Chinese browser locales", function () {
  const fixture = createScope({ languages: ["fr-FR", "en-US"] });
  const controller = languageModule.createLanguageController();

  assert.equal(controller.initialize(fixture.scope), "en");
  assert.equal(controller.t("shell.settings"), "Settings");
});

test("stored explicit language overrides the browser", function () {
  const fixture = createScope({ languages: ["zh-CN"], storedPreference: "en" });
  const controller = languageModule.createLanguageController();

  assert.equal(controller.initialize(fixture.scope), "en");
  assert.equal(controller.preference(), "en");
  assert.equal(fixture.root.getAttribute("lang"), "en");
});

test("all three language preferences are persisted", function () {
  const fixture = createScope({ languages: ["en-US"] });
  const controller = languageModule.createLanguageController();
  controller.initialize(fixture.scope);

  assert.equal(controller.setPreference(fixture.scope, "zh-CN"), "zh-CN");
  assert.equal(fixture.stored.get(languageModule.storageKey), "zh-CN");
  assert.equal(controller.setPreference(fixture.scope, "en"), "en");
  assert.equal(fixture.stored.get(languageModule.storageKey), "en");
  assert.equal(controller.setPreference(fixture.scope, "system"), "en");
  assert.equal(fixture.stored.get(languageModule.storageKey), "system");
});

test("invalid stored preferences fall back to the browser", function () {
  const fixture = createScope({ languages: ["zh-TW"], storedPreference: "de" });
  const controller = languageModule.createLanguageController();

  assert.equal(controller.initialize(fixture.scope), "zh-CN");
  assert.equal(controller.preference(), "system");
});

test("translations interpolate values and use stable keys", function () {
  const fixture = createScope({ storedPreference: "en" });
  const controller = languageModule.createLanguageController();
  controller.initialize(fixture.scope);

  assert.equal(
    controller.t("status.resultMeta", { lines: 3, characters: 48 }),
    "3 lines · 48 characters"
  );
  assert.equal(controller.t("missing.translation.key"), "missing.translation.key");
});
