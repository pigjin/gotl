"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const syntax = require("./assets/syntax-highlight.js");

function renderedText(html) {
  return html
    .replace(/<\/?span(?:\s+class="[^"]+")?>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

test("highlights SQL tokens", function () {
  const html = syntax.highlight("CREATE TABLE users (id BIGINT, name VARCHAR(32) DEFAULT 'gotl'); -- note", "SQL");

  assert.match(html, /syntax-keyword">CREATE<\/span>/);
  assert.match(html, /syntax-type">BIGINT<\/span>/);
  assert.match(html, /syntax-string">&#039;gotl&#039;<\/span>/);
  assert.match(html, /syntax-comment">-- note<\/span>/);
});

test("highlights Go tokens", function () {
  const html = syntax.highlight("type User struct { Name string `json:\"name\"` } // model", "GO");

  assert.match(html, /syntax-keyword">type<\/span>/);
  assert.match(html, /syntax-keyword">struct<\/span>/);
  assert.match(html, /syntax-type">string<\/span>/);
  assert.match(html, /syntax-comment">\/\/ model<\/span>/);
});

test("highlights JSON tokens", function () {
  const html = syntax.highlight('{"enabled": true, "count": 12}', "JSON");

  assert.match(html, /syntax-key">&quot;enabled&quot;<\/span>/);
  assert.match(html, /syntax-literal">true<\/span>/);
  assert.match(html, /syntax-number">12<\/span>/);
});

test("highlights YAML tokens", function () {
  const html = syntax.highlight("app:\n  enabled: true # local", "YAML");

  assert.match(html, /syntax-key">app<\/span>/);
  assert.match(html, /syntax-key">enabled<\/span>/);
  assert.match(html, /syntax-literal">true<\/span>/);
  assert.match(html, /syntax-comment"># local<\/span>/);
});

test("highlights XML tags and attributes", function () {
  const html = syntax.highlight('<tool version="1"><name>GOTL</name></tool>', "XML");

  assert.match(html, /syntax-tag">tool<\/span>/);
  assert.match(html, /syntax-attribute">version<\/span>/);
  assert.match(html, /syntax-string">&quot;1&quot;<\/span>/);
  assert.match(html, /syntax-tag">name<\/span>/);
});

test("escapes unsafe markup and preserves exact source text", function () {
  const cases = [
    ["SELECT '<script>alert(1)</script>' FROM users;", "SQL"],
    ['{"html":"<img src=x onerror=alert(1)>"}', "JSON"],
    ["message: '<b>safe</b>'", "YAML"],
    ['<tool value="<unsafe>">&amp;</tool>', "XML"],
    ['package main\nvar value = "<script>"', "GO"],
    ["<script>alert('plain')</script>", "TEXT"]
  ];

  cases.forEach(function (item) {
    const html = syntax.highlight(item[0], item[1]);
    assert.doesNotMatch(html, /<script>|<img\s/i);
    assert.equal(renderedText(html), item[0]);
  });
});
