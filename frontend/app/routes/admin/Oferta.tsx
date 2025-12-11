import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Oferta";
import { act, useEffect, useRef, useState } from "react";
import { useSettersForObject } from "~/util/createPropertySetter";
import { Modal } from "../../components/Modal";
import { api, defaultApi } from "~/api/api";
import { type CompaniesListResponse, type OfferDTO, type Paginated, type SkillDTO, type SkillsListResponse } from "~/api/types";
import { toDatetimeLocal } from "./Carrera";
import { Autocomplete, AutocompleteItem, DateInput, DatePicker, Input, NumberInput, Select, SelectItem, Textarea } from "@heroui/react";
import { Button } from "@heroui/button";
import { parseDateTime } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import {useInfiniteScroll} from "@heroui/use-infinite-scroll";

type DataType<T> = T extends Paginated<infer U> ? U : never;

async function getAll<T extends Paginated<any>>(
  endpoint: string,
  headers?: Record<string, string>
): Promise<DataType<T>[]> {
  let next = 0;
  const all = [];
  while (true) {
    const response = await api
      .headers(headers ?? {})
      .get(`${endpoint}?limit=100&after=${next}`)
      .json<T>();
    console.log(response);
    all.push(...response.data);
    if (!response.pagination.hasNext) break;
    next = response.pagination.next as number;
  }
  return all;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const companies = await getAll<CompaniesListResponse>("/companies", {
    Cookie: request.headers.get("Cookie") ?? "",
  });

  if (params.ofertaId === "nuevo") {
    return {
      data: {
        id: 0,
        companyId: 0,
        position: "",
        description: "",
        status: "DRAFT",
        location: "",
        vacancies: 1,

        skills: [],

        requirements: ""
      } as OfferDTO,
      companies,
    };
  }

  const offer = await api
    .headers({
      Cookie: request.headers.get("Cookie") ?? "",
    })
    .get(`/offers/${params.ofertaId}`)
    .json<OfferDTO>();

  return { data: offer, companies };
}

