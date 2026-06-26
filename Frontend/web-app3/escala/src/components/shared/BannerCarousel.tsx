"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Banner as BannerType } from "@/interfaces/banner/banner.interface";

interface BannerCarouselProps {
  banners: BannerType[];
  interval?: number; // tempo entre trocas (ms)
}

export const BannerCarousel = ({
  banners,
  interval = 5000,
}: BannerCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const bannersWithImages = banners.filter((banner) => banner.image?.url);

  useEffect(() => {
    if (bannersWithImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannersWithImages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [bannersWithImages.length, interval]);

  if (bannersWithImages.length === 0) return null;

  const safeCurrent = current >= bannersWithImages.length ? 0 : current;
  const currentBanner = bannersWithImages[safeCurrent] ?? bannersWithImages[0];
  const imageUrl = currentBanner.image.url;

  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"
        >
          <Image
            src={imageUrl}
            alt={currentBanner.image?.alternativeText || "Banner"}
            fill
            className="z-0 object-cover"
            priority
          />
          <div className="absolute inset-0 z-10 bg-black/45" />
          <div className="relative z-20 max-w-3xl space-y-4 px-6">
            <h2 className="text-4xl font-bold drop-shadow-md">
              {currentBanner.title}
            </h2>
            {currentBanner.description && (
              <p className="text-lg drop-shadow">{currentBanner.description}</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {bannersWithImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {bannersWithImages.map((banner, idx) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Exibir banner ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition cursor-pointer ${
                idx === safeCurrent ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
