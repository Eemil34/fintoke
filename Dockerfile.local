FROM node:20-bookworm AS deps
WORKDIR /app
ENV CI=1
ENV SKIP_ENV_SETUP=1
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:20-bookworm AS builder
WORKDIR /app
ENV CI=1
ENV SKIP_ENV_SETUP=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:./data/cc.db
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p data \
  && npx prisma generate \
  && npx next build

FROM node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV CI=1
ENV SKIP_ENV_SETUP=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/app/data/cc.db
ENV PROJECTS_DIR=/app/data/projects
ENV SETTINGS_DIR=/app/data

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.js ./next.config.js

RUN mkdir -p /app/data/projects
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "scripts/start-prod.js"]
