FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

FROM deps AS builder
WORKDIR /app
COPY . .
# Подтянуть зависимости из package.json (html-to-image и др.), если lock устарел.
RUN npm install --no-audit --no-fund
ENV NODE_ENV=production
# NEXT_PUBLIC_* в клиентский бандл. На Amvera на этапе build нет env из панели —
# положите значения в .env.production (см. .env.production.example).
# Docker Compose может передать build-args — они перекрывают .env.production.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
RUN set -e; \
  if [ -f .env.production ]; then \
    sed 's/\r$//' .env.production > /tmp/env.production && set -a && . /tmp/env.production && set +a; \
  fi; \
  if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then export NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"; fi; \
  if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then export NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"; fi; \
  if [ -n "$NEXT_PUBLIC_SITE_URL" ]; then export NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL"; fi; \
  npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
