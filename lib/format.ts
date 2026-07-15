import type { Property } from "@/lib/types";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "imovel";
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
}

export function buildPropertySheetText(property: Property): string {
  const lines = [
    property.title,
    property.neighborhood ? `Bairro: ${property.neighborhood}` : null,
    `Aluguel: ${formatCurrency(property.price)}`,
    property.condo_fee ? `Condomínio: ${formatCurrency(property.condo_fee)}` : null,
    property.iptu ? `IPTU: ${formatCurrency(property.iptu)}` : null,
    property.area_m2 ? `Área: ${property.area_m2} m²` : null,
    property.bedrooms !== null ? `Quartos: ${property.bedrooms}` : null,
    property.bathrooms !== null ? `Banheiros: ${property.bathrooms}` : null,
    property.parking_spots !== null ? `Vagas: ${property.parking_spots}` : null,
    `Mobiliado: ${property.furnished ? "Sim" : "Não"}`,
    `Aceita pet: ${property.pets_allowed ? "Sim" : "Não"}`,
    property.floor ? `Andar: ${property.floor}` : null,
    property.available_from
      ? `Disponível a partir de: ${formatDate(property.available_from)}`
      : null,
    `Status: ${property.status === "available" ? "Disponível" : "Alugado"}`,
    property.description ? `\nDescrição:\n${property.description}` : null,
    property.contact_name || property.contact_phone
      ? `\nContato: ${[property.contact_name, property.contact_phone]
          .filter(Boolean)
          .join(" - ")}`
      : null,
  ];

  return lines.filter((line) => line !== null).join("\n");
}
