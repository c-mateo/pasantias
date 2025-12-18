import React, { useEffect, useState, useRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import OffersFilters from "./OffersFilters";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";
import { useAuthState, checkSessionOnce } from "~/util/AuthContext";
import { api } from "~/api/api";
import toast from "~/util/toast";

export default function OffersList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<string>('-publishedAt');
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const auth = useAuthState();
  const debounceRef = useRef<number | null>(null);

  const fetchOffers = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const qs: string[] = [`limit=10`];
      if (q) qs.push(`q=${encodeURIComponent(q)}`);
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      if (selectedCompany) qs.push(`companyId=${selectedCompany}`);
      if (selectedCourses?.length) qs.push(`courses=${selectedCourses.join(',')}`);
      if (remoteOnly) qs.push(`remote=1`);
      if (!reset && page) qs.push(`after=${page}`);
      const url = `/offers?${qs.join('&')}`;
      const res = await api.get(url).json<any>();
      const data = res?.data ?? [];
      setItems((prev) => (reset ? data : [...prev, ...data]));
      setPage(res?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "Error al cargar ofertas" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // fetch filter reference data
      try {
        const comps = await api.get('/companies?limit=200').json<any>();
        setCompanies(comps?.data ?? []);
      } catch (err) {
        // ignore
      }
      try {
        const cs = await api.get('/courses?limit=200').json<any>();
        setCourses(cs?.data ?? []);
      } catch (err) {
        // ignore
      }

      // If user is logged, set default selected careers to user's courses
      await checkSessionOnce();
      const user = (auth.user as any) ?? null;
      if (user?.courses && Array.isArray(user.courses) && user.courses.length) {
        setSelectedCourses(user.courses.map((c: any) => c.id));
      }
    })();

    // Debounce search input
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    // @ts-ignore
    debounceRef.current = window.setTimeout(() => fetchOffers(true), 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sort]);

  useEffect(() => {
    // initial load
    fetchOffers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <OffersFilters
        q={q}
        setQ={setQ}
        sort={sort}
        setSort={setSort}
        companies={companies}
        courses={courses}
        selectedCompany={selectedCompany}
        setSelectedCompany={(id) => setSelectedCompany(id ?? null)}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        remoteOnly={remoteOnly}
        setRemoteOnly={setRemoteOnly}
        onSearch={() => fetchOffers(true)}
        className="w-full"
      />

      <div>
        {items.length === 0 && !loading ? (
          <div className="text-gray-600">No se encontraron ofertas.</div>
        ) : (
          <Table aria-label="Ofertas">
            <TableHeader>
              <TableColumn key="position">
                <button className="flex items-center gap-2" onClick={() => {
                  if (sort === 'position') setSort('-position');
                  else if (sort === '-position') setSort(undefined);
                  else setSort('position');
                  fetchOffers(true);
                }}>
                  Puesto {sort === 'position' ? <span>▲</span> : sort === '-position' ? <span>▼</span> : null}
                </button>
              </TableColumn>
              <TableColumn key="company">
                <button className="flex items-center gap-2" onClick={() => {
                  if (sort === 'company.name') setSort('-company.name');
                  else if (sort === '-company.name') setSort(undefined);
                  else setSort('company.name');
                  fetchOffers(true);
                }}>
                  Empresa {sort === 'company.name' ? <span>▲</span> : sort === '-company.name' ? <span>▼</span> : null}
                </button>
              </TableColumn>
              <TableColumn key="location">Ubicación</TableColumn>
              <TableColumn key="vacancies">Vacantes</TableColumn>
              <TableColumn key="expires">
                <button className="flex items-center gap-2" onClick={() => {
                  if (sort === 'expiresAt') setSort('-expiresAt');
                  else if (sort === '-expiresAt') setSort(undefined);
                  else setSort('expiresAt');
                  fetchOffers(true);
                }}>
                  Cierre {sort === 'expiresAt' ? <span>▲</span> : sort === '-expiresAt' ? <span>▼</span> : null}
                </button>
              </TableColumn>
              <TableColumn key="actions" align="center">Acciones</TableColumn>
            </TableHeader>
            <TableBody items={items}>
              {(it: any) => (
                <TableRow key={it.id}>
                  {(columnKey) => {
                    switch (columnKey) {
                      case "position":
                        return <TableCell>{it.position}</TableCell>;
                      case "company":
                        return <TableCell>{it.company?.name ?? 'N/A'}</TableCell>;
                      case "location":
                        return <TableCell>{it.location || 'N/A'}</TableCell>;
                      case "vacancies":
                        return <TableCell>{it.vacancies ?? 'N/A'}</TableCell>;
                      case "expires":
                        return <TableCell>{it.expiresAt ? new Date(it.expiresAt).toLocaleDateString() : 'N/A'}</TableCell>;
                      case "actions":
                        return <TableCell className="text-center"><Button color="primary" size="sm" onPress={() => navigate(`/ofertas/${it.id}`)}>Ver</Button></TableCell>;
                      default:
                        return <TableCell>{''}</TableCell>;
                    }
                  }}</TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-6 text-center">
        {page ? (
          <Button onPress={() => fetchOffers(false)} disabled={loading}>{loading ? 'Cargando...' : 'Cargar más'}</Button>
        ) : null}
      </div>
    </div>
  );
}
