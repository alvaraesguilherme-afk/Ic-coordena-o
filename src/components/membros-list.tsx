"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, FilterIcon, XIcon } from "@/components/icons";
import { roleLabel, roleBadgeClass, nomesIguais } from "@/lib/user";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { CAPA_POR_REDE } from "@/lib/redes-capas";

type Role = "LIDER" | "MEMBRO" | "PASTOR";

type Usuario = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  isAdmin: boolean;
  igrejaId: string | null;
  redeId: string | null;
};

type Igreja = { id: string; nome: string; redeId: string };
type Rede = { id: string; nome: string; liderNome: string | null };

export function MembrosList({
  users,
  igrejas,
  redes,
}: {
  users: Usuario[];
  igrejas: Igreja[];
  redes: Rede[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [redeId, setRedeId] = useState("");
  const [igrejaId, setIgrejaId] = useState("");
  const [papel, setPapel] = useState<"" | "LIDER" | "MEMBRO">("");

  const redeNomePorId = useMemo(() => new Map(redes.map((r) => [r.id, r.nome])), [redes]);
  const redeLiderNomePorId = useMemo(() => new Map(redes.map((r) => [r.id, r.liderNome])), [redes]);
  const igrejaPorId = useMemo(() => new Map(igrejas.map((i) => [i.id, i])), [igrejas]);
  const igrejasDaRede = useMemo(
    () => (redeId ? igrejas.filter((i) => i.redeId === redeId) : igrejas),
    [igrejas, redeId],
  );

  function handleRedeChange(value: string) {
    setRedeId(value);
    if (igrejaId) {
      const igreja = igrejaPorId.get(igrejaId);
      if (value && (!igreja || igreja.redeId !== value)) setIgrejaId("");
    }
  }

  const hasActiveFilters = Boolean(redeId || igrejaId || papel);
  const hasActiveSearch = query.trim().length > 0;

  function isSupervisor(user: Usuario) {
    return (
      user.role === "LIDER" &&
      !!user.redeId &&
      nomesIguais(redeLiderNomePorId.get(user.redeId), user.name)
    );
  }

  const gruposPorRede = useMemo(() => {
    const porRede = new Map<string, { id: string; nome: string; users: Usuario[] }>();
    for (const r of redes) {
      porRede.set(r.id, { id: r.id, nome: redeNomeSemPrefixo(r.nome), users: [] });
    }
    const pastores: Usuario[] = [];
    const semRede: Usuario[] = [];
    for (const user of users) {
      if (user.role === "PASTOR") {
        pastores.push(user);
        continue;
      }
      const igreja = user.igrejaId ? igrejaPorId.get(user.igrejaId) : undefined;
      const userRedeId = igreja ? igreja.redeId : user.redeId;
      const grupo = userRedeId ? porRede.get(userRedeId) : undefined;
      if (grupo) grupo.users.push(user);
      else semRede.push(user);
    }
    // O supervisor (líder da rede) sempre aparece primeiro dentro da sua rede,
    // fora da ordem alfabética — ele é a referência daquela rede.
    for (const grupo of porRede.values()) {
      grupo.users.sort((a, b) => Number(isSupervisor(b)) - Number(isSupervisor(a)));
    }
    // A query de redes não tem ORDER BY, então a ordem do banco não é
    // garantida — ordena por nome aqui pra sempre ficar estável.
    const grupos = [...porRede.values()]
      .filter((g) => g.users.length > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return { grupos, pastores, semRede };
  }, [users, redes, igrejaPorId, redeLiderNomePorId]);

  const filtered = users.filter((user) => {
    if (hasActiveSearch && !user.name.toLowerCase().includes(query.trim().toLowerCase())) {
      return false;
    }
    if (redeId) {
      const igreja = user.igrejaId ? igrejaPorId.get(user.igrejaId) : undefined;
      const userRedeId = igreja ? igreja.redeId : user.redeId;
      if (userRedeId !== redeId) return false;
    }
    if (igrejaId && user.igrejaId !== igrejaId) return false;
    if (papel && user.role !== papel) return false;
    return true;
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
            searchOpen
              ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-100"
              : "border-white/15 bg-white/5 text-white/60 hover:text-white"
          }`}
          aria-label="Pesquisar por nome"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
            filterOpen || hasActiveFilters
              ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-100"
              : "border-white/15 bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          <FilterIcon className="h-4 w-4" />
          Filtrar
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black">
              {[redeId, igrejaId, papel].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {searchOpen && (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-9 text-base text-white placeholder:text-white/30 outline-none focus:border-yellow-400/40 sm:text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              aria-label="Limpar busca"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {filterOpen && (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-white/50">Rede</span>
            <select
              value={redeId}
              onChange={(e) => handleRedeChange(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/40"
            >
              <option value="">Todas as redes</option>
              {redes.map((r) => (
                <option key={r.id} value={r.id}>
                  {redeNomeSemPrefixo(r.nome)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-white/50">IC</span>
            <select
              value={igrejaId}
              onChange={(e) => setIgrejaId(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/40"
            >
              <option value="">Todas as ICs</option>
              {igrejasDaRede.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-white/50">Papel</span>
            <select
              value={papel}
              onChange={(e) => setPapel(e.target.value as "" | "LIDER" | "MEMBRO")}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/40"
            >
              <option value="">Todos</option>
              <option value="LIDER">Líder</option>
              <option value="MEMBRO">Membros</option>
            </select>
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setRedeId("");
                setIgrejaId("");
                setPapel("");
              }}
              className="rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-white/60 hover:text-white"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {(hasActiveSearch || hasActiveFilters) && (
        <p className="text-sm text-white/50">
          {filtered.length} {filtered.length === 1 ? "pessoa encontrada" : "pessoas encontradas"}
        </p>
      )}

      {hasActiveSearch || hasActiveFilters ? (
        filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">Nenhum membro encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((user) => (
              <MemberCard
                key={user.id}
                user={user}
                igrejaPorId={igrejaPorId}
                redeNomePorId={redeNomePorId}
                redeLiderNomePorId={redeLiderNomePorId}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-8">
          {gruposPorRede.pastores.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/20 p-2 ring-2 ring-red-400/40">
                  <Image src="/brand/logo-impulse.png" alt="" width={28} height={28} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-white">Pastor</p>
                  <p className="text-xs text-white/40">
                    {gruposPorRede.pastores.length}{" "}
                    {gruposPorRede.pastores.length === 1 ? "pessoa" : "pessoas"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {gruposPorRede.pastores.map((user) => (
                  <MemberCard
                    key={user.id}
                    user={user}
                    igrejaPorId={igrejaPorId}
                    redeNomePorId={redeNomePorId}
                    redeLiderNomePorId={redeLiderNomePorId}
                  />
                ))}
              </div>
            </div>
          )}

          {gruposPorRede.grupos.map((grupo) => {
            const capa = CAPA_POR_REDE[grupo.nome];
            return (
              <div key={grupo.id}>
                <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3">
                  <div
                    className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center ring-2 ring-yellow-400/30"
                    style={
                      capa
                        ? { backgroundImage: `url(${capa})` }
                        : { background: "linear-gradient(135deg, rgba(239,68,68,.3), rgba(250,204,21,.3))" }
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">{grupo.nome}</p>
                    <p className="text-xs text-white/40">
                      {grupo.users.length} {grupo.users.length === 1 ? "pessoa" : "pessoas"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {grupo.users.map((user) => (
                    <MemberCard
                      key={user.id}
                      user={user}
                      igrejaPorId={igrejaPorId}
                      redeNomePorId={redeNomePorId}
                      redeLiderNomePorId={redeLiderNomePorId}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {gruposPorRede.semRede.length > 0 && (
            <div>
              <h2 className="mb-4 border-b border-white/10 pb-3 text-sm font-semibold uppercase tracking-wide text-white/60">
                Sem rede ainda
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {gruposPorRede.semRede.map((user) => (
                  <MemberCard
                    key={user.id}
                    user={user}
                    igrejaPorId={igrejaPorId}
                    redeNomePorId={redeNomePorId}
                    redeLiderNomePorId={redeLiderNomePorId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function MemberCard({
  user,
  igrejaPorId,
  redeNomePorId,
  redeLiderNomePorId,
}: {
  user: Usuario;
  igrejaPorId: Map<string, Igreja>;
  redeNomePorId: Map<string, string>;
  redeLiderNomePorId: Map<string, string | null>;
}) {
  const igreja = user.igrejaId ? igrejaPorId.get(user.igrejaId) : undefined;
  const redeNomeBruto =
    user.role === "PASTOR"
      ? "Rede Impulse"
      : igreja
        ? redeNomePorId.get(igreja.redeId)
        : user.redeId
          ? redeNomePorId.get(user.redeId)
          : undefined;
  const redeNome = redeNomeBruto ? redeNomeSemPrefixo(redeNomeBruto) : undefined;
  const liderDeRede =
    user.role === "LIDER" &&
    !!user.redeId &&
    nomesIguais(redeLiderNomePorId.get(user.redeId), user.name);

  return (
    <Link
      href={`/membros/${user.id}`}
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 text-center shadow-lg shadow-black/30 transition hover:border-yellow-400/40 active:scale-95"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/10">
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={64}
            height={64}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <p className="text-sm font-medium text-white">{user.name}</p>

      {user.role !== "MEMBRO" && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${roleBadgeClass({ ...user, liderDeRede })}`}
        >
          {roleLabel({ ...user, liderDeRede })}
        </span>
      )}

      <p className="text-xs text-white/40">
        {igreja && redeNome ? `${redeNome} · ${igreja.nome}` : redeNome ? redeNome : "Sem rede ainda"}
      </p>
    </Link>
  );
}
