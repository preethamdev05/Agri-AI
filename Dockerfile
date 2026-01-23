# Stage 1: Build React App
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cache invalidation only if package files change)
COPY package.json package-lock.json* ./
# Force clean install to avoid lockfile issues
RUN npm ci

# Copy source code
COPY . .

# Build for production
# VITE_API_BASE_URL is set to /api to use the local Nginx proxy
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install envsubst for runtime config injection
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Cloud Run Environment Variables
ENV PORT=8080
ENV BACKEND_URL=http://localhost:8000 

# Entrypoint: Substitute env vars in nginx config and start nginx
CMD ["/bin/sh", "-c", "envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
