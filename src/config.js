const DEFAULT_PORT = 3000;

const MIN_PORT = 1;

/** Highest port a TCP listener may be asked to bind (16-bit unsigned max). */
const MAX_PORT = 65535;

// Validate the entire string before parsing; parseInt would partially accept values such as "8080abc".
const PORT_PATTERN = /^[0-9]+$/;

/**
 * Read the service configuration from the given environment-like object.
 *
 * `PORT` is accepted only as a string that, once trimmed, is a whole decimal
 * integer in the inclusive range 1-65535; every other value selects the
 * default of {@link DEFAULT_PORT}.
 *
 * @param {Record<string, unknown>} [env=process.env] Environment-like object to
 *   read from. Defaults to `process.env` so the bootstrap can call
 *   `loadConfig()` with no argument while tests pass plain objects.
 * @returns {{ port: number }}
 */
export function loadConfig(env = process.env) {
  const rawPort = env?.PORT;

  if (rawPort === undefined || rawPort === null) {
    return { port: DEFAULT_PORT };
  }

  // Reject non-strings instead of coercing them; coercion widens the grammar and can itself throw.
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
