import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Oferta";
import { useEffect, useRef, useState } from "react";
import { useSettersForObject } from "~/util/createPropertySetter";
import { Modal } from "../../components/Modal";
import { api } from "~/api/api";
import { type CompanyListResponse, type OfferDetailsDTO, type OfferDetailsResponse, type AdminOfferDetailsResponse, type Paginated, type SkillDTO, type SkillListResponse, type PublicSkillDTO } from "~/api/types";
import { toDatetimeLocal } from "~/util/helpers";
import { Autocomplete, AutocompleteItem, DateInput, DatePicker, Input, NumberInput, Select, SelectItem, Textarea, Form } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
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
    all.push(...(response.data ?? []));
    if (!response.pagination?.hasNext) break;
    next = response.pagination?.next as number;
  }
  return all;
}

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
  const companies = await getAll<CompanyListResponse>("/companies");

  if (params.ofertaId === "nuevo") {
    const empty: AdminOfferDetailsResponse["data"] = {
      id: 0,
      position: "",
      description: "",
      status: "DRAFT",
      vacancies: 1,
      requirements: "",
      location: null,
      salary: null,
      durationWeeks: null,
      startDate: null,
      expiresAt: null,
      publishedAt: null,
      company: { id: 0, name: "", description: "", logo: "", website: "", email: "", phone: "" },
      skills: [],
      courses: [],
      requiredDocuments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { data: empty, companies };
  }

  const resp = await api
    .headers({
      Cookie: request.headers.get("Cookie") ?? "",
    })
    .get(`/offers/${params.ofertaId}`)
    .json<AdminOfferDetailsResponse>();

  return { data: resp.data, companies };
}

export function usePokemonList({fetchDelay = 0} = {}) {
  const [items, setItems] = useState([] as PublicSkillDTO[]);
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

      let res = await api.get(`/skills?after=${currentOffset}&limit=${limit}`).json<SkillListResponse>()
      
      setHasMore(res?.pagination?.hasNext ?? false);
      // Append new results to existing ones
      const items = res?.data ?? [];
      setItems((prevItems) => [...prevItems, ...items]);
    } catch (error) {
      if ((error as any)?.name === "AbortError") {
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
  status: OfferDetailsDTO["status"];
  setStatus: (status: OfferDetailsDTO["status"]) => void;
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
  const { data, companies } = useLoaderData<typeof clientLoader>();
  const [offer, setOffer] = useState<AdminOfferDetailsResponse["data"]>(data);
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
    setLocation,
    setSalary,
    setSkills,
    setDurationWeeks,
    setStartDate,
  } = useSettersForObject(setOffer);

  const setCompanyId = (id: number) => {
    const comp = companies?.find((c: any) => c.id === id) ?? null;
    setOffer((prev) => ({ ...prev, company: comp } as any));
  };

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = (o: typeof offer) => {
    const e: Record<string, string> = {};
    if (!o.company?.id || o.company.id === 0) e.companyId = "Seleccione una empresa";
    if (!o.position || o.position.trim() === "") e.position = "El puesto es requerido";
    if (!o.description || o.description.trim() === "") e.description = "La descripción es requerida";
    if (!o.vacancies || Number(o.vacancies) < 1) e.vacancies = "Ingrese al menos 1 vacante";
    return e;
  };

  const isExisting = offer.id !== 0;

  const [isOpen, setIsOpen] = useState(false);
  const skillList = usePokemonList({fetchDelay: 500});

  const [, scrollerRef] = useInfiniteScroll({
    hasMore: skillList.hasMore,
    isEnabled: isOpen,
    shouldUseLoader: false, // We don't want to show the loader at the bottom of the list
    onLoadMore: skillList.onLoadMore,
  });

  const save = (status: OfferDetailsDTO["status"] = data.status) => {
    const e = validate(offer);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toastHelper.warn({ title: "Corrige los errores del formulario" });
      return;
    }

    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        try {
          const opPromise = api.post({ ...offer, status }, "/admin/offers");

          toastHelper.info({
            title: "Guardando oferta",
            description: "Guardando la oferta en el servidor...",
            promise: opPromise,
          });

          await opPromise;

          toastHelper.success({ title: "Oferta guardada", description: "La oferta se guardó correctamente." });
          setModal({ ...modal, isOpen: false });
          navigate("/admin/ofertas");
        } catch (err) {
          console.error(err);
          const apiErrors = (err as any)?.errors ?? (err as any)?.response?.data?.errors;
          if (Array.isArray(apiErrors)) {
            const map: Record<string, string> = {};
            apiErrors.forEach((it: any) => (map[it.field] = it.message));
            setErrors(map);
          }
          toastHelper.error({ title: "Error al guardar", description: "No se pudo guardar la oferta." });
        }
      },
    });
  };

  const del = () => {
    setModal({
      isOpen: true,
      message: "¿Está seguro de que desea eliminar esta oferta?",
      action: () => {
        console.log("Offer deleted", offer.id);
        // show a toast and navigate back
        toastHelper.success({ title: "Oferta eliminada" });
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
            <Form onSubmit={(e) => { e.preventDefault(); save(); }} validationErrors={errors as any}>
            <h1 className="text-2xl font-bold">Detalles de la Oferta</h1>

            <Autocomplete
              isVirtualized
              isRequired
              label="Empresa"
              labelPlacement="outside"
              placeholder="Seleccionar empresa"
              defaultItems={companies || []}
              selectedKey={offer.company?.id}
              onSelectionChange={(v) => {
                setCompanyId(v as number);
                setErrors((prev) => ({ ...prev, companyId: undefined }));
              }}
              isInvalid={!!errors.companyId}
              errorMessage={({ validationDetails }) => {
                if (validationDetails?.valueMissing) return "Seleccione una empresa";
                return errors.companyId ?? null;
              }}
            >
              {(item) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
            </Autocomplete>

            <Input
              isRequired
              label="Puesto"
              labelPlacement="outside"
              placeholder="Ingrese el puesto"
              value={offer.position}
              onValueChange={(v) => {
                setPosition(v);
                setErrors((prev) => ({ ...prev, position: undefined }));
              }}
              isInvalid={!!errors.position}
              errorMessage={({ validationDetails }) => {
                if (validationDetails?.valueMissing) return "El puesto es requerido";
                return errors.position ?? null;
              }}
            />

            <Textarea
              isRequired
              label="Descripción"
              labelPlacement="outside"
              placeholder="Describir en qué consiste el puesto y las tareas a realizar"
              value={offer.description ?? ""}
              onValueChange={(v) => {
                setDescription(v);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              isInvalid={!!errors.description}
              errorMessage={({ validationDetails }) => {
                if (validationDetails?.valueMissing) return "La descripción es requerida";
                return errors.description ?? null;
              }}
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
              onValueChange={(v) => {
                setVacancies(v as any);
                setErrors((prev) => ({ ...prev, vacancies: undefined }));
              }}
              isInvalid={!!errors.vacancies}
              errorMessage={() => errors.vacancies ?? null}
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

            </Form>
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
