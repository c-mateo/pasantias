import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Rutas públicas: index, login / register (no usan el layout de administración)
  index("routes/homePublic.tsx"),
  route("ofertas", "routes/ofertasPublic.tsx"),
  route("ofertas/:ofertaId", "routes/ofertasPublic/OfertaPublic.tsx"),
  route("login", "routes/auth/Login.tsx"),
  route("register", "routes/auth/Register.tsx"),

  // Panel de administración con navbar
  route("admin", "layouts/NavbarLayout.tsx", [
    route("home", "routes/home.tsx"),
    route("usuarios", "routes/admin/Usuarios.tsx"),
    route("ofertas", "routes/admin/Ofertas.tsx"),
    route("ofertas/:ofertaId", "routes/admin/Oferta.tsx"),
    route("carreras", "routes/admin/Carreras.tsx"),
    route("carreras/:carreraId", "routes/admin/Carrera.tsx"),
    route("empresas", "routes/admin/Empresas.tsx"),
    route("empresas/:empresaId", "routes/admin/Empresa.tsx"),
    route("aplicaciones", "routes/admin/Aplicaciones.tsx"),
  ]),
] satisfies RouteConfig;
