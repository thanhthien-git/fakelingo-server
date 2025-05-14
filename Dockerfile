# STEP 1
# Stage 1: Build application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --legacy-peer-deps

COPY . .
RUN yarn build

# Stage 2: Create production image
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --legacy-peer-deps --production

COPY --from=builder /app/dist ./dist
# FOR LOCAL RUN ONLY
# COPY .env .env

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
