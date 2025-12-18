FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
