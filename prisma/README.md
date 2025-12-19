# prisma

Resumen: Contiene el esquema Prisma, migraciones y scripts de seed.

Contenido importante:
- `schema.prisma` - definición del modelo de datos.
- `migrations/` - migraciones generadas por `prisma migrate`.
- `seed.ts` - scripts de seed para poblar datos de ejemplo.

Cómo trabajar:
- Ejecutar migraciones: `npx prisma migrate dev` (o usar la tarea preconfigurada del proyecto).
- Ejecutar seed: `node prisma/seed.ts` o mediante la configuración definida en `package.json`.

Notas:
- Evitar cambios que rompan la compatibilidad de las migraciones existentes; cuando sea necesario, crear nuevas migraciones en lugar de editar versiones pasadas.
