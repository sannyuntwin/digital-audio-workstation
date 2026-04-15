# Web DAW Server Dockerfile
# Supports both development and production modes via build arguments

ARG NODE_ENV=production
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies based on environment
RUN if [ "$NODE_ENV" = "development" ]; then \
        npm install; \
        npm install -g nodemon; \
    else \
        npm install --omit=dev; \
    fi

# Copy source code
COPY . .

# Copy frontend build for production (only if exists)
RUN if [ -d "../web-daw/build" ]; then \
    cp -r ../web-daw/build ./public; \
    echo "Frontend build copied successfully"; \
    else \
    echo "No frontend build found, continuing without it"; \
    fi

# Create necessary directories
RUN mkdir -p uploads data

# Set permissions
RUN chmod 755 uploads data

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set shell to sh
SHELL ["/bin/sh", "-c"]

# Start command based on environment
CMD if [ "$NODE_ENV" = "development" ]; then \
        /usr/local/bin/npm run dev; \
    else \
        /usr/local/bin/npm start; \
    fi
