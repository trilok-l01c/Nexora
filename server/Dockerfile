FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY . .

# Only used by the local-development storage adapter. Production validates that
# S3-compatible storage is configured before the service starts.
RUN mkdir -p storage/uploads && chown -R node:node /app

USER node

EXPOSE 4292

CMD ["npm", "start"]
