# syntax=docker/dockerfile:1.7

# Build production dependencies and compile native modules (sqlite3) for this image.
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev \
	&& npm install --no-save picomatch@4.0.4 \
	&& npm_config_build_from_source=true npm rebuild sqlite3 \
	&& npm prune --omit=dev

# Runtime image: backend-only, designed to sit behind Caddy reverse proxy.
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY scripts ./scripts
COPY src/backend ./src/backend
COPY src/locales ./src/locales

RUN mkdir -p src/backend/uploads/approved src/backend/uploads/pending src/backend/uploads/original src/data \
	&& chown -R node:node /app

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3001) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/backend/src/server.js"]