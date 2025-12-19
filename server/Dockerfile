FROM node:20-alpine

WORKDIR /app

# Install dependencies needed by Prisma
RUN apk add --no-cache openssl

# Copy package files first (cache friendly)
COPY package*.json ./

RUN npm install

# Copy rest of app
COPY . .

# Generate Prisma client INSIDE Alpine
RUN npx prisma generate

# Build (if you use ts)
RUN npm run build

EXPOSE 4100

CMD ["npm", "run", "start"]
