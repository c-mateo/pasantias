import type { Route } from "./+types/ofertasPublic";
import OffersListDemo from "~/components/OffersListDemo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ofertas - Explorar" },
    { name: "description", content: "Explora las ofertas disponibles" },
  ];
}

export default function OfertasPublic() {
  return (
    <main className="min-h-screen bg-gray-50">
      <OffersListDemo />
    </main>
  );
}
