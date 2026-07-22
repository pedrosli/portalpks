import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/photos";
import { formatCurrency, formatDate, buildPropertySheetText } from "@/lib/format";
import PropertyGallery from "@/components/PropertyGallery";
import CopyButton from "@/components/CopyButton";
import SuggestedDescription from "@/components/SuggestedDescription";
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
      <Link
        href="/imoveis"
        className="w-fit text-sm font-medium text-neutral-500 transition-colors hover:text-violet-700"
      >
        &larr; Voltar para a busca
      </Link>

      <div className="card overflow-hidden p-2 sm:p-3">
        <PropertyGallery photos={photosWithUrls} title={typedProperty.title} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            {typedProperty.title}
          </h1>
          <p className="text-neutral-500">{typedProperty.neighborhood || "-"}</p>
          <p className="gradient-text mt-2 text-2xl font-bold">
            {formatCurrency(typedProperty.price)}
          </p>
        </div>
        <span
          className={`badge-pill h-fit shadow-sm ${
            typedProperty.status === "available"
              ? "bg-emerald-500 text-white"
              : "bg-neutral-800 text-white"
          }`}
        >
          {typedProperty.status === "available" ? "Disponível" : "Alugado"}
        </span>
      </div>

      <div className="card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Descrição sugerida</h2>
          <CopyButton text={sheetText} />
        </div>
        <p className="text-xs text-neutral-500">
          Selecione tudo e copie, ou use o botão acima — é só colar numa
          conversa com o cliente.
        </p>
        <SuggestedDescription text={sheetText} />
      </div>

      <div className="card grid grid-cols-2 gap-5 p-5 sm:grid-cols-3 lg:grid-cols-4">
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

      <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
        <a
          href={`/api/properties/${typedProperty.id}/export`}
          className="btn-primary"
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
      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</span>
    </div>
  );
}
