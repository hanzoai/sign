/**
 * Typing a name to confirm a delete.
 *
 * Run:  npx tsx --test packages/lib/__tests__/confirmation.test.ts
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createConfirmationSchema } from '../types/confirmation';

const message = "You must enter 'delete acme' to proceed";
const schema = createConfirmationSchema('delete acme', message);

describe('createConfirmationSchema', () => {
  test('accepts the text, exactly', () => {
    assert.equal(schema.safeParse('delete acme').success, true);
  });

  test('refuses anything else with the message it was given', () => {
    for (const typed of ['', 'delete', 'Delete Acme', 'delete acme ']) {
      const result = schema.safeParse(typed);

      assert.equal(result.success, false, typed);
      assert.deepEqual(
        result.error?.issues.map((issue) => issue.message),
        [message],
      );
    }
  });
});
