import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/photos";
import PropertyForm from "@/components/admin/PropertyForm";
import PhotoManager from "@/components/admin/PhotoManager";
import type { Property, PropertyPhoto } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  const { data: photoRows } = await supabase
    .from("property_photos")
    .select("*")
    .eq("property_id", id)
    .order("position", { ascending: true });

  const photos = (photoRows ?? []) as PropertyPhoto[];
  const signedUrls = await getSignedPhotoUrls(
    supabase,
    photos.map((p) => p.path)
  );

  const photosWithUrls = photos.map((p) => ({
    ...p,
    signedUrl: signedUrls[p.path],
  }));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          Editar <span className="gradient-text">imóvel</span>
        </h1>
        <p className="text-sm text-neutral-500">{(property as Property).title}</p>
      </div>

      <PropertyForm property={property as Property} />

      <div className="card flex flex-col gap-4 p-6">
        <h2 className="text-lg font-bold text-neutral-900">Fotos</h2>
        <PhotoManager
          propertyId={id}
          initialPhotos={photosWithUrls}
          initialCoverPhotoId={(property as Property).cover_photo_id}
        />
      </div>
    </div>
  );
}
