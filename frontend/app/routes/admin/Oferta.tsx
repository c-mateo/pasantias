import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Oferta";
import { act, useEffect, useRef, useState } from "react";
import type { AdminOffer } from "./Ofertas";
import { useSettersForObject } from "~/util/createPropertySetter";
import { Modal } from "../../components/Modal";

export async function loader({ params, request }: Route.LoaderArgs) {
  if (params.ofertaId === "nuevo") {
    return {
      data: {
        id: 0,
        position: "",
        companyId: 0,
        vacancies: 1,
        applicationDeadline: new Date().toISOString(),
        description: "",
        requirements: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AdminOffer,
    };
  }

  const response = await fetch(
    `http://localhost:5173/api/v1/offers/${params.ofertaId}`,
    {
      credentials: "include",
      headers: {
        Cookie: request.headers.get("Cookie") ?? "",
      },
    }
  );

  if (!response.ok) {
    throw new Response("Offer not found", { status: 404 });
  }

  const body = await response.json();
  return { data: body.data as AdminOffer };
}

export default function Oferta({ loaderData }: Route.ComponentProps) {
  const { data } = useLoaderData<typeof loader>();
  const [offer, setOffer] = useState(data);
  const navigate = useNavigate();

  const metadata = {
    createdAt: new Date(data.createdAt).toLocaleString(),
    updatedAt: new Date(data.updatedAt).toLocaleString(),
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
    setApplicationDeadline,
  } = useSettersForObject(setOffer);

  const isExisting = offer.id !== 0;

  const save = () => {
    // TODO: call API to save or create offer
    console.log("Saving offer:", offer);
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: () => {
        console.log("Saved");
        setModal({ ...modal, isOpen: false });
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

            <label className="font-medium">Empresa</label>
            <select
              className="border p-2 rounded"
              value={offer.companyId}
              onChange={(e) => setOffer({ ...offer, companyId: Number(e.target.value) })}
            >
              <option value={0} disabled selected>Seleccione una empresa</option>
              <option value={1}>Empresa A</option>
              <option value={2}>Empresa B</option>
              <option value={3}>Empresa C</option>
            </select>

            <label className="font-medium">Puesto</label>
            <input
              className="border p-2 rounded"
              value={offer.position}
              onChange={(e) => setPosition(e.target.value)}
            />

            <label className="font-medium">Descripción</label>
            <textarea
              className="border p-2 rounded h-32"
              value={offer.description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="font-medium">Requisitos</label>
            <textarea
              className="border p-2 rounded h-24"
              value={offer.requirements ?? ""}
              onChange={(e) => setRequirements(e.target.value)}
            />

            <label className="font-medium">Vacantes</label>
            <input
              type="number"
              className="border p-2 rounded"
              value={offer.vacancies ?? ""}
              onChange={(e) =>
                setVacancies(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              min={1}
            />

            <label className="font-medium">Fecha Límite</label>
            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={
                offer.applicationDeadline
                  ? new Date(offer.applicationDeadline)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => setApplicationDeadline(e.target.value)}
            />
          </div>
        </div>
        <div className="grow-3 basis-sm">
          <div className="flex flex-col lg:max-w-sm mx-auto p-4 space-y-4">
            {isExisting && (
              <div>
                <h2 className="text-xl font-bold">Información Adicional</h2>
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
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={save}
              >
                {isExisting ? "Guardar Cambios" : "Crear Oferta"}
              </button>
              {isExisting && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={del}
                >
                  Eliminar Oferta
                </button>
              )}
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded"
                onClick={goBack}
              >
                Volver a la Lista de Ofertas
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
