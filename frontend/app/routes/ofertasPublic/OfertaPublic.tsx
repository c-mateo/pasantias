import { useLoaderData, Link as RouterLink, useNavigate } from "react-router";
import { api } from "~/api/api";
import { demoOffers } from "~/components/OffersListDemo";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Chip } from "@heroui/react";
import type { OfferDTO } from "~/api/types";
import type { Route } from "./+types/OfertaPublic";

export async function clientLoader({ params }: any) {
  const id = params.ofertaId;
  const demo = demoOffers.find((o) => String(o.id) === String(id));
  if (demo) {
    return { offer: demo };
  }
  // fallback to API
  const offer = await api.get(`/offers/${params.ofertaId}`).json<OfferDTO>();
  return { offer };
}

export function meta({ data }: any) {
  if (!data) return [{ title: "Oferta" }];
  return [{ title: `${data.offer.position} - ${data.offer.company?.name ?? "Oferta"}` }];
}

export default function OfertaPublic({ loaderData }: Route.ComponentProps) {
  const { offer } = loaderData as any;
  const o = offer as any;
  const navigate = useNavigate();
  const careers = o.careers as any[] | undefined;
  const skills = o.skills as any[] | undefined;
  const companyName = typeof o.company === 'string' ? o.company : (o.company?.name ?? '');
  const companyLogo = typeof o.company === 'object' ? (o.company?.logo ?? undefined) : undefined;
  const companyWebsite = typeof o.company === 'object' ? (o.company?.website ?? undefined) : undefined;
  const companyDescription = typeof o.company === 'object' ? (o.company?.description ?? undefined) : undefined;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-4">

          <div className="mb-4">
            <RouterLink to="/ofertas" className="text-sm text-blue-600">← Volver a Ofertas</RouterLink>
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <article className="bg-white rounded shadow">
              <header className="flex items-center justify-between gap-4 p-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{o.position}</h1>
              <div className="flex items-center gap-3 mt-2">
                {companyLogo && <Image src={companyLogo} alt={companyName} width={40} height={40} radius="sm" />}
                <div className="text-sm text-default-500">{companyName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700">{o.location ?? "-"}</div>
              <div className="text-sm text-gray-500">{o.vacancies ?? 1} vacante{(o.vacancies ?? 1) !== 1 ? 's' : ''}</div>
              {o.createdAt && <div className="text-xs text-gray-400">Publicado: {new Date(o.createdAt).toLocaleDateString()}</div>}
            </div>
              </header>
              <Divider />
              <div className="p-4 flex flex-col gap-3">
            <div className="text-sm text-gray-700 leading-relaxed">{o.description}</div>
            {o.requirements && (
              <div>
                <h3 className="text-sm font-semibold">Requisitos</h3>
                <p className="text-sm text-gray-700 mt-1">{o.requirements}</p>
              </div>
            )}
            {careers && careers.length > 0 ? (
              <div>
                <div className="text-sm font-semibold">Carreras</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {careers.map((c: any, i: number) => (
                    <Chip key={c?.id ?? c?.shortName ?? i} size="sm" title={c?.name ?? String(c)}>{c?.shortName ?? c?.name ?? String(c)}</Chip>
                  ))}
                </div>
              </div>
            ) : (skills && skills.length > 0) ? (
              <div>
                <div className="text-sm font-semibold">Skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((s: any) => (
                    <Chip key={s?.id ?? s?.name ?? s} size="sm">{s?.name ?? s}</Chip>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex items-center gap-3">
              <Button color="primary" onPress={() => navigate('/login')}>Aplicar</Button>
              <Button color="default">Guardar</Button>
            </div>
            </div>
              <Divider />
              <footer className="flex items-center justify-between p-4">
                <div className="text-sm text-gray-500">{o.status ?? '—'}</div>
                <div className="text-sm text-gray-500">{o.expiresAt ? `Cierra: ${new Date(o.expiresAt).toLocaleDateString()}` : "Abierta"}</div>
              </footer>
            </article>
          </div>
          <aside className="lg:col-span-1">
            <Card>
              <CardBody className="p-4">
                {companyName && (
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex items-center gap-3">
                      {companyLogo && <Image src={companyLogo} alt={companyName} width={48} height={48} radius="sm" />}
                      <div>
                        <div className="text-lg font-semibold">{companyName}</div>
                        {companyWebsite && (<a href={companyWebsite} className="text-sm text-blue-600">{companyWebsite}</a>)}
                      </div>
                    </div>
                    <div className="text-sm text-default-500">{companyDescription}</div>
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-sm font-semibold">Detalles</div>
                  <div className="text-sm text-gray-700 mt-2">{o.location ?? '—'}</div>
                  <div className="text-sm text-gray-700 mt-1">{o.vacancies ?? 1} vacante{(o.vacancies ?? 1) !== 1 ? 's' : ''}</div>
                </div>
                {o.requiredDocuments && o.requiredDocuments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Documentos requeridos</div>
                    <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                      {(o.requiredDocuments as any[]).map((d: any) => (<li key={d.id}>{d.name}</li>))}
                    </ul>
                  </div>
                )}
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
