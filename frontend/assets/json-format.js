(function (root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.GOTLJSON = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  function parse(source) {
    try {
      return JSON.parse(String(source));
    } catch (_) {
      throw new Error("当前结果不是有效的 JSON");
    }
  }

  function compact(source) {
    return JSON.stringify(parse(source));
  }

  function format(source) {
    return JSON.stringify(parse(source), null, 2);
  }

  return {
    compact: compact,
    format: format
  };
});
