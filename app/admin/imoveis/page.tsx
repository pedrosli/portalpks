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
    .select("*, property_photos(*)")
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
        <h1 className="text-xl font-semibold">Imóveis cadastrados</h1>
        <Link
          href="/admin/imoveis/novo"
          className="rounded-md bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800"
        >
          + Novo imóvel
        </Link>
      </div>

      {list.length === 0 && (
        <p className="text-sm text-neutral-500">Nenhum imóvel cadastrado ainda.</p>
      )}

      <div className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {list.map((property) => {
          const coverPhoto = property.property_photos.find(
            (ph) => ph.id === property.cover_photo_id
          );
          const coverUrl = coverPhoto ? signedUrls[coverPhoto.path] : undefined;

          return (
            <div key={property.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
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

              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/imoveis/${property.id}/editar`}
                  className="font-medium hover:underline"
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
                className="text-sm text-neutral-600 hover:text-neutral-900"
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
