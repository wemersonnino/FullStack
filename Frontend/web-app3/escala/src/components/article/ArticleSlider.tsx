"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ArticleMedia } from "@/interfaces/article/article.interface";

interface ArticleSliderProps {
  files: ArticleMedia[];
}

export function ArticleSlider({ files }: ArticleSliderProps) {
  const [current, setCurrent] = useState(0);

  const images = files.filter(
    (file) =>
      file.url && (file.mime?.startsWith("image/") || file.ext?.match(/\.(avif|gif|jpe?g|png|webp|svg)$/i))
  );
  if (!images.length) return null;

  const currentImage = images[current];

  function goPrevious() {
    setCurrent((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function goNext() {
    setCurrent((index) => (index + 1) % images.length);
  }

  return (
    <figure className="my-10">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
        <Image
          src={currentImage.url}
          alt={currentImage.alternativeText || currentImage.name || "Imagem do artigo"}
          fill
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={goPrevious}
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/75 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Proxima imagem"
              onClick={goNext}
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/75 cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {(currentImage.caption || images.length > 1) && (
        <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-gray-500">
          <span>{currentImage.caption}</span>
          {images.length > 1 && (
            <span>
              {current + 1} / {images.length}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
