import test from 'node:test';
import assert from 'node:assert/strict';

import { loadConfig } from '../src/config.js';

test('defaults to port 3000 when PORT is not set', () => {
  // Pass an empty object so the test does not depend on the caller's process.env.
  const env = {};
  const before = { ...env };
  const result = loadConfig(env);

  assert.deepEqual(
    result,
    { port: 3000 },
    'an unset PORT should yield exactly { port: 3000 }',
  );

  assert.deepEqual(
    env,
    before,
    'an unset PORT should leave the environment object untouched',
  );

  assert.equal(typeof result.port, 'number');
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
    const env = { PORT: input };
    const before = { ...env };
    const result = loadConfig(env);

    assert.deepEqual(
      result,
      { port: expected },
      `PORT=${JSON.stringify(input)} should yield exactly { port: ${expected} }`,
    );
    assert.deepEqual(
      env,
      before,
      `PORT=${JSON.stringify(input)} should leave the environment object untouched`,
    );
  }
});

test('falls back to port 3000 for a malformed PORT value', () => {
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
    const env = { PORT: value };
    const before = { ...env };
    const result = loadConfig(env);

    assert.deepEqual(
      result,
      { port: 3000 },
      `PORT=${JSON.stringify(value)} should fall back to exactly { port: 3000 }, not ${JSON.stringify(result)}`,
    );
    assert.deepEqual(
      env,
      before,
      `PORT=${JSON.stringify(value)} should leave the environment object untouched`,
    );
  }

  // Keep injected non-string cases separate; labels avoid JSON.stringify(BigInt) and template interpolation of Symbol, both of which throw.
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
    const env = { PORT: value };
    const before = { ...env };
    const result = loadConfig(env);

    assert.deepEqual(
      result,
      { port: 3000 },
      `PORT set to ${label} should fall back to exactly { port: 3000 }`,
    );
    assert.deepEqual(
      env,
      before,
      `PORT set to ${label} should leave the environment object untouched`,
    );
  }
});
