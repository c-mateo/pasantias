# fiql

Resumen: Módulo para parsing y validación FIQL (custom grammar y transformaciones).

Contenido principal:
- `src/parser.mjs` y `src/index.ts` - implementan el parser y transformaciones.
- `tests/` - pruebas unitarias del parser.

Cómo contribuir:
- Añadir nueva regla en `grammar/` y actualizar `transformer.ts`.
- Ejecutar `npm test` en la carpeta `fiql` para validar cambios.
