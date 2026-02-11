# 🎓 Sistema de Gestión de Pasantías

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**Plataforma web integral para la gestión de pasantías universitarias**

[Características](#-características-principales) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación) • [Contribuir](#-cómo-contribuir)

</div>

---

## 📖 Sobre el Proyecto

Sistema web que digitaliza y automatiza el proceso completo de gestión de pasantías universitarias, conectando estudiantes con empresas de forma eficiente y organizada.

### El Problema

Las instituciones educativas gestionan pasantías mediante procesos manuales (email, hojas de cálculo) que resultan en:
- ❌ Información dispersa y desorganizada
- ❌ Duplicación de esfuerzos (resubir documentos)
- ❌ Falta de trazabilidad del proceso
- ❌ Dificultad para escalar con alto volumen

### La Solución

Una plataforma centralizada que proporciona:
- ✅ Exploración y búsqueda de ofertas con filtros avanzados
- ✅ Flujo de postulación estructurado con gestión de documentos
- ✅ Deduplicación de documentos a nivel de almacenamiento (no implica un flujo explícito de “reutilizar” en la UI)
- ✅ Panel administrativo completo para empresas y gestión académica
- ✅ Notificaciones automáticas por email e in-app
- ✅ Trazabilidad completa del proceso de selección

---

## ✨ Características Principales

### Para Estudiantes

- 🔍 **Búsqueda avanzada** de ofertas por carrera, skills, ubicación
- 📝 **Borradores de postulación** guardados automáticamente
- 📄 **Gestión de documentos** PDF con deduplicación inteligente
- 🔄 **Deduplicación** de documentos en almacenamiento (no obliga a una acción de “reutilizar” en la UI)
- 📊 **Dashboard** personalizado con estado de postulaciones
- 🔔 **Notificaciones** en tiempo real sobre cambios de estado
- 👤 **Perfil completo** con carreras, habilidades y datos personales

### Para Administradores

- 🏢 **Gestión de empresas** y ofertas de pasantías
- 👥 **Revisión de postulaciones** con acceso a documentación completa
- ✅ **Aprobación/rechazo** con feedback personalizado
- 📧 **Notificaciones automáticas** a usuarios
- 🎓 **Administración** de carreras, skills y tipos de documentos
- 📈 **Visibilidad completa** del proceso de selección
- 🛡️ **Control de acceso** basado en roles (RBAC)

---

## 🛠️ Stack Tecnológico

<table>
  <tr>
    <td align="center" width="33%">
      <h3>Backend</h3>
      <img src="https://img.shields.io/badge/AdonisJS-6-5A45FF?style=flat-square&logo=adonisjs&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    </td>
    <td align="center" width="33%">
      <h3>Frontend</h3>
      <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" /><br/>
      <img src="https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    </td>
    <td align="center" width="33%">
      <h3>DevOps & Tools</h3>
      <img src="https://img.shields.io/badge/Docker-24-2496ED?style=flat-square&logo=docker&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white" /><br/>
      <img src="https://img.shields.io/badge/VSCode-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white" />
    </td>
  </tr>
</table>

**Arquitectura:** Cliente-Servidor con API REST | **ORM:** Prisma | **Validación:** VineJS | **Autenticación:** Session-based (cookies)

---

## 🚀 Instalación Rápida

### Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 13
- npm o yarn
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/c-mateo/pasantias.git
cd pasantias
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Cargar datos de prueba
npm run prisma:seed
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 4. Iniciar en Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**¡Listo!** Abre http://localhost:5173 en tu navegador.

> **💡 Guía detallada:** Para instrucciones paso a paso, consulta [docs/01_quick-start.md](docs/01_quick-start.md)

---

## 📂 Estructura del Proyecto

```
pasantias/
├── backend/              # API REST (AdonisJS + Prisma)
│   ├── app/
│   │   ├── controllers/  # 11 controladores HTTP
│   │   ├── validators/   # Esquemas de validación VineJS
│   │   ├── middleware/   # Auth, CORS, etc.
│   │   └── jobs/         # Tareas en background (emails, notificaciones)
│   ├── prisma/
│   │   ├── schema.prisma # Definición de modelos (16 tablas)
│   │   └── migrations/   # Migraciones SQL
│   ├── start/
│   │   └── routes.ts     # 46 endpoints REST
│   └── uploads/          # PDFs subidos por usuarios
│
├── frontend/             # SPA (React + React Router)
│   ├── app/
│   │   ├── api/          # Cliente API + tipos TypeScript
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas por ruta
│   │   └── utils/        # Helpers y utilidades
│   └── public/           # Assets estáticos
│
├── docs/                 # 📚 Documentación completa
│   ├── 00_LEEME.md              # Guía de navegación
│   ├── 01_quick-start.md        # Instalación en 5 minutos
│   ├── 02_architecture.md       # Arquitectura del sistema
│   ├── 03_api-essentials.md     # Top 10 endpoints
│   ├── openapi.yaml             # Especificación OpenAPI 3.1.0
│   ├── api.md                   # Documentación completa de API
│   ├── manual-usuario.md        # Manual de usuario final
│
└── README.md             # Este archivo
```

---

## 📚 Documentación

### Guías de Inicio

- 📖 **[Guía de Navegación](docs/00_LEEME.md)** - Mapa de toda la documentación
- ⚡ **[Quick Start](docs/01_quick-start.md)** - Levanta el proyecto en 5 minutos
- 🏗️ **[Arquitectura](docs/02_architecture.md)** - Diagrama y explicación del sistema

### Documentación de API

- 🚀 **[API Essentials](docs/03_api-essentials.md)** - Top 10 endpoints más usados con ejemplos
- 📋 **[Especificación OpenAPI](docs/openapi.yaml)** - Para importar en Postman/Insomnia
- 📖 **[API Completa](docs/api.md)** - Documentación exhaustiva de los 46 endpoints

### Manuales y Reportes

- 👤 **[Manual de Usuario](docs/manual-usuario.md)** - Guía paso a paso para usuarios finales

---

## 🔑 Funcionalidades Técnicas Destacadas

### Seguridad

- 🔐 **Autenticación session-based** con cookies HttpOnly (XSS-proof)
- 🛡️ **Control de acceso basado en roles** (RBAC: Student/Admin)
- 🔒 **Passwords hasheadas** con bcrypt (10 rounds)
- ✅ **Validación exhaustiva** con VineJS en todos los endpoints
- 🚫 **Prevención de SQL injection** (Prisma ORM con queries parametrizadas)

### Rendimiento

- ⚡ **Paginación cursor-based** eficiente en todos los listados
- 📊 **Índices optimizados** en PostgreSQL
- 💾 **Deduplicación de archivos** mediante hash SHA256
- 🔄 **Transacciones ACID** para operaciones críticas

### Gestión de Archivos

- 📄 **Upload de PDFs** hasta 10 MB
- 🔁 **Deduplicación inteligente** de documentos en almacenamiento (no obliga a una acción de reuso en la UI)
- 🗑️ **Eliminación programada** de archivos huérfanos (TTL de 7 días)
- ✅ **Validación de integridad** (Content-Length vs tamaño real)

---

## 🧪 Testing

### Tests Implementados

- ✅ **Testing manual exhaustivo** de todos los flujos
- ✅ **Validación de seguridad** (autenticación, autorización)
- ✅ **Verificación de integridad** de datos

### Tests Pendientes (Trabajo Futuro)

- ⏳ Tests unitarios con Jest
- ⏳ Tests de integración de API con Supertest
- ⏳ Tests E2E con Playwright/Cypress

---

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/amazing-feature`)
3. **Commit** tus cambios (`git commit -m 'Add: amazing feature'`)
4. **Push** a la rama (`git push origin feature/amazing-feature`)
5. Abre un **Pull Request**

### Guidelines

- Sigue las convenciones de código existentes (TypeScript, Prettier)
- Añade tests para nuevas funcionalidades (cuando el framework esté implementado)
- Actualiza la documentación si es necesario
- Escribe commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🗺️ Roadmap

### v0.2.0 (Próximo)
- [ ] Tests automatizados (unitarios, integración, E2E)
- [ ] Dashboard con estadísticas y gráficos
- [ ] Exportación de reportes en PDF/Excel
- [ ] Rate limiting en API
- [ ] Implementación de Redis para caché

### v0.3.0 (Futuro)
- [ ] Validación completa de custom fields dinámicos
- [ ] Notificaciones push del navegador (Web Push API)
- [ ] Búsqueda full-text con PostgreSQL tsvector
- [ ] Sistema de mensajería entre usuarios
- [ ] 2FA (Two-Factor Authentication)

### v1.0.0 (Largo plazo)
- [ ] Gestión de pasantías activas (seguimiento, reportes)
- [ ] Firma digital de convenios
- [ ] Evaluaciones de desempeño
- [ ] Integración con sistemas académicos (SIU)
- [ ] App móvil (React Native)

---

## 🙏 Agradecimientos

- **[AdonisJS](https://adonisjs.com/)** - Framework backend elegante y productivo
- **[Prisma](https://www.prisma.io/)** - ORM de nueva generación
- **[React](https://react.dev/)** y **[React Router](https://reactrouter.com/)** - Herramientas frontend modernas
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos robusta y confiable
- **[Flaticon](https://www.flaticon.com/)** - Iconos utilizados en la interfaz

---

## 📌 Recursos Útiles

### Links Rápidos

- [🌐 Demo en vivo](#) _(si está disponible)_
- [📖 Documentación completa](docs/00_LEEME.md)
- [🚀 API Reference](docs/openapi.yaml)

### Tecnologías Relacionadas

- [AdonisJS Documentation](https://docs.adonisjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

<div align="center">

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub ⭐**

[⬆ Volver arriba](#-sistema-de-gestión-de-pasantías)

</div>