FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/i18n ./i18n
# El logo que viaja incrustado en los correos (src/common/mail/brand-logo.ts).
COPY --from=build /app/assets ./assets

EXPOSE 3000
CMD ["node", "dist/src/main"]
