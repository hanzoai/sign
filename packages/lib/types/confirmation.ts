import { z } from 'zod';

/**
 * A field the user fills with `expected`, exactly, to confirm a destructive
 * action. Anything else fails with `message`.
 */
export const createConfirmationSchema = (expected: string, message: string) =>
  z.literal(expected, { error: message });
