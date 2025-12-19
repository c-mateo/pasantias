# tests

Resumen: Pruebas unitarias y funcionales del proyecto.

Estructura:
- `bootstrap.ts` - configuración global de tests.
- `functional/` - pruebas de integración / endpoints.
- `helpers/` - utilidades para creación de fixtures y helpers de test.

Cómo ejecutar:
- `npm test` en la raíz del proyecto (o entrar en cada paquete si corresponde).

Prioridad de mejoras:
- Añadir E2E para el flujo de `offers` (upload, submit, double-apply prevention).
