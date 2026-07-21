"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const jsonFormat = require("./assets/json-format.js");

test("compacts JSON to one line", function () {
  const source = `{
  "name": "GOTL tools",
  "nested": { "enabled": true },
  "items": [1, 2]
}`;

  assert.equal(jsonFormat.compact(source), '{"name":"GOTL tools","nested":{"enabled":true},"items":[1,2]}');
});

test("formats JSON with two-space indentation", function () {
  const source = '{"name":"GOTL","nested":{"enabled":true}}';

  assert.equal(jsonFormat.format(source), `{
  "name": "GOTL",
  "nested": {
    "enabled": true
  }
}`);
});

test("preserves spaces and escaped characters inside strings", function () {
  const source = '{ "message": "a  b", "quote": "say \\"hello\\"", "path": "a\\\\b" }';

  assert.deepEqual(JSON.parse(jsonFormat.compact(source)), JSON.parse(source));
  assert.deepEqual(JSON.parse(jsonFormat.format(source)), JSON.parse(source));
});

test("compact and format are idempotent", function () {
  const source = '{"items":[{"id":1},{"id":2}]}';

  assert.equal(jsonFormat.compact(jsonFormat.compact(source)), jsonFormat.compact(source));
  assert.equal(jsonFormat.format(jsonFormat.format(source)), jsonFormat.format(source));
});

test("rejects invalid JSON", function () {
  assert.throws(function () {
    jsonFormat.compact('{"broken":}');
  }, /不是有效的 JSON/);
});
