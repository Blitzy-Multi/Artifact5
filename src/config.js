/**
 * Configuration layer for the hello service.
 *
 * This module has exactly one responsibility: turn an environment bag into the
 * settings the service runs with. `PORT` is the only value the project makes
 * configurable — the bind host is deliberately fixed, so the startup URL never
 * has to be formatted differently for hostnames, wildcards or IPv6 literals.
 *
 * Two properties are worth noticing, because the rest of the project depends on
 * them:
 *
 *   1. The environment is a *parameter*, not a global read. That is what lets
 *      the tests call `loadConfig({ PORT: '5555' })` and assert on the result
 *      without mutating `process.env` or clearing the module cache.
 *   2. Importing this file does nothing. There is no top-level environment
 *      read, no validation at module scope and no logging, so `src/server.js`
 *      remains the only module in the project with side effects.
 *
 * Per Rule 1 — the project's sole user-specified rule, which asks for a Node.js
 * tutorial project — this is plain ESM that runs natively on Node 24 with no
 * transpiler and no dependency of its own, and the port grammar below is
 * explained rather than merely enforced.
 */

/** Port used when `PORT` is unset or does not satisfy the grammar below. */
const DEFAULT_PORT = 3000;

/** Lowest port a TCP listener may be asked to bind. */
const MIN_PORT = 1;

/** Highest port a TCP listener may be asked to bind (16-bit unsigned max). */
const MAX_PORT = 65535;

/**
 * A whole decimal integer and nothing else.
 *
 * The anchors are the point of this pattern, and the reason it exists at all is
 * that `Number.parseInt` on its own is far too forgiving for a value that
 * decides which port a server binds: it reads `'8080abc'` as `8080`, `'3.5'` as
 * `3` and `'1e3'` as `1`, so an operator typo would silently start the service
 * somewhere other than where they asked. Requiring a whole-string match first
 * means every value is either exactly what it looks like or rejected outright.
 *
 * There is no `g` flag, so `.test()` keeps no `lastIndex` state between calls
 * and this module-level constant is safe to reuse.
 */
const PORT_PATTERN = /^[0-9]+$/;

/**
 * Read the service configuration out of an environment bag.
 *
 * `PORT` is accepted only as a *string* holding a whole decimal integer in the
 * inclusive range 1–65535, after surrounding whitespace is trimmed. Anything
 * else — unset, blank, `'8080abc'`, `'3.5'`, `'1e3'`, `'+8080'`, `'-1'`, `'0'`,
 * `'65536'` — resolves to the default of {@link DEFAULT_PORT}. So does a value
 * that is not a string at all: a number, a BigInt, an array, a boxed `Number`,
 * a boolean, a symbol or any object, including one with a null prototype.
 * A malformed value never throws, never exits and never refuses startup — that
 * holds for every possible input, not merely for well-formed strings — it
 * selects the default, and whether that listener then binds is left to the
 * operating system (an `EADDRINUSE` from `listen` is a separate concern from
 * configuration).
 *
 * @param {Record<string, string | undefined>} [env=process.env] Environment to
 *   read. Defaults to `process.env` so `src/server.js` can call `loadConfig()`
 *   with no argument, while tests pass plain objects such as `{}` or
 *   `{ PORT: '5555' }`. Never read directly inside this function, so the call
 *   is pure with respect to global state. The type annotation describes what a
 *   real environment holds rather than what the runtime enforces: because the
 *   bag is injected, a `PORT` of any other type reaches this function, and such
 *   a value falls back to {@link DEFAULT_PORT} instead of being coerced.
 * @returns {{ port: number }} A freshly built object carrying exactly one
 *   property, `port`, always a `Number`. Successive calls return equal but
 *   independent objects, so a caller may keep or mutate its own copy safely.
 */
export function loadConfig(env = process.env) {
  // Optional chaining keeps a caller who passes `null` (or anything else that
  // has no properties) on the documented path — the default — rather than
  // surfacing a TypeError from a configuration lookup.
  const rawPort = env?.PORT;

  // Step 1 — an absent value (`undefined`) or an explicitly null one means
  // "not configured". A blank string is caught by step 4 instead.
  if (rawPort === undefined || rawPort === null) {
    return { port: DEFAULT_PORT };
  }

  // Step 2 — the grammar above is a *string* grammar, so a value of any other
  // type is malformed by definition. A real `process.env` only ever holds
  // strings, but this function takes its environment as a parameter, so a
  // caller can hand over a number, a BigInt, an array or a bare object.
  // Coercing those with `String(...)` would fail in two separate ways: it would
  // silently widen the documented grammar, letting numeric `8080`, `8080n`,
  // `[8080]` and any object whose `toString` happens to return digits through;
  // and for an object with no prototype — `Object.create(null)` — it would
  // raise `TypeError: Cannot convert object to primitive value` from a function
  // that promises never to throw. Taking the same fallback as every other
  // malformed value keeps both promises.
  if (typeof rawPort !== 'string') {
    return { port: DEFAULT_PORT };
  }

  // Step 3 — trim, because shell quoting tends to leave stray whitespace
  // behind and `PORT=' 8080 '` plainly means 8080.
  const trimmed = rawPort.trim();

  // Step 4 — the value must be a whole decimal integer end to end. A blank or
  // whitespace-only value trims to `''`, which has no digits and so lands here
  // on the default, exactly as an unset value does.
  if (!PORT_PATTERN.test(trimmed)) {
    return { port: DEFAULT_PORT };
  }

  // Step 5 — the shape is now guaranteed, so parsing cannot surprise us; all
  // that remains is the range a TCP port is allowed to occupy.
  const port = Number.parseInt(trimmed, 10);
  if (port < MIN_PORT || port > MAX_PORT) {
    return { port: DEFAULT_PORT };
  }

  return { port };
}
