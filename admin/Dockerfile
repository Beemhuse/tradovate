# ===============================
# Build stage
# ===============================
FROM node:20.11-alpine AS build

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Build admin app
RUN npm run build

# ===============================
# Production stage (nginx)
# ===============================
FROM nginx:1.27.2-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
# Vite output
COPY --from=build /app/dist /usr/share/nginx/html

# If CRA, use instead:
# COPY --from=build /app/build /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
