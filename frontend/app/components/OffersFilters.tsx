import React from "react";
import { Input, Autocomplete, AutocompleteItem } from "@heroui/react";
import { Button } from "@heroui/button";

type Company = { id: number; name: string };
type Course = { id: number; name: string };

export default function OffersFilters({
  q,
  setQ,
  sort,
  setSort,
  companies,
  courses,
  selectedCompany,
  setSelectedCompany,
  selectedCourses,
  setSelectedCourses,
  remoteOnly,
  setRemoteOnly,
  onSearch,
  className,
}: {
  q: string;
  setQ: (s: string) => void;
  sort: string;
  setSort: (s: string) => void;
  companies: Company[];
  courses: Course[];
  selectedCompany: number | null;
  setSelectedCompany: (id: number | null) => void;
  selectedCourses: number[];
  setSelectedCourses: (ids: number[]) => void;
  remoteOnly: boolean;
  setRemoteOnly: (v: boolean) => void;
  onSearch: () => void;
  className?: string;
}) {
  const [companyFilter, setCompanyFilter] = React.useState("");
  const [companyOpen, setCompanyOpen] = React.useState(false);
  const [courseFilter, setCourseFilter] = React.useState("");
  const [courseOpen, setCourseOpen] = React.useState(false);

  const filteredCompanies = companies.filter((c) => c.name.toLowerCase().includes(companyFilter.toLowerCase()));
  const filteredCourses = courses.filter((c) => c.name.toLowerCase().includes(courseFilter.toLowerCase()));

  const addCourse = (c: Course) => {
    if (!selectedCourses.includes(c.id)) setSelectedCourses([...selectedCourses, c.id]);
    setCourseOpen(false);
    setCourseFilter("");
  };

  const removeCourse = (id: number) => setSelectedCourses(selectedCourses.filter((x) => x !== id));

  const clearFilters = () => {
    setQ("");
    setSelectedCompany(null);
    setSelectedCourses([]);
    setRemoteOnly(false);
    setCompanyFilter("");
    setCourseFilter("");
  };

  return (
    <div className={className}>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
        <Input placeholder="Buscar por puesto, empresa o palabra clave" value={q} onValueChange={setQ} className="flex-1" />

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-56 mt-3 md:mt-0 rounded border px-2 py-1">
          <option value="-publishedAt">Más recientes</option>
          <option value="publishedAt">Menos recientes</option>
          <option value="position">Puesto A→Z</option>
          <option value="-position">Puesto Z→A</option>
          <option value="expiresAt">Cierre (próximo)</option>
          <option value="-expiresAt">Cierre (más lejos)</option>
        </select>

        <div className="w-48 mt-3 md:mt-0">
          <Input placeholder="Buscar empresa" value={companyFilter} onValueChange={setCompanyFilter} />
          <Autocomplete
            defaultItems={filteredCompanies}
            isLoading={false}
            label="Empresa"
            placeholder="Seleccionar empresa"
            variant="bordered"
            onOpenChange={setCompanyOpen}
            scrollRef={undefined}
          >
            {(c: Company) => (
              <AutocompleteItem key={c.id} onClick={() => { setSelectedCompany(c.id); setCompanyFilter(c.name); setCompanyOpen(false);} }>{c.name}</AutocompleteItem>
            )}
          </Autocomplete>
        </div>

        <div className="w-56 mt-3 md:mt-0">
          <Input placeholder="Buscar carreras" value={courseFilter} onValueChange={setCourseFilter} />
          <Autocomplete
            defaultItems={filteredCourses}
            isLoading={false}
            label="Carreras"
            placeholder="Agregar carrera"
            variant="bordered"
            onOpenChange={setCourseOpen}
            scrollRef={undefined}
          >
            {(c: Course) => (
              <AutocompleteItem key={c.id} onClick={() => addCourse(c)}>{c.name}</AutocompleteItem>
            )}
          </Autocomplete>

          <div className="mt-2 flex flex-wrap gap-2">
            {selectedCourses.map((id) => {
              const cc = courses.find((x) => x.id === id);
              if (!cc) return null;
              return (
                <div key={id} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2 text-sm">
                  <span>{cc.name}</span>
                  <button className="text-xs text-red-600" onClick={() => removeCourse(id)}>✖</button>
                </div>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 mt-3 md:mt-0">
          <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
          <span className="text-sm">Solo remotas</span>
        </label>

        <div className="ml-auto mt-3 md:mt-0 flex items-center gap-2">
          <Button color="default" onPress={clearFilters} radius="md">Limpiar</Button>
          <Button color="primary" onPress={onSearch} radius="md">Buscar</Button>
        </div>
      </div>
    </div>
  );
}
