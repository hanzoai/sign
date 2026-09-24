import { defineConfig } from 'prisma/config';

// Where the CLI finds the schema, the migrations and the database.
//
// Prisma 7 took the connection URL out of schema.prisma: the schema says WHAT
// the store is (sqlite), this file says WHERE it is for the tools that need to
// reach it — migrate, studio, db seed. The running app does not read this; it
// hands the client a driver adapter built from the same `DATABASE_URL`
// (./index.ts), so there is one variable and two readers, never two URLs.
//
// The seed command moved here with it: the `prisma` block in package.json is no
// longer read.
export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
    seed: 'tsx ./seed-database.ts',
  },
  // Read, not required: `prisma generate` loads this file and needs no database,
  // so the image and the gate build without one. migrate and studio still refuse
  // to run on an empty URL.
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
