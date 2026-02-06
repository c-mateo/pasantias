#!/bin/sh
set -eu

echo "Esperando a la DB..."

# Reintenta hasta que Prisma pueda hablar con la DB
until npx prisma migrate deploy >/dev/null 2>&1; do
  echo "DB no lista o migraciones fallaron, reintentando en 2s..."
  sleep 2
done

echo "DB lista, migraciones aplicadas."

echo "Iniciando servidor..."
exec node ./bin/server.js
