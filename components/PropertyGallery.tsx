"use client";

import { useState } from "react";
import Image from "next/image";
import type { PropertyPhoto } from "@/lib/types";

export default function PropertyGallery({
  photos,
  title,
}: {
  photos: (PropertyPhoto & { signedUrl?: string })[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-400">
        Nenhuma foto cadastrada
      </div>
    );
  }

  const active = photos[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 shadow-inner sm:h-[28rem]">
        {active.signedUrl && (
          <Image
            src={active.signedUrl}
            alt={title}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 640px) 100vw, 800px"
            className="object-cover transition-opacity duration-300"
          />
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                index === activeIndex
                  ? "border-violet-600 shadow-md shadow-violet-600/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {photo.signedUrl && (
                <Image
                  src={photo.signedUrl}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
