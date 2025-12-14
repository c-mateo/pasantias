import type { Route } from "./+types/homePublic";
import OffersListDemo from "~/components/OffersListDemo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio - Ofertas recientes" },
    { name: "description", content: "Ofertas recientes - Explora las últimas oportunidades" },
  ];
}

export default function HomePublic() {
  return (
    <main className="min-h-screen bg-gray-50">
      <OffersListDemo />
    </main>
  );
}
