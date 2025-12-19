# Manual de Usuario

Este manual cubre los roles principales: Estudiante (user) y Admin (empresa / administrador).

1) Estudiante

- Creación de cuenta / Login
  - Registrarse con email y contraseña.

- Navegar Ofertas
  - Buscar y abrir una oferta pública.
  - Ver requisitos y documentos solicitados.

- Borrador de postulación
  - El borrador se guarda automáticamente al modificar campos.
  - Subir documentos: arrastrar y soltar o hacer clic en el área correspondiente (solo PDF).
  - Descargar documento subido: botón "Descargar" junto a cada documento.
  - Desvincular documento: botón "Desvincular".
  - El borrador puede eliminarse con el botón "Eliminar borrador".

- Enviar postulación
  - Cuando estén todos los documentos requeridos y no haya cargas en progreso, el botón "Aplicar" estará disponible.
  - Si ya aplicaste a la oferta, la carga y el botón de "Aplicar" se deshabilitan.

2) Admin

- Gestión de ofertas, usuarios, y documentos desde la interfaz de administración.
- Descargar documentos de usuarios vía el endpoint admin (en la sección de Documentos).

Buenas prácticas
- Mantener copias locales de documentos importantes.
- No reusar la misma cuenta si se trata de otra persona.

Soporte
- Ante errores en la subida de archivos, revisar la consola del navegador y capturar la traza (incluyendo la respuesta del endpoint `GET /offers/:offerId/draft`).

