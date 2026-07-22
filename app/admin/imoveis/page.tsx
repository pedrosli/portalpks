import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/photos";
import { formatCurrency } from "@/lib/format";
import StatusToggle from "@/components/admin/StatusToggle";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";
import type { Property, PropertyPhoto } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_photos!property_photos_property_id_fkey(*)")
    .order("created_at", { ascending: false });

  const list = (properties ?? []) as (Property & {
    property_photos: PropertyPhoto[];
  })[];

  const coverPaths = list
    .map((p) => p.property_photos.find((ph) => ph.id === p.cover_photo_id)?.path)
    .filter((path): path is string => Boolean(path));

  const signedUrls = await getSignedPhotoUrls(supabase, coverPaths);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            Imóveis <span className="gradient-text">cadastrados</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {list.length} imóve{list.length === 1 ? "l" : "is"} no total
          </p>
        </div>
        <Link href="/admin/imoveis/novo" className="btn-primary">
          + Novo imóvel
        </Link>
      </div>

      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-4 py-10 text-center text-sm text-neutral-500">
          Nenhum imóvel cadastrado ainda.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {list.map((property) => {
          const coverPhoto = property.property_photos.find(
            (ph) => ph.id === property.cover_photo_id
          );
          const coverUrl = coverPhoto ? signedUrls[coverPhoto.path] : undefined;

          return (
            <div
              key={property.id}
              className="card card-interactive flex items-center gap-4 p-4"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
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
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/imoveis/${property.id}/editar`}
                  className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-violet-700"
                >
                  {property.title}
                </Link>
                <p className="text-sm text-neutral-500">
                  {property.neighborhood || "-"} · {formatCurrency(property.price)} ·{" "}
                  {property.property_photos.length} foto(s)
                </p>
              </div>

              <StatusToggle propertyId={property.id} status={property.status} />

              <Link
                href={`/admin/imoveis/${property.id}/editar`}
                className="btn-ghost"
              >
                Editar
              </Link>

              <DeletePropertyButton propertyId={property.id} title={property.title} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
