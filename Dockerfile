# Dockerfile for La Musique Next.js Application

# ---- Base Stage ----
# Use an official Node.js LTS (Long Term Support) image as a parent image.
# Alpine Linux is smaller, but some npm packages might have issues.
# Choose one based on your needs, node:20-slim or node:20-alpine are good options.
FROM node:20.X.Y-slim AS base

# Update system packages to reduce vulnerabilities (use apt for slim)
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally if you plan to use it, otherwise npm or yarn
# RUN npm install -g pnpm

# ---- Dependencies Stage ----
# This stage is for installing dependencies only, to leverage Docker layer caching.
FROM base AS deps
# Copy package.json and lock file
COPY package.json package-lock.json ./ 
# COPY pnpm-lock.yaml ./  # If using pnpm
# COPY yarn.lock ./ # If using yarn

# Install dependencies
# RUN pnpm install --frozen-lockfile # If using pnpm
RUN npm install --frozen-lockfile   # If using npm
# RUN yarn install --frozen-lockfile # If using yarn

# ---- Builder Stage ----
# This stage builds the Next.js application.
FROM base AS builder
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Set build-time environment variables if needed (e.g., for NEXT_PUBLIC_ variables that are fixed at build time)
# ARG NEXT_PUBLIC_SOME_CONFIG
# ENV NEXT_PUBLIC_SOME_CONFIG=${NEXT_PUBLIC_SOME_CONFIG}

# Build the Next.js application
RUN npm run build

# ---- Runner Stage ----
# This stage prepares the final image for running the application.
# It takes the build output from the 'builder' stage and only necessary production dependencies.
FROM base AS runner
WORKDIR /app

# Set environment to production early
ENV NODE_ENV=production

# Optionally, expose the port the app runs on. Default is 3000 for Next.js.
# EXPOSE 3000

# Create a non-root user for better security (Debian/Ubuntu syntax)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --gid 1001 nextjs

# Copy only necessary production files from the 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Switch to the non-root user
USER nextjs

# Healthcheck for container
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# The command to run when the container starts.
CMD ["node", "server.js"]

# If you are not using the standalone output (output: 'standalone' in next.config.js is NOT set):
# You would copy node_modules and the .next folder (excluding .next/cache)
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY package.json .
# CMD ["npm", "start"]

