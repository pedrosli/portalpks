"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PropertyStatus } from "@/lib/types";

export default function StatusToggle({
  propertyId,
  status,
}: {
  propertyId: string;
  status: PropertyStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const nextStatus: PropertyStatus =
      status === "available" ? "rented" : "available";

    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("properties")
      .update({ status: nextStatus })
      .eq("id", propertyId);
    setLoading(false);
    router.refresh();
  }

  const isAvailable = status === "available";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`badge-pill shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 ${
        isAvailable
          ? "bg-emerald-500 text-white hover:bg-emerald-600"
          : "bg-neutral-800 text-white hover:bg-neutral-700"
      }`}
    >
      {isAvailable ? "Disponível" : "Alugado"}
    </button>
  );
}
