FROM node:24-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN npm install -g pnpm

# Fix pnpm global bin directory
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME

WORKDIR /app

# -------------------
FROM base AS prepare

# Install turbo globally
RUN pnpm install -g turbo@^2.5.8

COPY . .
RUN turbo prune @lms/nextjs --docker

# -------------------
FROM base AS builder
COPY --from=prepare /app/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ ./
RUN pnpm turbo run build --filter=@lms/nextjs...

# -------------------
FROM node:24-alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public

EXPOSE 3000

CMD ["node", "apps/nextjs/server.js"]
