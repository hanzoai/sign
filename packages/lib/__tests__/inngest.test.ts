/**
 * Starting a job on Inngest.
 *
 * A job is triggered with a name, a payload and optionally an id and a
 * timestamp. Inngest starts a function from an event, and an event carries
 * its payload as `data` and its time as `ts`. Both ways a job is started —
 * from outside a run and as a step inside one — send the same event.
 *
 * Run:  npx tsx --test packages/lib/__tests__/inngest.test.ts
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { toInngestEvent } from '../jobs/client/inngest';

describe('toInngestEvent', () => {
  test('carries the payload as data and the timestamp as ts', () => {
    assert.deepEqual(
      toInngestEvent({
        id: 'run-1',
        name: 'send.signing.requested.email',
        payload: { envelopeId: 'envelope_1' },
        timestamp: 1_760_000_000_000,
      }),
      {
        id: 'run-1',
        name: 'send.signing.requested.email',
        data: { envelopeId: 'envelope_1' },
        ts: 1_760_000_000_000,
      },
    );
  });

  test('leaves the id and the time to Inngest when the trigger names neither', () => {
    const event = toInngestEvent({ name: 'internal.seal-document', payload: { documentId: 1 } });

    assert.equal(event.id, undefined);
    assert.equal(event.ts, undefined);
    assert.deepEqual(event.data, { documentId: 1 });
  });
});
