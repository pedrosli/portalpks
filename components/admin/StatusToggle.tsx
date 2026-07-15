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
      className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
        isAvailable
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
      }`}
    >
      {isAvailable ? "Disponível" : "Alugado"}
    </button>
  );
}
