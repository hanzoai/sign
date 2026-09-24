import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import type { RequestIdVariables } from 'hono/request-id';
import { requestId } from 'hono/request-id';
import type { Logger } from 'pino';

import { tsRestHonoApp } from '@hanzo/esign-api/hono';
import { auth, hanzoCallbackRoute } from '@hanzo/esign-auth/server';
import { jobsClient } from '@hanzo/esign-lib/jobs/client';
import { LicenseClient } from '@hanzo/esign-lib/server-only/license/license-client';
import { createRateLimitMiddleware } from '@hanzo/esign-lib/server-only/rate-limit/rate-limit-middleware';
import {
  aiRateLimit,
  apiV1RateLimit,
  apiV2RateLimit,
  fileUploadRateLimit,
} from '@hanzo/esign-lib/server-only/rate-limit/rate-limits';
import { TelemetryClient } from '@hanzo/esign-lib/server-only/telemetry/telemetry-client';
import { migrateDeletedAccountServiceAccount } from '@hanzo/esign-lib/server-only/user/service-accounts/deleted-account';
import { migrateLegacyServiceAccount } from '@hanzo/esign-lib/server-only/user/service-accounts/legacy-service-account';
import { env } from '@hanzo/esign-lib/utils/env';
import { logger } from '@hanzo/esign-lib/utils/logger';
import openApiDocument from '@hanzo/esign-trpc/zap/gen/openapi.json';

import { aiRoute } from './api/ai/route';
import { downloadRoute } from './api/download/download';
import { filesRoute } from './api/files/files';
import { type AppContext, appContext } from './context';
import { appMiddleware } from './middleware';

export interface HonoEnv {
  Variables: RequestIdVariables & {
    context: AppContext;
    logger: Logger;
  };
}

const app = new Hono<HonoEnv>();

/**
 * Database-backed rate limiting for API routes.
 */
const apiV1RateLimitMiddleware = createRateLimitMiddleware(apiV1RateLimit);
const apiV2RateLimitMiddleware = createRateLimitMiddleware(apiV2RateLimit);
const aiRateLimitMiddleware = createRateLimitMiddleware(aiRateLimit);
const fileRateLimitMiddleware = createRateLimitMiddleware(fileUploadRateLimit);

/**
 * Attach session and context to requests.
 */
app.use(contextStorage());
app.use(appContext);

/**
 * RR7 app middleware.
 */
app.use('*', appMiddleware);
app.use('*', requestId());
app.use(async (c, next) => {
  const metadata = c.get('context').requestMetadata;

  const honoLogger = logger.child({
    requestId: c.var.requestId,
    requestPath: c.req.path,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });

  c.set('logger', honoLogger);

  await next();
});

// Every route this server answers lives under /v1. The two public REST surfaces
// each get their own home so neither shadows the other:
//   /v1/rest  the resource API (ts-rest contract, packages/api/v1)
//   /v1/rpc   the operation API (ZAP over JSON-over-HTTP, zap/http-api.ts)
// The Hanzo IAM sign-in returns to /auth/callback, the one browser callback path
// IAM registers for every host (charts/app/values/hanzo/iam-provision.yaml).
app.use('/v1/rest/*', cors());
app.use('/v1/rest/*', apiV1RateLimitMiddleware);
app.use('/v1/rpc/*', cors());
app.use('/v1/rpc/*', apiV2RateLimitMiddleware);

// Auth server.
app.route('/v1/auth', auth);
app.route('/auth/callback', hanzoCallbackRoute);

// Files route.
app.use('/v1/files/upload-pdf', fileRateLimitMiddleware);
app.use('/v1/files/import', fileRateLimitMiddleware);
app.use('/v1/files/presigned-post-url', fileRateLimitMiddleware);
app.route('/v1/files', filesRoute);

// AI route.
app.use('/v1/ai/*', aiRateLimitMiddleware);
app.route('/v1/ai', aiRoute);

// API servers.
app.route('/v1/rest', tsRestHonoApp);
app.use('/v1/jobs/*', jobsClient.getApiHandler());

// The operation API is served over JSON-over-HTTP ZAP, mounted on the
// http.Server in main.js (serveZapHttpApi). httpServe terminates only its POST
// routes there, so the GET spec and the GET download routes still reach Hono.
app.get('/v1/rpc/openapi.json', (c) => c.json(openApiDocument));
app.route('/v1/rpc', downloadRoute);

// Start telemetry client for anonymous usage tracking.
// Can be disabled by setting SIGN_DISABLE_TELEMETRY=true
if (env('NODE_ENV') !== 'development') {
  void TelemetryClient.start();
}

// Start license client to verify license on startup.
void LicenseClient.start();

// Start cron scheduler for background jobs (e.g. envelope expiration sweep).
// No-op for Inngest provider which handles cron externally.
jobsClient.startCron();

void migrateDeletedAccountServiceAccount();
void migrateLegacyServiceAccount();

export default app;
