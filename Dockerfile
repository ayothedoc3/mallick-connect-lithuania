# Build with bun, run the Nitro node-server output with node.
# The node-server preset (see vite.config.ts) bundles deps into .output,
# so the runtime image needs only .output, no node_modules.

# ---- builder ----
FROM oven/bun:1 AS builder
WORKDIR /app
# Vite inlines VITE_* variables at BUILD time, so they must be passed as build args.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
COPY --from=builder /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
