import React, { useEffect, useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Button } from "@heroui/button";
import { useAuthState } from "~/util/AuthContext";
import { api } from "~/api/api";
import toast from "~/util/toast";
import OfferCard from "./OfferCard";
import { Input, Select, SelectItem } from "@heroui/react";

export default function OffersList({
  hideControls,
  onlyRelevantForUser,
}: { hideControls?: boolean; onlyRelevantForUser?: boolean } = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuthState();

  const fetchOffers = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const qs: string[] = [`limit=10`];
      if (!reset && page) qs.push(`after=${page}`);
      // Add server-side filters instead of filtering in-memory
      if (onlyRelevantForUser) {
        const userCourses = (auth.user as any)?.courses ?? [];
        const ids = userCourses.map((c: any) => Number(c.id)).filter(Boolean);
        if (ids.length > 0) {
          let str = ids.join(",");
          if (ids.length === 1 && !str.endsWith(",")) str = `${str},`;
          qs.push(`filter[courses]=${str}`);
        }
      }

      if (careerFilter) {
        let str = String(careerFilter);
        if (!str.endsWith(",")) str = `${str},`;
        qs.push(`filter[courses]=${str}`);
      }

      if (search) qs.push(`q=${encodeURIComponent(search)}`);

      const url = `/offers?${qs.join("&")}`;

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
    fetchOffers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "expiring" | "company">("newest");
  const [careerFilter, setCareerFilter] = useState<string>("");
  const searchTimerRef = React.useRef<number | null>(null);

  // refetch when careerFilter, sort or onlyRelevantForUser change
  useEffect(() => {
    fetchOffers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerFilter, sort, onlyRelevantForUser]);

  // debounce search
  useEffect(() => {
    if (searchTimerRef.current)
      window.clearTimeout(searchTimerRef.current as any);
    // @ts-ignore
    searchTimerRef.current = window.setTimeout(() => {
      fetchOffers(true);
      searchTimerRef.current = null;
    }, 400);
    return () => {
      if (searchTimerRef.current)
        window.clearTimeout(searchTimerRef.current as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const careersOptions = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((it) => {
      const cs = (it.careers ?? it.courses) as any[] | undefined;
      (cs || []).forEach((c) => {
        if (!c) return;
        const id = c.id != null ? String(c.id) : String(c.name ?? c);
        const name = c.name ?? String(c);
        map.set(id, name);
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const displayed = useMemo(() => {
    let list = [...items];

    // Server-side filtering applied in fetchOffers; apply client-side fuzzy search (Fuse)
    if (!hideControls) {
      // fuzzy search
      if (search && search.trim().length > 0) {
        try {
          const fuse = new Fuse(list, {
            threshold: 0.4,
            keys: [
              "position",
              "description",
              "company.name",
              "careers.name",
              "courses.name",
            ],
          });
          list = fuse.search(search).map((r) => r.item);
        } catch (e) {
          console.warn("Fuse search failed, falling back to simple filter", e);
          const s = search.toLowerCase();
          list = list.filter(
            (it) =>
              String(it.position ?? "")
                .toLowerCase()
                .includes(s) ||
              String(it.company?.name ?? "")
                .toLowerCase()
                .includes(s) ||
              String(it.description ?? "")
                .toLowerCase()
                .includes(s),
          );
        }
      }
      // client-side sorting remains
      if (sort === "expiring") {
        list.sort((a, b) => {
          const aa = a.expiresAt || "";
          const bb = b.expiresAt || "";
          return aa.localeCompare(bb);
        });
      } else if (sort === "company") {
        list.sort((a, b) =>
          String(a.company?.name ?? "").localeCompare(
            String(b.company?.name ?? ""),
          ),
        );
      } else {
        list.sort((a, b) =>
          (b.publishedAt || "").localeCompare(a.publishedAt || ""),
        );
      }
    }
    return list;
  }, [items, search, careerFilter, sort, hideControls]);

  console.log(hideControls);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {!hideControls && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 w-full max-w-2xl">
            <Input
              placeholder="Buscar ofertas..."
              isClearable
              value={search}
              onValueChange={(v) => setSearch(String(v))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-56">
              <Select
                placeholder="Todas las carreras"
                selectedKeys={new Set(careerFilter ? [careerFilter] : [])}
                onSelectionChange={(v: any) => {
                  let val = "";
                  if (v instanceof Set) val = String(Array.from(v)[0] ?? "");
                  else val = String(v ?? "");
                  setCareerFilter(val);
                }}
                className="w-full"
              >
                <SelectItem key="">Todas las carreras</SelectItem>
                {...careersOptions.map((c) => (
                  <SelectItem key={c.id} title={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="w-48">
              <Select
                selectedKeys={new Set([sort])}
                onSelectionChange={(v: any) => {
                  let val = "newest";
                  if (v instanceof Set)
                    val = String(Array.from(v)[0] ?? "newest");
                  else val = String(v ?? "newest");
                  setSort(val as any);
                }}
                className="w-full"
              >
                <SelectItem key="newest">Más recientes</SelectItem>
                <SelectItem key="expiring">Por expirar</SelectItem>
                <SelectItem key="company">Empresa A-Z</SelectItem>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div>
        {displayed.length === 0 && !loading ? (
          <div className="text-gray-600">No se encontraron ofertas.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((it) => (
              <OfferCard
                key={it.id}
                id={it.id}
                position={it.position}
                company={it.company?.name ?? "N/A"}
                location={it.location}
                vacancies={it.vacancies}
                expiresAt={it.expiresAt}
                description={it.description}
                careers={(it.careers ?? it.courses) as any[]}
                skills={(it.skills ?? []).map((s: any) => s.name ?? s)}
                logo={it.company?.logo}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        {page ? (
          <Button onPress={() => fetchOffers(false)} disabled={loading}>
            {loading ? "Cargando..." : "Cargar más"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
