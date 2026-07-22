FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=build /usr/src/app/dist ./dist

CMD ["npm", "run", "start:prod"]
