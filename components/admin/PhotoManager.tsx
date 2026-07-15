"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { photoStoragePath } from "@/lib/supabase/photos";
import type { PropertyPhoto } from "@/lib/types";

type PhotoWithUrl = PropertyPhoto & { signedUrl?: string };

export default function PhotoManager({
  propertyId,
  initialPhotos,
  initialCoverPhotoId,
}: {
  propertyId: string;
  initialPhotos: PhotoWithUrl[];
  initialCoverPhotoId: string | null;
}) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>(
    [...initialPhotos].sort((a, b) => a.position - b.position)
  );
  const [coverPhotoId, setCoverPhotoId] = useState(initialCoverPhotoId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();

    const { data: rows } = await supabase
      .from("property_photos")
      .select("*")
      .eq("property_id", propertyId)
      .order("position", { ascending: true });

    const list = (rows ?? []) as PropertyPhoto[];

    const { data: signed } = await supabase.storage
      .from("property-photos")
      .createSignedUrls(
        list.map((p) => p.path),
        60 * 60
      );

    const urlByPath = new Map(
      (signed ?? []).map((s) => [s.path, s.signedUrl] as const)
    );

    setPhotos(
      list.map((p) => ({ ...p, signedUrl: urlByPath.get(p.path) ?? undefined }))
    );

    const { data: property } = await supabase
      .from("properties")
      .select("cover_photo_id")
      .eq("id", propertyId)
      .single();

    setCoverPhotoId(property?.cover_photo_id ?? null);
  }, [propertyId]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      setUploading(true);
      const supabase = createClient();

      let nextPosition = photos.length;
      let hadFailure = false;

      for (const file of acceptedFiles) {
        const path = photoStoragePath(propertyId, file.name);
        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(path, file);

        if (uploadError) {
          hadFailure = true;
          continue;
        }

        const { data: inserted } = await supabase
          .from("property_photos")
          .insert({ property_id: propertyId, path, position: nextPosition })
          .select("id")
          .single();

        nextPosition += 1;

        if (inserted && !coverPhotoId) {
          await supabase
            .from("properties")
            .update({ cover_photo_id: inserted.id })
            .eq("id", propertyId);
        }
      }

      if (hadFailure) {
        setError("Algumas fotos não puderam ser enviadas. Tente novamente.");
      }

      setUploading(false);
      await refresh();
    },
    [photos.length, propertyId, coverPhotoId, refresh]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  async function handleSetCover(photoId: string) {
    setCoverPhotoId(photoId);
    const supabase = createClient();
    await supabase
      .from("properties")
      .update({ cover_photo_id: photoId })
      .eq("id", propertyId);
  }

  async function handleDelete(photo: PhotoWithUrl) {
    if (!confirm("Remover esta foto?")) return;
    const supabase = createClient();
    await supabase.storage.from("property-photos").remove([photo.path]);
    await supabase.from("property_photos").delete().eq("id", photo.id);
    await refresh();
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    setPhotos(reordered);

    const supabase = createClient();
    await Promise.all(
      reordered.map((photo, i) =>
        supabase.from("property_photos").update({ position: i }).eq("id", photo.id)
      )
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm transition-colors ${
          isDragActive
            ? "border-neutral-500 bg-neutral-100"
            : "border-neutral-300 text-neutral-500"
        }`}
      >
        <input {...getInputProps()} />
        {uploading
          ? "Enviando fotos..."
          : isDragActive
          ? "Solte as fotos aqui"
          : "Arraste fotos aqui, ou clique para selecionar (várias de uma vez)"}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {photos.length > 0 && (
        <>
          <p className="text-xs text-neutral-500">
            Arraste os cartões para reordenar. Clique em uma foto para defini-la
            como capa.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className="group relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
              >
                {photo.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.signedUrl}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center text-xs text-neutral-400">
                    Carregando...
                  </div>
                )}

                {photo.id === coverPhotoId && (
                  <span className="absolute left-1 top-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Capa
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    className="flex-1 rounded bg-white/90 px-1 py-0.5 text-[10px] font-medium text-neutral-900 hover:bg-white"
                  >
                    Definir capa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    className="rounded bg-white/90 px-1 py-0.5 text-[10px] font-medium text-red-600 hover:bg-white"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
