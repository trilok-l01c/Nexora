FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY . .

# Create uploads directory.
RUN mkdir -p storage/uploads

EXPOSE 4292

CMD ["node", "server.js"]
