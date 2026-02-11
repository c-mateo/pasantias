# 📚 Guía de Navegación - Documentación del Sistema de Pasantías

Bienvenido a la documentación del Sistema de Gestión de Pasantías. Este documento te ayuda a encontrar rápidamente la información que necesitas.

---

## 🗺️ Mapa de Documentación

### Para Empezar Rápido

- **[01_quick-start.md](01_quick-start.md)** ⚡
  - Levantar el proyecto en 5 minutos
  - Requisitos mínimos
  - Comandos esenciales
  - Primeros pasos

### Arquitectura y Diseño

- **[02_architecture.md](02_architecture.md)** 🏗️
  - Diagrama de arquitectura
  - Stack tecnológico
  - Flujo de datos
  - Organización del código

### API REST

- **[03_api-essentials.md](03_api-essentials.md)** 🚀
  - Top 10 endpoints más usados
  - Ejemplos con curl
  - Casos de uso comunes
  - Referencia rápida

- **[openapi.yaml](openapi.yaml)** 📋
  - Especificación OpenAPI 3.1.0 completa
  - Todos los endpoints (46 total)
  - Schemas de request/response
  - Para importar en Postman/Insomnia

- **[api.md](api.md)** 📖
  - Documentación detallada de la API
  - Convenciones y estándares
  - Autenticación y autorización
  - Filtros, paginación, errores

### Manual de Usuario

- **[manual-usuario.md](manual-usuario.md)** 👤
  - Guía paso a paso para estudiantes
  - Guía para administradores
  - Capturas de pantalla (placeholders)
  - Errores comunes y soluciones

### Informe Académico

- **[informe.md](informe.md)** 🎓
  - Documento académico completo (~12,000 palabras)
  - Contexto y objetivos del proyecto
  - Marco teórico y estado del arte
  - Desarrollo e implementación
  - Resultados y conclusiones
  - Bibliografía y anexos

---

## 🎯 ¿Qué Necesitas?

### "Quiero levantar el proyecto YA"
→ Ve directo a **[01_quick-start.md](01_quick-start.md)**

### "Necesito entender cómo funciona el sistema"
→ Lee **[02_architecture.md](02_architecture.md)** primero

### "Quiero integrarme con la API"
→ Comienza con **[03_api-essentials.md](03_api-essentials.md)**, luego profundiza en **[api.md](api.md)**

### "Necesito documentar endpoints para Postman"
→ Importa **[openapi.yaml](openapi.yaml)** directamente

### "Soy usuario final del sistema"
→ Consulta **[manual-usuario.md](manual-usuario.md)**

### "Necesito presentar el proyecto académicamente"
→ Usa **[informe.md](informe.md)** como base

---

## 📂 Estructura del Repositorio

```
pasantias/
├── backend/           # API REST (AdonisJS + Prisma + PostgreSQL)
├── frontend/          # SPA (React + React Router)
├── docs/              # 📍 ESTÁS AQUÍ
│   ├── 00_LEEME.md                   # Este archivo
│   ├── 01_quick-start.md             # Inicio rápido
│   ├── 02_architecture.md            # Arquitectura
│   ├── 03_api-essentials.md          # API esencial
│   ├── openapi.yaml                  # Spec OpenAPI completa
│   ├── api.md                        # Documentación API detallada
│   ├── manual-usuario.md             # Manual de usuario
│   └── informe.md                    # Informe académico
└── README.md          # Readme principal del proyecto
```

---

## 🔗 Enlaces Útiles

- **Repositorio:** https://github.com/c-mateo/pasantias
- **AdonisJS Docs:** https://docs.adonisjs.com/
- **React Router Docs:** https://reactrouter.com/
- **Prisma Docs:** https://www.prisma.io/docs

---

## 📝 Convenciones de Documentación

- **⚡ Rápido:** Documentos de 5-10 minutos de lectura
- **📖 Detallado:** Documentos de 20-60 minutos de lectura
- **🎓 Académico:** Documentos formales para presentación

- `código en línea`
- **negrita** para conceptos importantes
- [enlaces](url) para referencias cruzadas

---

## 🆘 ¿Falta algo?

Si la documentación no responde tu pregunta:

1. Busca en los issues de GitHub
2. Consulta el código fuente directamente
3. Crea un issue describiendo qué información falta

---

**Última actualización:** Febrero 2026  
**Versión de la documentación:** 0.1.0