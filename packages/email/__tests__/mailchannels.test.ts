import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';

import { createTransport } from 'nodemailer';
import type { Options } from 'nodemailer/lib/mailer';

import { MailChannelsTransport } from '../transports/mailchannels';

const realFetch = globalThis.fetch;

/** Sends one mail through nodemailer and returns the `from` MailChannels was posted. */
const sendFrom = async (from: Options['from']) => {
  const bodies: string[] = [];

  globalThis.fetch = async (_input: string | URL | Request, init?: RequestInit) => {
    bodies.push(String(init?.body));

    return Promise.resolve(new Response('{}', { status: 202 }));
  };

  await createTransport(MailChannelsTransport.makeTransport({ apiKey: 'key' })).sendMail({
    from,
    to: 'signer@example.com',
    subject: 'hi',
    html: '<p>hi</p>',
  });

  assert.equal(bodies.length, 1);

  return JSON.parse(bodies[0]).from;
};

describe('mailchannels transport', () => {
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('sends from a bare address', async () => {
    assert.deepEqual(await sendFrom('sign@example.com'), { email: 'sign@example.com' });
  });

  it('sends from a named address', async () => {
    assert.deepEqual(await sendFrom({ name: 'Sign', address: 'sign@example.com' }), {
      email: 'sign@example.com',
      name: 'Sign',
    });
  });

  it('sends from the first address of a list', async () => {
    assert.deepEqual(await sendFrom(['first@example.com', 'second@example.com']), {
      email: 'first@example.com',
    });
  });
});
