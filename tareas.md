Revisar reinicio de contraseña y cambio de email

Frontend:
- Interfaz de alumno:
  - Página principal
  - Pagina de usuario
- Recuperar contraseña
- Busqueda/filtrado de ofertas y solicitudes
<!-- # - Restablecer contraseña -->
- Manejo de errores
- Listas de administrador en celulares
- Interfaz para dispositivos móviles
- Internacionalización (i18n) a español (es-AR)

Backend:
- Validaciones de datos
- Crear flujo para cambiar email, contraseña
- TODOs sin completar
- Campos custom


✅ Qué deberías hacer en una API
Opción recomendada: 409 Conflict o 400

Si el usuario ya está autenticado y llama a /login:

return ctx.response.status(409).json({
  type: 'already-authenticated',
  title: 'Already authenticated',
  detail: 'You are already logged in',
})


Alternativas válidas:

400 Bad Request

403 Forbidden

👉 Yo prefiero 409, porque:

El request es válido

Pero el estado actual lo hace conflictivo

🧩 Versión API del GuestMiddleware
export default class ApiGuestMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (await ctx.auth.check()) {
      return ctx.response.status(409).json({
        type: 'already-authenticated',
        message: 'User is already authenticated',
      })
    }

    return next()
  }
}