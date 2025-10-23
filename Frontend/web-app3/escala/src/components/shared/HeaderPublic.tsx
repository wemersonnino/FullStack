"use client";

import { useEffect, useState } from "react"
import { getMenu } from "@/services/menu.service"
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Menu } from "./Menu"

export const HeaderPublic = () => {
  const [menu, setMenu] = useState<any[]>([])

  useEffect(() => {
    getMenu("header").then(setMenu)
  }, [])

  return (
    <header
      className="flex items-center justify-between p-4 bg-white w-full
     dark:bg-gray-800 shadow-md"
    >
      <h1 className="text-2xl font-bold">Plataforma Escala</h1>
      <nav className="flex gap-6">
          {menu.map((item) => (
            <a key={item.id} href={item.destination ?? "#"}>
              {item.title}
            </a>
          ))}
      </nav>
      <ThemeToggle />
    </header>
  );
};
