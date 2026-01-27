FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files for production dependency install (if needed) or just copy node_modules from builder
# Copying node_modules from builder is faster if we didn't use devDeps for runtime.
# However, usually we want to prune dev deps.
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose port (default for most Node apps, adjust if needed)
EXPOSE 4000

# Start command
CMD ["node", "dist/index.js"]
