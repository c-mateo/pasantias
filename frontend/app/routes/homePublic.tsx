import type { Route } from "./+types/homePublic";
import OffersList from "~/components/OffersList";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio - Ofertas recientes" },
    { name: "description", content: "Ofertas recientes - Explora las últimas oportunidades" },
  ];
}

export default function HomePublic() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Ofertas recientes</h1>
          <Button color="default" onPress={() => navigate('/ofertas')}>Ver todas</Button>
        </div>
        <OffersList />
      </section>
    </main>
  );
}
