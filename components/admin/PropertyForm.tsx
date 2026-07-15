"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Property } from "@/lib/types";

type FormState = {
  title: string;
  neighborhood: string;
  price: string;
  area_m2: string;
  bedrooms: string;
  bathrooms: string;
  parking_spots: string;
  furnished: boolean;
  condo_fee: string;
  iptu: string;
  floor: string;
  pets_allowed: boolean;
  available_from: string;
  contact_name: string;
  contact_phone: string;
  description: string;
};

function toFormState(property?: Property | null): FormState {
  return {
    title: property?.title ?? "",
    neighborhood: property?.neighborhood ?? "",
    price: property?.price?.toString() ?? "",
    area_m2: property?.area_m2?.toString() ?? "",
    bedrooms: property?.bedrooms?.toString() ?? "",
    bathrooms: property?.bathrooms?.toString() ?? "",
    parking_spots: property?.parking_spots?.toString() ?? "",
    furnished: property?.furnished ?? false,
    condo_fee: property?.condo_fee?.toString() ?? "",
    iptu: property?.iptu?.toString() ?? "",
    floor: property?.floor ?? "",
    pets_allowed: property?.pets_allowed ?? false,
    available_from: property?.available_from ?? "",
    contact_name: property?.contact_name ?? "",
    contact_phone: property?.contact_phone ?? "",
    description: property?.description ?? "",
  };
}

function toNullableNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function toPayload(form: FormState) {
  return {
    title: form.title.trim(),
    neighborhood: form.neighborhood.trim() || null,
    price: toNullableNumber(form.price),
    area_m2: toNullableNumber(form.area_m2),
    bedrooms: toNullableInt(form.bedrooms),
    bathrooms: toNullableInt(form.bathrooms),
    parking_spots: toNullableInt(form.parking_spots),
    furnished: form.furnished,
    condo_fee: toNullableNumber(form.condo_fee),
    iptu: toNullableNumber(form.iptu),
    floor: form.floor.trim() || null,
    pets_allowed: form.pets_allowed,
    available_from: form.available_from || null,
    contact_name: form.contact_name.trim() || null,
    contact_phone: form.contact_phone.trim() || null,
    description: form.description.trim() || null,
  };
}

export default function PropertyForm({ property }: { property?: Property | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(property));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("O título do imóvel é obrigatório.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = toPayload(form);

    if (property) {
      const { error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", property.id);

      setSaving(false);
      if (error) {
        setError("Não foi possível salvar as alterações.");
        return;
      }
      setSaved(true);
      router.refresh();
    } else {
      const { data, error } = await supabase
        .from("properties")
        .insert(payload)
        .select("id")
        .single();

      setSaving(false);
      if (error || !data) {
        setError("Não foi possível criar o imóvel.");
        return;
      }
      router.push(`/admin/imoveis/${data.id}/editar`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título / nome do imóvel" required className="sm:col-span-2">
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="input"
            placeholder='Ex: "Apto 2 quartos - Vista Mar"'
          />
        </Field>

        <Field label="Bairro">
          <input
            value={form.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Aluguel (R$)">
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Área (m²)">
          <input
            type="number"
            value={form.area_m2}
            onChange={(e) => set("area_m2", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Andar">
          <input
            value={form.floor}
            onChange={(e) => set("floor", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Quartos">
          <input
            type="number"
            value={form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Banheiros">
          <input
            type="number"
            value={form.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Vagas de garagem">
          <input
            type="number"
            value={form.parking_spots}
            onChange={(e) => set("parking_spots", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Condomínio (R$)">
          <input
            type="number"
            value={form.condo_fee}
            onChange={(e) => set("condo_fee", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="IPTU (R$)">
          <input
            type="number"
            value={form.iptu}
            onChange={(e) => set("iptu", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Disponível a partir de">
          <input
            type="date"
            value={form.available_from}
            onChange={(e) => set("available_from", e.target.value)}
            className="input"
          />
        </Field>

        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.furnished}
              onChange={(e) => set("furnished", e.target.checked)}
            />
            Mobiliado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.pets_allowed}
              onChange={(e) => set("pets_allowed", e.target.checked)}
            />
            Aceita pet
          </label>
        </div>

        <Field label="Nome do responsável">
          <input
            value={form.contact_name}
            onChange={(e) => set("contact_name", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Telefone do responsável">
          <input
            value={form.contact_phone}
            onChange={(e) => set("contact_phone", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Descrição" className="sm:col-span-2">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            className="input"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : property ? "Salvar alterações" : "Criar imóvel"}
        </button>
        {saved && <span className="text-sm text-green-700">Salvo.</span>}
      </div>

      <style jsx global>{`
        .input {
          border: 1px solid #d4d4d4;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #737373;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
