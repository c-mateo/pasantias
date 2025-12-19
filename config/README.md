# config

Resumen: Configuraciones del proyecto (bodyparser, cors, logger, mail, redis, session, websocket, etc.).

Notas:
- Evitar hardcodear credenciales: usa variables de entorno y `dotenv` durante desarrollo.
- Revisar `config/*.ts` para valores por defecto y límites (ej: `limiter.ts` para rate limiting).
