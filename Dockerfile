FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=8080
ENV API_PROTOCOL=http

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

USER app

EXPOSE 8080

CMD ["node", "src/index.js"]
