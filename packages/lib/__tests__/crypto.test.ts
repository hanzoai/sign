/**
 * Symmetric encryption of stored secrets.
 *
 * Secrets written before @noble/ciphers 2 are still in the database, so the
 * fixture below was encrypted by @noble/ciphers 0.6.0 through the code this
 * module had then, and has to decrypt now.
 *
 * Run:  npx tsx --test packages/lib/__tests__/crypto.test.ts
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { symmetricDecrypt, symmetricEncrypt } from '../universal/crypto';

const key = 'a key of any length';

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe('symmetric encryption', () => {
  test('reads back what it wrote', () => {
    const data = 'a secret';

    assert.equal(decode(symmetricDecrypt({ key, data: symmetricEncrypt({ key, data }) })), data);
  });

  test('draws a new nonce for every write', () => {
    assert.notEqual(
      symmetricEncrypt({ key, data: 'a secret' }),
      symmetricEncrypt({ key, data: 'a secret' }),
    );
  });

  test('reads a secret @noble/ciphers 0.6.0 wrote', () => {
    const data =
      'ddd5e652921b7dad9f2322aee527d4954b3e7dbfe49aecc3f989bff3fc156998fdf136b52e3b2134a0128ab8e68bab860e9d991fd03129a422261645c9c54b45531404e91e733d8d8b02b285daca';

    assert.equal(decode(symmetricDecrypt({ key, data })), 'a secret kept since before the upgrade');
  });

  test('refuses a secret under another key', () => {
    const data = symmetricEncrypt({ key, data: 'a secret' });

    assert.throws(() => symmetricDecrypt({ key: 'another key', data }));
  });
});
