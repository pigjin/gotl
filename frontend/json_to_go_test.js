const test = require("node:test");
const assert = require("node:assert/strict");
const jsonToGo = require("./assets/vendor/json-to-go.js");

test("converts nested objects with a custom root type", () => {
  const result = jsonToGo('{"id":1,"owner":{"user_id":7}}', "Payload");

  assert.equal(result.error, undefined);
  assert.match(result.go, /type Payload struct/);
  assert.match(result.go, /Owner Owner `json:"owner"`/);
  assert.match(result.go, /UserID int `json:"user_id"`/);
});

test("merges object-array fields and marks missing fields optional", () => {
  const result = jsonToGo('[{"id":1,"name":"A"},{"id":2}]', "Rows");

  assert.match(result.go, /type Rows \[\]struct/);
  assert.match(result.go, /Name string `json:"name,omitempty"`/);
});

test("uses any for mixed arrays and null values", () => {
  const mixed = jsonToGo('{"values":[1,"two",null]}', "Mixed");
  const nullable = jsonToGo('{"value":null}', "Nullable");

  assert.match(mixed.go, /Values \[\]any/);
  assert.match(nullable.go, /Value any/);
});

test("returns a parser error for invalid JSON", () => {
  const result = jsonToGo('{"broken":', "Payload");

  assert.equal(result.go, "");
  assert.ok(result.error);
});
