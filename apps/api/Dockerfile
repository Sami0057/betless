FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# Install dependencies
FROM base AS deps
COPY package.json ./
COPY ../../packages/shared/package.json ./packages/shared/
RUN npm install --production

# Build
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 betless

COPY --from=builder --chown=betless:nodejs /app/dist ./dist
COPY --from=deps --chown=betless:nodejs /app/node_modules ./node_modules
COPY --chown=betless:nodejs package.json ./

RUN mkdir -p uploads logs && chown -R betless:nodejs uploads logs

USER betless

EXPOSE 4000
CMD ["node", "dist/index.js"]
