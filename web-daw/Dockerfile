# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments
ARG NODE_ENV=development
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_WS_URL=ws://localhost:8000

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
