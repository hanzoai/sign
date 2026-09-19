/**
 * A `DateTime` is an epoch-millisecond INTEGER on disk, under every client.
 *
 * The rows in a deployed sign.db were written by Prisma's own query engine,
 * which stored `DateTime` as an integer of milliseconds. Prisma 7 has no engine:
 * the client talks through a driver adapter, and the better-sqlite3 adapter's
 * DEFAULT is ISO-8601 TEXT. A client built on that default keeps working — it
 * reads its own strings back — while writing a second representation into
 * columns that already hold the first. SQLite orders an INTEGER before any TEXT,
 * so every comparison across the two sorts by type instead of by time, and
 * ./sqlite-sql.ts (`column / 1000, 'unixepoch'`) reads the new rows as year 1970.
 * Nothing throws. That is why this is a test and not a comment.
 *
 * It runs the REAL migration into a temp file and reads the column's storage
 * class with a second, independent connection.
 *
 * Run:  npx tsx --test packages/prisma/__tests__/timestamp.test.ts
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { prisma } from '../index';

let dir: string;
let dbPath: string;

before(async () => {
  dir = mkdtempSync(path.join(tmpdir(), 'esign-timestamp-'));
  dbPath = path.join(dir, 'sign.db');

  const migration = readFileSync(
    path.join(__dirname, '..', 'migrations', '0_init', 'migration.sql'),
    'utf8',
  );
  const raw = new DatabaseSync(dbPath);
  raw.exec('PRAGMA foreign_keys=ON');
  raw.exec(migration);
  raw.close();

  process.env.DATABASE_URL = `file:${dbPath}`;
  await prisma.$connect();
}, { timeout: 60_000 });

after(async () => {
  await prisma?.$disconnect();
  rmSync(dir, { recursive: true, force: true });
});

/** The column as SQLite holds it, read by a connection Prisma knows nothing of. */
const stored = (email: string) => {
  const raw = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return raw
      .prepare('SELECT typeof("createdAt") AS kind, "createdAt" AS value FROM "User" WHERE email = ?')
      .get(email) as { kind: string; value: number | string };
  } finally {
    raw.close();
  }
};

describe('DateTime storage', () => {
  test('a written DateTime is an epoch-millisecond integer', async () => {
    const at = new Date('2026-03-04T05:06:07.890Z');
    await prisma.user.create({ data: { email: 'written@example.com', createdAt: at } });

    const row = stored('written@example.com');
    assert.equal(row.kind, 'integer', `createdAt is stored as ${row.kind}: ${String(row.value)}`);
    assert.equal(row.value, at.getTime());
  });

  test('a row the old engine wrote reads back as the same instant', async () => {
    // Exactly what Prisma 6 left on disk: the integer, and nothing else.
    const at = new Date('2025-11-22T10:00:00.000Z');
    const raw = new DatabaseSync(dbPath);
    raw
      .prepare(
        'INSERT INTO "User" (email, "createdAt", "updatedAt", "lastSignedIn") VALUES (?, ?, ?, ?)',
      )
      .run('legacy@example.com', at.getTime(), at.getTime(), at.getTime());
    raw.close();

    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'legacy@example.com' } });
    assert.equal(user.createdAt.getTime(), at.getTime());
  });

  test('old and new rows order by time, not by storage class', async () => {
    // The legacy row is earlier. Were the new row TEXT, SQLite would sort the
    // INTEGER first regardless of value and this would pass by accident — so the
    // assertion is made in BOTH directions with a filter that must exclude one.
    const cutoff = new Date('2026-01-01T00:00:00.000Z');
    const after = await prisma.user.findMany({
      where: { createdAt: { gt: cutoff } },
      select: { email: true },
    });
    const before = await prisma.user.findMany({
      where: { createdAt: { lt: cutoff } },
      select: { email: true },
    });
    assert.deepEqual(after.map((u) => u.email), ['written@example.com']);
    assert.deepEqual(before.map((u) => u.email), ['legacy@example.com']);
  });
});
