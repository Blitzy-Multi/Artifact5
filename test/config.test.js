import test from 'node:test';
import assert from 'node:assert/strict';

import { loadConfig } from '../src/config.js';

/**
 * Call `loadConfig` with `env`, assert the call left `env` untouched, and return
 * the configuration it produced.
 *
 * `loadConfig` is specified as a pure function of its argument, so every case in
 * this file owes that check as well as a check of the port it returns. Holding
 * the snapshot-and-compare in one place states the rule once and leaves each
 * case to the value it is actually about.
 *
 * @param {Record<string, unknown>} env Environment-like object to read from.
 * @param {string} subject How this case names itself in a failure message.
 * @returns {{ port: number }} The configuration `loadConfig` returned.
 */
function loadConfigWithoutMutating(env, subject) {
  const before = { ...env };
  const result = loadConfig(env);

  assert.deepEqual(
    env,
    before,
    `${subject} should leave the environment object untouched`,
  );

  return result;
}

test('defaults to port 3000 when PORT is not set', () => {
  // Pass an empty object so the test does not depend on the caller's process.env.
  const result = loadConfigWithoutMutating({}, 'an unset PORT');

  assert.deepEqual(
    result,
    { port: 3000 },
    'an unset PORT should yield exactly { port: 3000 }',
  );

  assert.equal(
    typeof result.port,
    'number',
    'the port should be reported as a number',
  );
});

test('honours a whole-integer PORT within 1-65535', () => {
  // Environment values are always strings, so converting to a Number is part
  // of the contract, not an implementation detail. `1` and `65535` are the
  // inclusive edges of the range — the two values an off-by-one range check
  // would get wrong — and the padded entry proves the value is trimmed before
  // it is inspected.
  const acceptedValues = [
    ['5555', 5555],
    ['1', 1],
    ['65535', 65535],
    [' 8080 ', 8080],
  ];

  for (const [input, expected] of acceptedValues) {
    const subject = `PORT=${JSON.stringify(input)}`;
    const result = loadConfigWithoutMutating({ PORT: input }, subject);

    assert.deepEqual(
      result,
      { port: expected },
      `${subject} should yield exactly { port: ${expected} }`,
    );
  }
});

test('falls back to port 3000 for a malformed or non-string PORT value', () => {
  // The anchored /^[0-9]+$/ grammar rejects what parseInt would partially accept
  // (trailing garbage, fraction, exponent, sign) plus the empty and blank values
  // (it needs a digit after trimming). '0' and '65536' pass that grammar and are
  // rejected only by the inclusive 1-65535 range check - a separate, needed guard.
  const malformedValues = [
    '8080abc',
    '3.5',
    '1e3',
    '+8080',
    '-1',
    '0',
    '65536',
    '',
    '   ',
  ];

  for (const value of malformedValues) {
    const subject = `PORT=${JSON.stringify(value)}`;
    const result = loadConfigWithoutMutating({ PORT: value }, subject);

    assert.deepEqual(
      result,
      { port: 3000 },
      `${subject} should fall back to exactly { port: 3000 }, ` +
        `not ${JSON.stringify(result)}`,
    );
  }

  // The rest of this test covers the same fallback for values a real
  // process.env could never hold, because loadConfig rejects a non-string
  // outright instead of coercing it: no coercion path may widen the grammar
  // above. These cases are kept in a separate list and carry written labels,
  // because JSON.stringify throws on a BigInt and interpolating a Symbol into a
  // template string throws too.
  const nonStringValues = [
    ['the number 8080', 8080],
    ['the BigInt 8080n', 8080n],
    ['the array [8080]', [8080]],
    ['a boxed new Number(8080)', new Number(8080)],
    ['an object whose toString returns "8080"', { toString: () => '8080' }],
    ['the boolean true', true],
    ['a null-prototype object', Object.create(null)],
    ['a symbol', Symbol('8080')],
  ];

  for (const [label, value] of nonStringValues) {
    const subject = `PORT set to ${label}`;
    const result = loadConfigWithoutMutating({ PORT: value }, subject);

    assert.deepEqual(
      result,
      { port: 3000 },
      `${subject} should fall back to exactly { port: 3000 }`,
    );
  }
});
