import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/photos";
import { formatCurrency, formatDate, buildPropertySheetText } from "@/lib/format";
import PropertyGallery from "@/components/PropertyGallery";
import CopyButton from "@/components/CopyButton";
import type { Property, PropertyPhoto } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
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

  const typedProperty = property as Property;

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

  const sheetText = buildPropertySheetText(typedProperty);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/imoveis" className="text-sm text-neutral-500 hover:text-neutral-900">
        &larr; Voltar para a busca
      </Link>

      <PropertyGallery photos={photosWithUrls} title={typedProperty.title} />

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{typedProperty.title}</h1>
          <p className="text-neutral-500">{typedProperty.neighborhood || "-"}</p>
        </div>
        <span
          className={`h-fit rounded-full px-3 py-1 text-sm font-medium ${
            typedProperty.status === "available"
              ? "bg-green-100 text-green-800"
              : "bg-neutral-200 text-neutral-700"
          }`}
        >
          {typedProperty.status === "available" ? "Disponível" : "Alugado"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-4">
        <InfoItem label="Aluguel" value={formatCurrency(typedProperty.price)} />
        <InfoItem
          label="Área"
          value={typedProperty.area_m2 ? `${typedProperty.area_m2} m²` : "-"}
        />
        <InfoItem
          label="Quartos"
          value={typedProperty.bedrooms?.toString() ?? "-"}
        />
        <InfoItem
          label="Banheiros"
          value={typedProperty.bathrooms?.toString() ?? "-"}
        />
        <InfoItem
          label="Vagas"
          value={typedProperty.parking_spots?.toString() ?? "-"}
        />
        <InfoItem label="Mobiliado" value={typedProperty.furnished ? "Sim" : "Não"} />
        <InfoItem
          label="Aceita pet"
          value={typedProperty.pets_allowed ? "Sim" : "Não"}
        />
        <InfoItem label="Andar" value={typedProperty.floor || "-"} />
        <InfoItem label="Condomínio" value={formatCurrency(typedProperty.condo_fee)} />
        <InfoItem label="IPTU" value={formatCurrency(typedProperty.iptu)} />
        <InfoItem
          label="Disponível a partir de"
          value={formatDate(typedProperty.available_from)}
        />
      </div>

      {typedProperty.description && (
        <div>
          <h2 className="font-medium">Descrição</h2>
          <p className="whitespace-pre-line text-sm text-neutral-700">
            {typedProperty.description}
          </p>
        </div>
      )}

      {(typedProperty.contact_name || typedProperty.contact_phone) && (
        <p className="text-sm text-neutral-500">
          Contato: {[typedProperty.contact_name, typedProperty.contact_phone]
            .filter(Boolean)
            .join(" - ")}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
        <CopyButton text={sheetText} />
        <a
          href={`/api/properties/${typedProperty.id}/export`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Baixar tudo (fotos + ficha)
        </a>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
