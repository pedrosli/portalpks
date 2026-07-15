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
    .select("*, property_photos(*)")
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
    <div className="flex flex-col gap-6">
      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar imóvel pelo nome..."
          className="w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          className="rounded-md bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800"
        >
          Buscar
        </button>
        {q && (
          <Link
            href="/imoveis"
            className="flex items-center px-2 text-sm text-neutral-500 hover:text-neutral-900"
          >
            Limpar
          </Link>
        )}
      </form>

      {list.length === 0 && (
        <p className="text-sm text-neutral-500">
          {q ? `Nenhum imóvel encontrado para "${q}".` : "Nenhum imóvel disponível."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((property) => {
          const coverPhoto = property.property_photos.find(
            (ph) => ph.id === property.cover_photo_id
          );
          const coverUrl = coverPhoto ? signedUrls[coverPhoto.path] : undefined;

          return (
            <Link
              key={property.id}
              href={`/imoveis/${property.id}`}
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 w-full bg-neutral-100">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    Sem foto
                  </div>
                )}
                <span
                  className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    property.status === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {property.status === "available" ? "Disponível" : "Alugado"}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3">
                <h2 className="font-medium">{property.title}</h2>
                <p className="text-sm text-neutral-500">
                  {property.neighborhood || "-"}
                </p>
                <p className="text-sm font-medium">{formatCurrency(property.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
