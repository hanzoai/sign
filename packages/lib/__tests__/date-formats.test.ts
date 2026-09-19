/**
 * The date format a team or organisation keeps.
 *
 * The preferences form offers DATE_FORMATS in a select and validates the
 * choice with ZDocumentMetaDateFormatSchema, the schema the settings routes
 * check it against. That schema is z.enum(VALID_DATE_FORMAT_VALUES); its module
 * runs lingui macros on import, which only a build can, so the list it is made
 * of is what is tested here. Every format the select offers, and the default a
 * new team is stored with, has to be in it. A time zone — what the form used
 * to validate a date format with — is not.
 *
 * Run:  npx tsx --test packages/lib/__tests__/date-formats.test.ts
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  DATE_FORMATS,
  DEFAULT_DOCUMENT_DATE_FORMAT,
  VALID_DATE_FORMAT_VALUES,
} from '../constants/date-formats';

const isValid = (value: string) => VALID_DATE_FORMAT_VALUES.some((format) => format === value);

describe('date formats', () => {
  test('every format the preferences select offers is valid', () => {
    for (const format of DATE_FORMATS) {
      assert.ok(isValid(format.value), format.value);
    }
  });

  test('the format a team is stored with by default is valid', () => {
    assert.ok(isValid(DEFAULT_DOCUMENT_DATE_FORMAT));
  });

  test('a time zone is not a date format', () => {
    assert.equal(isValid('Australia/Melbourne'), false);
  });
});
