###########################
#     BASE CONTAINER      #
###########################
FROM node:22-alpine3.22 AS base

RUN apk add --no-cache openssl
RUN apk add --no-cache font-freefont


###########################
#    BUILDER CONTAINER    #
###########################
FROM base AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache jq
WORKDIR /app

COPY . .

RUN npm install -g "turbo@2.10.13"

# Outputs to the /out folder
# source: https://turbo.build/repo/docs/reference/command-line-reference/prune#--docker
RUN turbo prune @hanzo/esign-remix --docker

###########################
#   INSTALLER CONTAINER   #
###########################
FROM base AS installer

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache jq
# Required for node_modules/aws-crt
RUN apk add --no-cache make cmake g++ openssl bash

WORKDIR /app

# Disable husky from installing hooks
ENV HUSKY 0
ENV DOCKER_OUTPUT 1
ENV NEXT_TELEMETRY_DISABLED 1

# Encryption keys
ARG NEXT_PRIVATE_ENCRYPTION_KEY="CAFEBABE"
ENV NEXT_PRIVATE_ENCRYPTION_KEY="$NEXT_PRIVATE_ENCRYPTION_KEY"

ARG NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY="DEADBEEF"
ENV NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY="$NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY"

# Telemetry credentials (optional, baked into image at build time)
ARG NEXT_PRIVATE_TELEMETRY_KEY=""
ENV NEXT_PRIVATE_TELEMETRY_KEY="$NEXT_PRIVATE_TELEMETRY_KEY"

ARG NEXT_PRIVATE_TELEMETRY_HOST=""
ENV NEXT_PRIVATE_TELEMETRY_HOST="$NEXT_PRIVATE_TELEMETRY_HOST"


# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
# Use the FULL committed lockfile (not turbo's pruned one). turbo's
# `prune --docker` emits a pruned package-lock.json that npm ci/install
# reject; dropping it entirely makes npm resolve NEWER deps (e.g. @types/react
# with Radix's CSSProperties augmentation, react-beautiful-dnd types) that
# break the typecheck with ~41 TS2322 errors. The full committed lockfile
# pins the exact compatible versions the tree was verified against.
COPY --from=builder /app/package-lock.json ./package-lock.json

COPY --from=builder /app/lingui.config.ts ./lingui.config.ts

RUN npm install --no-audit --no-fund

# Then copy all the source code (as it changes more often)
COPY --from=builder /app/out/full/ .
# Finally copy the turbo.json file so that we can run turbo commands
COPY turbo.json turbo.json

RUN npm install -g "turbo@2.10.13"

RUN turbo run build --filter=@hanzo/esign-remix...

###########################
#     RUNNER CONTAINER    #
###########################
FROM base AS runner

ENV HUSKY 0
ENV DOCKER_OUTPUT 1

# Telemetry credentials (baked into image at build time, can be disabled at runtime)
ARG NEXT_PRIVATE_TELEMETRY_KEY=""
ENV NEXT_PRIVATE_TELEMETRY_KEY="$NEXT_PRIVATE_TELEMETRY_KEY"

ARG NEXT_PRIVATE_TELEMETRY_HOST=""
ENV NEXT_PRIVATE_TELEMETRY_HOST="$NEXT_PRIVATE_TELEMETRY_HOST"

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

USER nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/out/json/ .
# Copy the tailwind config files across
COPY --from=builder --chown=nodejs:nodejs /app/out/full/packages/tailwind-config ./packages/tailwind-config

COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json
RUN npm install --omit=dev --no-audit --no-fund

# Automatically leverage output traces to reduce image size
# https://nodejs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nodejs:nodejs /app/apps/remix/build ./apps/remix/build
COPY --from=installer --chown=nodejs:nodejs /app/apps/remix/public ./apps/remix/public

# Copy the prisma config, schema and migrations. Prisma 7 reads the database URL
# from prisma.config.ts, so `migrate deploy` in start.sh names it.
COPY --from=installer --chown=nodejs:nodejs /app/packages/prisma/prisma.config.ts ./packages/prisma/prisma.config.ts
COPY --from=installer --chown=nodejs:nodejs /app/packages/prisma/schema.prisma ./packages/prisma/schema.prisma
COPY --from=installer --chown=nodejs:nodejs /app/packages/prisma/migrations ./packages/prisma/migrations

# Generate the prisma client again
RUN npx prisma generate --schema ./packages/prisma/schema.prisma


# Get the start script from docker/
COPY --chown=nodejs:nodejs ./docker/start.sh /app/apps/remix/start.sh

WORKDIR /app/apps/remix

CMD ["sh", "start.sh"]
