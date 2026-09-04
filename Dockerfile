FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# prisma generate solo necesita que estas variables existan (no una conexión
# real) para resolver el schema — los valores reales los inyecta el .env en runtime.
ENV CENTRAL_DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV CENTRAL_SHADOW_DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder_shadow"
ENV TENANT_MIGRATION_DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV TENANT_MIGRATION_SHADOW_DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder_shadow"
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
# NODE_ENV se deja fuera a propósito: el backend usa NODE_ENV==='production'
# para marcar la cookie de sesión como Secure, y este ambiente dev todavía
# se sirve por HTTP plano (sin dominio/SSL) — con Secure, el navegador
# descarta la cookie y el login nunca "queda pegado" (401 en toda ruta
# protegida aunque el login en sí sea correcto). Revisar cuando haya
# dominio + HTTPS vía Nginx Proxy Manager.

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/i18n ./i18n

EXPOSE 3000
CMD ["node", "dist/src/main"]
