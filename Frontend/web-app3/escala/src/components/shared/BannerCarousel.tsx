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

  // Troca automática a cada X segundos
  useEffect(() => {
    if (banners.length <= 1) return; // não roda se houver 1 só
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [banners, interval]);

  if (!banners || banners.length === 0) {
    return (
      <section className="relative flex items-center justify-center h-[60vh] bg-gray-200 text-gray-700">
        <h2 className="text-3xl font-bold">Nenhum banner disponível</h2>
      </section>
    );
  }

  const currentBanner = banners[current];
  const imageUrl = currentBanner.image?.url || "/default-banner.jpg";

  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
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
            className="object-cover -z-10 opacity-70"
            priority
          />
          <div className="z-10 max-w-3xl space-y-4 px-6">
            <h2 className="text-4xl font-bold drop-shadow-md">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-lg drop-shadow">{currentBanner.subtitle}</p>
            )}
            {currentBanner.button_link && (
              <a
                href={currentBanner.button_link}
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                {currentBanner.button_text || "Saiba mais"}
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicadores */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition ${
                idx === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
