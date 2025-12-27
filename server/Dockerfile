FROM node:20.19-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# Copy package files first (cache friendly)
COPY package*.json ./

RUN npm install -g npm@10


RUN npm install --legacy-peer-deps

# Copy rest of app
COPY . .

# Generate Prisma client INSIDE Alpine
RUN npx prisma generate

# Build (if you use ts)
RUN npm run build

EXPOSE 4100

CMD ["npm", "run", "start"]
