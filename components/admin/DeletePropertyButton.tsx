"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeletePropertyButton({
  propertyId,
  title,
}: {
  propertyId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir o imóvel "${title}"? Essa ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: photos } = await supabase
      .from("property_photos")
      .select("path")
      .eq("property_id", propertyId);

    if (photos && photos.length > 0) {
      await supabase.storage
        .from("property-photos")
        .remove(photos.map((p) => p.path));
    }

    await supabase.from("properties").delete().eq("id", propertyId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
