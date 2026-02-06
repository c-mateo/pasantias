import React, { useEffect, useState } from "react";
import OffersList from "./OffersList";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";
import OfferCard from "./OfferCard";
import { api } from "~/api/api";
import { useAuthState } from "~/util/AuthContext";

function FeaturedOffers() {
  const [items, setItems] = useState<any[]>([]);
  const auth = useAuthState();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/offers?limit=20').json<any>();
        const data = res?.data ?? [];

        // If user has courses, prefer offers that match user's courses
        const userCourses = (auth.user as any)?.courses ?? [];
        const preferred: any[] = [];
        const others: any[] = [];
        data.forEach((it: any) => {
          const cs = (it.careers ?? it.courses) as any[] | undefined;
          const match = (cs || []).some((c) => userCourses.some((uc: any) => (typeof c === 'string' ? c : c.name) === (uc.name ?? uc)));
          if (match) preferred.push(it);
          else others.push(it);
        });

        // sort preferred by expiresAt asc, then others by expiresAt
        preferred.sort((a, b) => (a.expiresAt || '').localeCompare(b.expiresAt || ''));
        others.sort((a, b) => (a.expiresAt || '').localeCompare(b.expiresAt || ''));

        setItems([...preferred, ...others].slice(0, 6));
      } catch (err) {
        console.error(err);
        setItems([]);
      }
    })();
  }, [auth.user]);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Ofertas destacadas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <OfferCard
            key={it.id}
            id={it.id}
            position={it.position}
            company={it.company?.name}
            location={it.location}
            vacancies={it.vacancies}
            expiresAt={it.expiresAt}
            description={it.description}
            careers={(it.careers ?? it.courses) as any[]}
            skills={(it.skills ?? []).map((s: any) => s.name ?? s)}
            logo={it.company?.logo}
          />
        ))}
      </div>
    </section>
  );
}

export default function OffersListDemo() {
  const navigate = useNavigate();
  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ofertas recientes</h1>
        <Button color="default" onPress={() => navigate('/ofertas')}>Ver todas</Button>
      </div>
      <FeaturedOffers />
      <OffersList />
    </section>
  );
}
