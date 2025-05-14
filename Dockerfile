# Stage 1: Build application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Create production image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production

COPY --from=builder /app/dist ./dist
#FOR LOCAL RUN ONLY
# COPY .env .env

CMD ["node", "dist/main.js"]
