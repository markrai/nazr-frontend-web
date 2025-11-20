#
# Nazr frontend Dockerfile
#
# Builds the Vite React app and serves the static bundle via nginx.
# Configure the backend URL at build time with:
#   docker build --build-arg VITE_API_BASE_URL=https://nazr.example.com -t nazr-frontend .
#

# ---- Build stage -----------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Ensure devDependencies (TypeScript, Vite, etc.) are installed for the build
ENV NODE_ENV=development

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Allow overriding the backend URL at build time (set before copying source)
ARG VITE_API_BASE_URL=http://localhost:9161
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy the rest of the source and build the production bundle
COPY . .

RUN npm run build

 # ---- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1


