# Etapa de build
FROM node:23-slim AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Etapa final
FROM node:23-slim AS runner
WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json .
RUN npm install --omit=dev
CMD ["npm", "start"]