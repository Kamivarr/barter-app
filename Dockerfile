# syntax=docker/dockerfile:1

# 1. Obraz bazowy z bibliotekami libc6-compat i openssl (dla silnika Prisma w środowisku Alpine Linux)
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# 2. Etap instalacji zależności (warstwowy cache npm)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Etap deweloperski
FROM base AS development
WORKDIR /app
ENV NODE_ENV=development
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node
RUN npx prisma generate

EXPOSE 3001
CMD ["sh", "-c", "npx prisma generate && npm run dev -- -H 0.0.0.0"]

# 4. Etap budowania produkcyjnego
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# 5. Etap produkcyjny (lekki runner z Next.js standalone)
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public

RUN mkdir .next && chown node:node .next

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma

USER node
EXPOSE 3001
CMD ["node", "server.js"]
