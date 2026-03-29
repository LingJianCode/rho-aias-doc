# Stage 1: Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy source files
COPY . .

# Build the VitePress documentation
RUN apk add --no-cache git && npm install && npm run build

# Stage 2: Production stage
FROM lipanski/docker-static-website:latest

# Copy built static files from builder stage
COPY --from=builder /app/docs/.vitepress/dist .

CMD ["/busybox-httpd", "-f", "-v", "-p", "3000"]