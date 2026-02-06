import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { CargarEmpresa } from "../components/CargarEmpresa";
import OffersList from "~/components/OffersList";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio - Ofertas recientes" },
    { name: "description", content: "Bienvenido a la aplicación de pasantías" },
  ];
}

/**
 * Página principal que muestra ofertas recientes.
 */
export default function Home() {
  const navigate = useNavigate();
  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ofertas recientes</h1>
        <Button color="default" onPress={() => navigate('/ofertas')}>Ver todas</Button>
      </div>
      <OffersList hideControls onlyRelevantForUser />
    </section>
  );
}
