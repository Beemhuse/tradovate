# ./Dockerfile (frontend)
FROM node:20.11-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --production=false

COPY . .
# For CRA: npm run build
# For Vite: npm run build (same)
RUN npm run build

# --- Serve with nginx ---
FROM nginx:1.27.2-alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html
# or /app/build for CRA:
# COPY --from=build /app/build /usr/share/nginx/html

# Custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
