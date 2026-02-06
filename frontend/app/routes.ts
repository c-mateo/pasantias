import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Rutas públicas con layout
  layout("layouts/PublicLayout.tsx", [
    index("routes/homePublic.tsx"),
    route("ofertas", "routes/ofertasPublic.tsx"),
    route("ofertas/:ofertaId", "routes/ofertasPublic/OfertaPublic.tsx"),
    route("login", "routes/auth/Login.tsx"),
    route("forgot-password", "routes/auth/ForgotPassword.tsx"),
    route("reset-password", "routes/reset-password.tsx"),
    route("register", "routes/auth/Register.tsx"),
    route("confirm-email", "routes/confirm-email.tsx"),
    route("verify-email", "routes/verify-email.tsx"),
    route("profile", "routes/profile.tsx"),
    route("notifications", "routes/notifications.tsx"),
    route("applications", "routes/applications.tsx"),
    route("applications/:applicationId", "routes/my-application.tsx"),
  ]),

  // Panel de administración con navbar
  route("admin", "layouts/NavbarLayout.tsx", [
    index("routes/admin/AdminIndex.tsx"),
    route("home", "routes/home.tsx"),
    route("usuarios", "routes/admin/Usuarios.tsx"),
    route("usuarios/:usuarioId", "routes/admin/Usuario.tsx"),
    route("ofertas", "routes/admin/Ofertas.tsx"),
    route("ofertas/:ofertaId", "routes/admin/Oferta.tsx"),
    route("carreras", "routes/admin/Carreras.tsx"),
    route("carreras/:carreraId", "routes/admin/Carrera.tsx"),
    route("empresas", "routes/admin/Empresas.tsx"),
    route("empresas/:empresaId", "routes/admin/Empresa.tsx"),
    route("skills", "routes/admin/Skills.tsx"),
    route("skills/:skillId", "routes/admin/Skill.tsx"),
    route("document-types", "routes/admin/DocumentTypes.tsx"),
    route("document-types/:documentTypeId", "routes/admin/DocumentType.tsx"),
    route("aplicaciones", "routes/admin/Aplicaciones.tsx"),
    route("aplicaciones/:applicationId", "routes/admin/Application.tsx"),
  ]),
] satisfies RouteConfig;