export function usePokemonList({fetchDelay = 0} = {}) {
  const [items, setItems] = useState([] as SkillDTO[]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10; // Number of items per page, adjust as necessary

  const loadPokemon = async (currentOffset: number) => {
    const controller = new AbortController();
    const {signal} = controller;

    try {
      setIsLoading(true);

      if (offset > 0) {
        // Delay to simulate network latency
        await new Promise((resolve) => setTimeout(resolve, fetchDelay));
      }

      let res = await api.get(`/skills?after=${currentOffset}&limit=${limit}`).json<SkillsListResponse>()
      
      setHasMore(res.pagination.hasNext);
      // Append new results to existing ones
      setItems((prevItems) => [...prevItems, ...res.data]);
    } catch (error) {
      if (error.name === "AbortError") {
        // eslint-disable-next-line no-console
        console.log("Fetch aborted");
      } else {
        // eslint-disable-next-line no-console
        console.error("There was an error with the fetch operation:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPokemon(offset);
  }, []);

  const onLoadMore = () => {
    const newOffset = offset + limit;

    setOffset(newOffset);
    loadPokemon(newOffset);
  };

  return {
    items,
    hasMore,
    isLoading,
    onLoadMore,
  };
}

function TransitionButtons({
  status,
  setStatus,
}: {
  status: OfferDTO["status"];
  setStatus: (status: OfferDTO["status"]) => void;
}) {
  switch (status) {
    case "DRAFT":
      return (
        <Button
          color="secondary"
          onPress={() => setStatus("ACTIVE")}
        >
          Publicar Oferta
        </Button>
      );
    case "ACTIVE":
      return (
        <>
          <Button
            color="secondary"
            onPress={() => setStatus("DRAFT")}
          >
            Poner Borrador
          </Button>
          <Button
            color="danger"
            onPress={() => setStatus("CLOSED")}
          >
            Cerrar Oferta
          </Button>
        </>
      );
    case "CLOSED":
      return (
        <>
          <Button
            color="primary"
            onPress={() => setStatus("ACTIVE")}
          >
            Reabrir Oferta
          </Button>
          <Button
            color="secondary"
            onPress={() => setStatus("DRAFT")}
          >
            Poner Borrador
          </Button>
        </>
      );
  }
}

export default function Oferta({ loaderData }: Route.ComponentProps) {
  const { data, companies } = useLoaderData<typeof loader>();
  const [offer, setOffer] = useState(data);
  const navigate = useNavigate();

  const metadata = {
    createdAt: new Date(data.createdAt ?? "").toLocaleString(),
    updatedAt: new Date(data.updatedAt ?? "").toLocaleString(),
  };

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    action: () => {},
  });

  const {
    setPosition,
    setDescription,
    setRequirements,
    setVacancies,
    setExpiresAt,
    setStatus,
    setCompanyId,
    setLocation,
    setSalary,
    setSkills,
    setDurationWeeks,
    setStartDate,
  } = useSettersForObject(setOffer);

  const isExisting = offer.id !== 0;

  const [isOpen, setIsOpen] = useState(false);
  const skillList = usePokemonList({fetchDelay: 500});

  const [, scrollerRef] = useInfiniteScroll({
    hasMore: skillList.hasMore,
    isEnabled: isOpen,
    shouldUseLoader: false, // We don't want to show the loader at the bottom of the list
    onLoadMore: skillList.onLoadMore,
  });

  const save = (status: OfferDTO["status"] = data.status) => {
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        setModal({ ...modal, isOpen: false });
        await api.post({ ...offer, status }, "/admin/offers");
        navigate("/admin/ofertas");
      },
    });
  };

  const del = () => {
    setModal({
      isOpen: true,
      message: "¿Está seguro de que desea eliminar esta oferta?",
      action: () => {
        console.log("Offer deleted", offer.id);
        setModal({ ...modal, isOpen: false });
        navigate("/admin/ofertas");
      },
    });
  };

  const goBack = () => navigate("/admin/ofertas");

  const buttons = isExisting ? (
    <>
      <Button
        color="primary"
        onPress={() => save()}
      >
        Guardar Cambios
      </Button>
      <Button color="danger" onPress={del}>
        Eliminar Oferta
      </Button>
      <TransitionButtons status={offer.status} setStatus={setStatus} />
    </>
  ) : (
    <>
      <Button
        color="secondary"
        onPress={() => {
          save("ACTIVE");
        }}
      >
        Crear Oferta
      </Button>
      <Button
        color="default"
        onPress={() => {
          save("DRAFT");
        }}
      >
        Crear Borrador
      </Button>
    </>
  );  

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        onConfirm={modal.action}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="flex flex-wrap justify-between">
        <div className="grow-7 basis-md">
          <div className="flex flex-col mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Detalles de la Oferta</h1>

            <Autocomplete
              isVirtualized
              isRequired
              label="Empresa"
              labelPlacement="outside"
              placeholder="Seleccionar empresa"
              defaultItems={companies || []}
              selectedKey={offer.companyId}
              onSelectionChange={(v) => setCompanyId(v as number)}
            >
              {(item) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
            </Autocomplete>

            <Input
              isRequired
              label="Puesto"
              labelPlacement="outside"
              placeholder="Ingrese el puesto"
              value={offer.position}
              onValueChange={setPosition}
            />

            <Textarea
              isRequired
              label="Descripción"
              labelPlacement="outside"
              placeholder="Describir en qué consiste el puesto y las tareas a realizar"
              value={offer.description ?? ""}
              onValueChange={setDescription}
            />

            <Textarea
              label="Requisitos"
              labelPlacement="outside"
              placeholder="Describir los requisitos necesarios para postular a la oferta"
              value={offer.requirements ?? ""}
              onValueChange={setRequirements}
            />

            <NumberInput
              isRequired
              label="Vacantes"
              labelPlacement="outside"
              value={offer.vacancies ?? ""}
              onValueChange={setVacancies}
              min={1}
            />

            <DatePicker
              label="Fecha de Expiración"
              labelPlacement="outside"
              granularity="minute"
              hourCycle={24}
              value={offer.expiresAt ? parseDateTime(offer.expiresAt) : undefined}
              onChange={(v) => setExpiresAt(v?.toString())}
            />

            <Input
              label="Ubicación"
              labelPlacement="outside"
              placeholder="Ingrese la ubicación del trabajo"
              value={offer.location ?? ""}
              onValueChange={setLocation}
            />

            <NumberInput
              label="Remuneración"
              labelPlacement="outside"
              placeholder="Ingrese la remuneración ofrecida"
              value={offer.salary ?? undefined}
              minValue={0}
              onValueChange={setSalary}
            />

            <NumberInput
              label="Duración (semanas)"
              labelPlacement="outside"
              placeholder="Ingrese la duración estimada del puesto en semanas"
              minValue={1}
              value={offer.durationWeeks ?? undefined}
              onValueChange={setDurationWeeks}
            />
            
            <DatePicker
              label="Fecha de Inicio"
              labelPlacement="outside"
              granularity="day"
              value={offer.startDate ? parseDateTime(offer.startDate) : undefined}
              onChange={(v) => setStartDate(v?.toString())}
            />

            <Select
              // isVirtualized
              label="Habilidades Requeridas"
              labelPlacement="outside"
              placeholder="Seleccionar habilidades"
              scrollRef={scrollerRef}
              selectionMode="multiple"
              items={skillList.items}
            >
              {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
            </Select>

          </div>
        </div>
        <div className="grow-3 basis-sm">
          <div className="flex flex-col lg:max-w-sm mx-auto p-4 space-y-4">
            {isExisting && (
              <div>
                <h2 className="text-xl font-bold">Información Adicional</h2>
                <p>
                  <span className="font-medium">Estado</span> {offer.status}
                </p>
                <p>
                  <span className="font-medium">Fecha de Creación:</span>{" "}
                  {metadata.createdAt}
                </p>
                <p>
                  <span className="font-medium">Última Actualización:</span>{" "}
                  {metadata.updatedAt}
                </p>
              </div>
            )}
            <h2 className="text-xl font-bold">Acciones</h2>
            <div className="flex flex-row flex-wrap gap-4">
              {buttons}
              <Button
                color="default"
                onPress={goBack}
              >
                Volver a la Lista de Ofertas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
