import React from "react";
import OfferCard from "./OfferCard";
import { Button } from "@heroui/button";

export const demoOffers = [
  {
    id: 1,
    position: "Frontend Developer",
    company: "NexSoft",
    location: "Buenos Aires, AR",
    vacancies: 2,
    expiresAt: "2026-01-15",
    description:
      "Buscamos desarrollador React con experiencia en TypeScript y CSS. Trabajarás con un equipo ágil en productos públicos.",
    careers: [
      { name: "Ingeniería en Sistemas", shortName: "IC" },
      { name: "Licenciatura en Informática", shortName: "INF" },
    ],
    logo: "https://avatars.dicebear.com/api/identicon/nexsoft.svg",
  },
  {
    id: 2,
    position: "Data Analyst",
    company: "DataCo",
    location: "Montevideo, UY",
    vacancies: 1,
    expiresAt: "2026-01-05",
    description: "Analista de datos con SQL, modelado estadístico y visualización (Power BI/Looker).",
    careers: [
      { name: "Estadística", shortName: "EST" },
      { name: "Ciencias de Datos", shortName: "CD" },
    ],
    logo: "https://avatars.dicebear.com/api/identicon/dataco.svg",
  },
  {
    id: 3,
    position: "Backend Engineer",
    company: "CloudForge",
    location: "Lima, PE",
    vacancies: 3,
    expiresAt: "2026-01-22",
    description: "Backend (Node.js, Express) y APIs escalables. Buenas prácticas y testing.",
    careers: [{ name: "Ingeniería en Computación", shortName: "IC" }],
    logo: "https://avatars.dicebear.com/api/identicon/cloudforge.svg",
  },
  {
    id: 4,
    position: "UX/UI Designer",
    company: "DesignLab",
    location: "Santiago, CL",
    vacancies: 1,
    expiresAt: "2026-02-01",
    description: "Diseñador para proyectos B2B con experiencia en Figma y diseño de interacción.",
    careers: [
      { name: "Diseño Gráfico", shortName: "DG" },
      { name: "Diseño de Interacción", shortName: "DI" },
    ],
    logo: "https://avatars.dicebear.com/api/identicon/designlab.svg",
  },
  {
    id: 5,
    position: "Fullstack Intern",
    company: "StartupX",
    location: "Remote",
    vacancies: 1,
    expiresAt: "2026-03-01",
    description: "Pasantía para estudiantes con interés en desarrollo fullstack.",
    careers: ["Ingeniería en Computación", "Licenciatura en Sistemas"],
    skills: ["JavaScript", "React", "Node.js"],
    logo: "https://avatars.dicebear.com/api/identicon/startupx.svg",
  },
];

export default function OffersListDemo() {
  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ofertas recientes</h1>
        <Button color="default" onPress={() => (window.location.href = '/ofertas')}>Ver todas</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            id={offer.id}
            position={offer.position}
            company={offer.company}
            location={offer.location}
            vacancies={offer.vacancies}
            expiresAt={offer.expiresAt}
            description={offer.description}
            careers={offer.careers}
            skills={offer.skills}
          />
        ))}
      </div>
    </section>
  );
}
