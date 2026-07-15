import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/photos";
import { formatCurrency } from "@/lib/format";
import type { Property, PropertyPhoto } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PropertiesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*, property_photos!property_photos_property_id_fkey(*)")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (q && q.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }

  const { data: properties } = await query;

  const list = (properties ?? []) as (Property & {
    property_photos: PropertyPhoto[];
  })[];

  const coverPaths = list
    .map((p) => p.property_photos.find((ph) => ph.id === p.cover_photo_id)?.path)
    .filter((path): path is string => Boolean(path));

  const signedUrls = await getSignedPhotoUrls(supabase, coverPaths);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
          Encontre o <span className="gradient-text">imóvel certo</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Busque pelo nome do imóvel e leve fotos e informações em segundos.
        </p>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar imóvel pelo nome..."
          className="input-field max-w-md"
        />
        <button type="submit" className="btn-primary">
          Buscar
        </button>
        {q && (
          <Link href="/imoveis" className="btn-ghost">
            Limpar
          </Link>
        )}
      </form>

      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-4 py-10 text-center text-sm text-neutral-500">
          {q ? `Nenhum imóvel encontrado para "${q}".` : "Nenhum imóvel disponível."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((property) => {
          const coverPhoto = property.property_photos.find(
            (ph) => ph.id === property.cover_photo_id
          );
          const coverUrl = coverPhoto ? signedUrls[coverPhoto.path] : undefined;

          return (
            <Link
              key={property.id}
              href={`/imoveis/${property.id}`}
              className="card card-interactive group flex flex-col overflow-hidden"
            >
              <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    Sem foto
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <span className="badge-pill absolute right-3 top-3 bg-emerald-500 text-white shadow-sm">
                  Disponível
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <h2 className="font-semibold text-neutral-900">{property.title}</h2>
                <p className="text-sm text-neutral-500">
                  {property.neighborhood || "-"}
                </p>
                <p className="gradient-text mt-1 text-lg font-bold">
                  {formatCurrency(property.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
