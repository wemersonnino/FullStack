"use client";

import { ThemeToggle } from "@/components/shared/ThemeToggle";

export const HeaderPublic = () => {
  return (
    <header
      className="flex items-center justify-between p-4 bg-white w-full
     dark:bg-gray-800 shadow-md"
    >
      <h1 className="text-2xl font-bold">Plataforma Escala</h1>
      <ThemeToggle />
    </header>
  );
};
