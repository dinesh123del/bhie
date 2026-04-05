# Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

# Install frontend dependencies
COPY client/package*.json ./
RUN npm install

# Build frontend
COPY client/ ./
RUN npm run build


# Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/server

# Install backend dependencies
COPY server/package*.json ./
RUN npm install

# Build backend
COPY server/ ./
RUN npm run build


# Final Production Image
FROM node:20-alpine
WORKDIR /app

# The backend expects to find the client build at ../../client/dist relative to its source
# Since the server runs from /app/server/dist/server.js, __dirname is /app/server/dist
# Therefore, path.join(__dirname, '../../client/dist') points to /app/client/dist

# Copy frontend build
COPY --from=frontend-builder /app/client/dist /app/client/dist

# Setup Backend execution environment
WORKDIR /app/server
COPY --from=backend-builder /app/server/package*.json ./
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server/dist ./dist

# Set Default Environment Variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose API/Frontend Port
EXPOSE 5001

# Start the application
CMD ["npm", "run", "start"]
