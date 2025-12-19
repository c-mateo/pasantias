import React from "react";
import OffersList from "./OffersList";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";

export default function OffersListDemo() {
  const navigate = useNavigate();
  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ofertas recientes</h1>
        <Button color="default" onPress={() => navigate('/ofertas')}>Ver todas</Button>
      </div>
      <OffersList />
    </section>
  );
}
