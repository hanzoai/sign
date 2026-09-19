/**
 * Product analytics from the app: events and errors go to the Insights client
 * when an Insights key is configured, and nowhere when it is not.
 *
 * Run:  npx tsx --test packages/lib/__tests__/use-analytics.test.ts
 */
import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';

import { insights } from '@hanzo/insights';

import { useAnalytics } from '../client-only/hooks/use-analytics';

const { capture, captureException } = insights;

/** Records what reaches the Insights client instead of sending it. */
const record = () => {
  const calls: unknown[][] = [];

  insights.capture = (...args: Parameters<typeof capture>) => {
    calls.push(['capture', ...args]);

    return undefined;
  };

  insights.captureException = (...args: Parameters<typeof captureException>) => {
    calls.push(['captureException', ...args]);

    return undefined;
  };

  return calls;
};

describe('useAnalytics', () => {
  afterEach(() => {
    insights.capture = capture;
    insights.captureException = captureException;
    delete process.env.NEXT_PUBLIC_INSIGHTS_KEY;
  });

  test('sends events and errors to Insights when a key is configured', () => {
    process.env.NEXT_PUBLIC_INSIGHTS_KEY = 'key';
    const calls = record();
    const error = new Error('boom');

    const analytics = useAnalytics();
    analytics.capture('document.sent', { documentId: 1 });
    analytics.captureException(error, { route: '/documents' });

    assert.deepEqual(calls, [
      ['capture', 'document.sent', { documentId: 1 }],
      ['captureException', error, { route: '/documents' }],
    ]);
  });

  test('sends nothing without a key', () => {
    const calls = record();

    useAnalytics().capture('document.sent');

    assert.deepEqual(calls, []);
  });
});
