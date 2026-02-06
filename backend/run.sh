#!/bin/sh

# Esperar a la DB
until npx prisma debug > /dev/null 2>&1; do
  echo 'DB not ready, retrying...'
  sleep 2
done

echo 'DB detectada, aplicando migraciones...'

# El error "unexpected fi" suele ser porque falta el "then" aquí:
if npx prisma migrate deploy; then
  echo 'Migraciones exitosas'
  node ./bin/server.js
else
  echo 'Error en las migraciones'
  exit 1
fi