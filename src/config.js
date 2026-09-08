const DEFAULT_PORT = 3000;

/**
 * Inclusive bounds of the accepted `PORT` range. The upper bound is the 16-bit
 * unsigned maximum a TCP listener may be asked to bind; the lower bound leaves
 * out 0, which asks the operating system for an arbitrary free port and would
 * make the logged startup URL wrong.
 */
const MIN_PORT = 1;
const MAX_PORT = 65535;

// Validate the entire string before parsing; parseInt would partially accept
// values such as "8080abc".
const PORT_PATTERN = /^[0-9]+$/;

/**
 * Read the service configuration from the given environment-like object.
 *
 * `PORT` is accepted only as a string that, once trimmed, is a whole decimal
 * integer in the inclusive range 1-65535; every other value selects the
 * default of {@link DEFAULT_PORT}.
 *
 * @param {Record<string, unknown> | null} [env=process.env] Environment-like
 *   object to read from. Defaults to `process.env` so the bootstrap can call
 *   `loadConfig()` with no argument while tests pass plain objects; a `null`
 *   env is tolerated too and selects the default.
 * @returns {{ port: number }}
 */
export function loadConfig(env = process.env) {
  const rawPort = env?.PORT;

  // Anything that is not a string - an unset or null `PORT`, a missing env, or
  // a value of any other type - selects the default. Coercing instead would
  // widen the grammar, and coercion can itself throw.
  if (typeof rawPort !== 'string') {
    return { port: DEFAULT_PORT };
  }

  const trimmed = rawPort.trim();

  if (!PORT_PATTERN.test(trimmed)) {
    return { port: DEFAULT_PORT };
  }

  const port = Number.parseInt(trimmed, 10);
  if (port < MIN_PORT || port > MAX_PORT) {
    return { port: DEFAULT_PORT };
  }

  return { port };
}
