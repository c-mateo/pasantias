import React from "react";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Chip } from "@heroui/react";

export type CareerInput = { name: string; shortName?: string } | string;

export type OfferCardProps = {
  id?: number | string;
  position: string;
  company: string;
  location?: string;
  vacancies?: number;
  expiresAt?: string;
  description?: string;
  careers?: CareerInput[];
  skills?: string[];
  logo?: string;
};

export default function OfferCard({ id, position, company, location, vacancies, expiresAt, description, careers = [], skills = [], logo }: OfferCardProps) {
  const getShortName = (career: CareerInput) => {
    if (!career) return undefined;
    if (typeof career === "string") return undefined;
    return "#" + career.shortName || undefined;
  };
  const getFullName = (career: CareerInput) => (typeof career === "string" ? career : career.name);
  return (
    <Card className="max-w-[400px] transition-shadow duration-150">
      <CardHeader className="flex items-center justify-between p-4 gap-2">
        <div className="flex flex-col">
          <h3 className="truncate text-lg font-medium">{position}</h3>
          <p className="text-sm">{company}</p>
          {/* careers removed from header; rendered as chips below */}
        </div>
        {logo ? (
          <Image alt={`${company} logo`} height={40} width={40} src={logo} radius="sm" />
        ) : null}
      </CardHeader>
      <Divider />
      <CardBody className="px-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {location && <span className="inline-block">{location}</span>}
            {typeof vacancies === "number" && (<span className="inline-block">• {vacancies} vacante{vacancies !== 1 ? "s" : ""}</span>)}
          </div>
          {description && <p className="text-sm mt-3 line-clamp-3">{description}</p>}
        </div>
        {/* show career acronyms if any exist; otherwise show skills */}
        {careers.length > 0 && careers.some((c: CareerInput) => !!getShortName(c)) ? (
          <div className="mt-3 flex flex-wrap gap-2 self-start">
            {careers.map((c: CareerInput, i: number) => {
              const short = getShortName(c);
              const label = short ?? getFullName(c);
              const title = getFullName(c);
              return (
                <Chip key={i} size="sm" className="!px-2" title={title} aria-label={title}>{short ?? label}</Chip>
              );
            })}
          </div>
        ) : skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 self-start">
            {skills.map((s: string, i: number) => (
              <Chip key={i} size="sm">{s}</Chip>
            ))}
          </div>
        ) : null}
        {/* skills removed; only careers are shown */}
      </CardBody>
      <Divider />
      <CardFooter className="px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">{expiresAt ? `Cierra: ${expiresAt}` : "Abierta"}</div>
        <div className="flex items-center gap-2">
          <Link href={id ? `/ofertas/${id}` : "#"} className="no-underline"><Button color="primary" size="sm">Ver</Button></Link>
          <Button color="default" size="sm">Aplicar</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
