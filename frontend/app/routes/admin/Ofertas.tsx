import { api } from "api/api";
import React, { useState, useEffect } from "react";
// import { Autocomplete, Chip, TextField } from "@mui/material";

const offers = [
  { id: 1, position: "Desarrollador Frontend", company: "TechCorp", vacancies: 3, applicationDeadline: "2025-08-15", description: "Desarrollar interfaces de usuario modernas." },
  { id: 2, position: "Analista de Datos", company: "DataSolutions", vacancies: 1, applicationDeadline: "2025-08-20", description: "Analizar grandes volúmenes de datos para obtener insights." },
];

type Course = {
  id: number;
  name: string;
  visible?: boolean;
};

export default function Ofertas() {
  const [sortConfig, setSortConfig] = useState<{ key: keyof typeof offers[0] | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });
  const [selectedOffers, setSelectedOffers] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    companyId: "",
    vacancies: 0,
    applicationDeadline: "",
    description: "",
    requirements: "",
    duration: "",
    salary: "",
    tasks: "",
    courses: [] as string[],
    skills: [],
    requiredDocuments: [],
  });
  const [companies, setCompanies] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update filteredCourses logic
  const filteredCourses = courses.filter((course) => course.visible !== false);

  const sortedOffers = [...offers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const order = sortConfig.direction === "asc" ? 1 : -1;
    if (sortConfig.key === "applicationDeadline") {
      return (new Date(a[sortConfig.key]!) as any) - (new Date(b[sortConfig.key]!) as any) * order;
    }
    return a[sortConfig.key]!.toString().localeCompare(b[sortConfig.key]!.toString()) * order;
  });

  const handleSort = (key: keyof typeof offers[0]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: number) => {
    setSelectedOffers((prev) =>
      prev.includes(id) ? prev.filter((offerId) => offerId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(offers.map((offer) => offer.id));
    }
  };

  const handleDeleteSelected = () => {
    console.log("Deleting offers with IDs:", selectedOffers);
    // Add deletion logic here
    setSelectedOffers([]);
  };

  const handleDeleteRow = (id: number) => {
    console.log("Deleting offer with ID:", id);
    // Add deletion logic here
  };

  const handleRowClick = (offer: typeof offers[0]) => {
    console.log("Row clicked", offer);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (isEditing) {
      console.log("Actualizando oferta:", formData);
      // Lógica para actualizar la oferta
    } else {
      console.log("Creando nueva oferta:", formData);
      // Lógica para crear una nueva oferta
    }
    setIsModalOpen(false);
    setFormData({ position: "", companyId: "", vacancies: 0, applicationDeadline: "", description: "", requirements: "", duration: "", salary: "", tasks: "", courses: [], skills: [], requiredDocuments: [] });
  };

  const openModal = (offer: typeof offers[0] | null) => {
    if (offer) {
      setIsEditing(true);
      setFormData({
        position: offer.position,
        companyId: "", // Ajustar según los datos disponibles
        vacancies: offer.vacancies,
        applicationDeadline: offer.applicationDeadline,
        description: offer.description,
        requirements: "", // Ajustar según los datos disponibles
        duration: "", // Ajustar según los datos disponibles
        salary: "", // Ajustar según los datos disponibles
        tasks: "", // Ajustar según los datos disponibles
        courses: [], // Ajustar según los datos disponibles
        skills: [], // Ajustar según los datos disponibles
        requiredDocuments: [], // Ajustar según los datos disponibles
      });
    } else {
      setIsEditing(false);
      setFormData({
        position: "",
        companyId: "",
        vacancies: 1,
        applicationDeadline: "",
        description: "",
        requirements: "",
        duration: "",
        salary: "",
        tasks: "",
        courses: [],
        skills: [],
        requiredDocuments: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    // Fetch related data for dropdowns
    api.companies.list().then(r => setCompanies(r.data));
    api.courses.list().then(r => setCourses(r.data));
    // api.skills.list().then(r => setSkills(r.data));
    // api.requiredDocuments.list().then(r => setDocuments(r.data));
  }, []);

  const handleCourseSelection = (selectedCourse: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: [...prev.courses, selectedCourse],
    }));

    setCourses((prevCourses) =>
      prevCourses.map((course) => ({
        ...course,
        visible: course.name !== selectedCourse && !formData.courses.includes(course.name),
      }))
    );
  };

  return (
    <div className="flex">
      <div className="px-4 py-3 max-w-4xl mx-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Administrar Ofertas</h2>
          <div className="flex gap-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
              onClick={() => openModal(null)}
            >
              Crear Oferta
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              onClick={handleDeleteSelected}
              disabled={selectedOffers.length === 0}
            >
              Eliminar Seleccionados
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-12 px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    className="align-middle"
                    checked={selectedOffers.length === offers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => handleSort("position")}
                >
                  Puesto
                  <span className="ml-1 text-gray-500">
                    {sortConfig.key === "position" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => handleSort("company")}
                >
                  Empresa
                  <span className="ml-1 text-gray-500">
                    {sortConfig.key === "company" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => handleSort("vacancies")}
                >
                  Vacantes
                  <span className="ml-1 text-gray-500">
                    {sortConfig.key === "vacancies" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => handleSort("applicationDeadline")}
                >
                  Fecha Límite
                  <span className="ml-1 text-gray-500">
                    {sortConfig.key === "applicationDeadline" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedOffers.map((offer) => (
                <tr key={offer.id} className="border-t border-gray-300">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedOffers.includes(offer.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelect(offer.id);
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{offer.position}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{offer.company}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{offer.vacancies}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{offer.applicationDeadline}</td>
                  <td className="px-4 py-2 text-sm font-bold text-gray-500">
                    <button
                      className="text-blue-500 hover:underline mr-2 cursor-pointer"
                      onClick={() => openModal(offer)}
                    >
                      Ver Detalles
                    </button>
                    <button
                      className="text-red-500 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRow(offer.id);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
          style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white w-11/12 max-w-2xl p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              onClick={closeModal}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">{isEditing ? "Editar Oferta" : "Crear Oferta"}</h3>
            <div className="max-h-[70vh] overflow-y-auto">
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Puesto</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Requisitos</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Duración</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Salario</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Vacantes</label>
                  <input
                    type="number"
                    name="vacancies"
                    value={formData.vacancies}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tareas</label>
                  <textarea
                    name="tasks"
                    value={formData.tasks}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Fecha Límite</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Compañía</label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Seleccione una compañía</option>
                    {companies.map((company: { id: number; name: string }) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Cursos</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.courses.map((selectedCourse) => (
                      <div
                        key={selectedCourse}
                        className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm"
                      >
                        <span>{selectedCourse}</span>
                        <button
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              courses: prev.courses.filter((course) => course !== selectedCourse),
                            }));
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      placeholder="Escribe para buscar cursos"
                      className="block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      onChange={(e) => {
                        const searchText = e.target.value.toLowerCase();
                        setCourses((prevCourses) =>
                          prevCourses.map((course) => ({
                            ...course,
                            visible: !formData.courses.includes(course.name) && course.name.toLowerCase().includes(searchText),
                          }))
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          setActiveIndex((prev) => Math.min(prev + 1, filteredCourses.length - 1));
                        } else if (e.key === "ArrowUp") {
                          setActiveIndex((prev) => Math.max(prev - 1, 0));
                        } else if (e.key === "Enter" && filteredCourses[activeIndex]) {
                          handleCourseSelection(filteredCourses[activeIndex].name);
                        }
                      }}
                    />
                    <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
                      {filteredCourses.map((course, index) => (
                        <div
                          key={course.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                            index === activeIndex ? "bg-gray-200" : ""
                          }`}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => handleCourseSelection(course.name)}
                        >
                          {course.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Habilidades</label>
                  <select
                    name="skills"
                    multiple
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    {skills.map((skill: { id: number; name: string }) => (
                      <option key={skill.id} value={skill.name}>{skill.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Documentos Requeridos</label>
                  <select
                    name="requiredDocuments"
                    multiple
                    value={formData.requiredDocuments}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-400 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    {documents.map((doc: { id: number; description: string }) => (
                      <option key={doc.id} value={doc.id}>{doc.description}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSave}
              >
                {isEditing ? "Aplicar Cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
