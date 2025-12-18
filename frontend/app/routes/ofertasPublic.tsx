import type { Route } from "./+types/ofertasPublic";
import OffersList from "~/components/OffersList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ofertas - Explorar" },
    { name: "description", content: "Explora las ofertas disponibles" },
  ];
}

export default function OfertasPublic() {
  return (
    <main className="min-h-screen bg-gray-50">
      <OffersList />
    </main>
  );
}
