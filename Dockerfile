
# Dockerfile for La Musique Next.js Application

# ---- Base Stage ----
# Use an official Node.js LTS (Long Term Support) image as a parent image.
# Alpine Linux is smaller, but some npm packages might have issues.
# Choose one based on your needs, node:20-slim or node:20-alpine are good options.
FROM node:20-slim AS base

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally if you plan to use it, otherwise npm or yarn
# RUN npm install -g pnpm

# ---- Dependencies Stage ----
# This stage is for installing dependencies only, to leverage Docker layer caching.
FROM base AS deps
# Copy package.json and lock file
COPY package.json ./
# COPY pnpm-lock.yaml ./  # If using pnpm
COPY package-lock.json ./ # If using npm (or remove if using yarn/pnpm)
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

# Set environment to production
ENV NODE_ENV production
# Optionally, expose the port the app runs on. Default is 3000 for Next.js.
# This project uses 9002 as per package.json dev script, but Next.js start often defaults to 3000.
# Vercel and other platforms might override this.
# EXPOSE 3000
# If you need to run on a specific port using `npm start` which might read from HOST/PORT env vars:
# ENV PORT 9002
# ENV HOST 0.0.0.0


# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary production files from the 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# The command to run when the container starts.
# Next.js standalone output runs server.js in its root.
# If not using standalone, it would be "npm", "start"
CMD ["node", "server.js"]

# If you are not using the standalone output (output: 'standalone' in next.config.js is NOT set):
# You would copy node_modules and the .next folder (excluding .next/cache)
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY package.json .
# CMD ["npm", "start"]

# Healthcheck (optional, but good practice)
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3000/api/health || exit 1
# Note: Adjust the port in HEALTHCHECK if your app runs on a different one internally.
# The /api/health endpoint is assumed to be present.

