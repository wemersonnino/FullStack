"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { MenuItem } from "@/interfaces/menu/menu.interface"

export const Menu = ({ items }: { items: MenuItem[] }) =>{
    return (
        <nav className="flex items-center gap-6">
          {items.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </nav>
    )
}

function MenuItemComponent({ item }: { item: MenuItem }) {
  if (!item.active) return null
  const hasChildren = item.childItems && item.childItems.length > 0

  return (
    <div className="relative group">
      <Link href={item.destination ?? "#"} className="flex items-center gap-2 hover:text-blue-600">
        {item.icon?.url && item.iconPosition === IconPositionEnum.LEFT && (
          <Image
            src={item.icon.url}
            alt={item.icon.alternativeText || item.title}
            width={20}
            height={20}
          />
        )}
        {item.title}
        {item.icon?.url && item.iconPosition === IconPositionEnum.RIGHT && (
          <Image
            src={item.icon.url}
            alt={item.icon.alternativeText || item.title}
            width={20}
            height={20}
          />
        )}
      </Link>

      {hasChildren && (
        <ul className="absolute left-0 mt-2 bg-white border rounded-lg shadow-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition">
          {item.childItems!.map((child) => (
            <li key={child.id}>
              <Link href={child.destination ?? "#"} className="block px-4 py-2 hover:bg-gray-100">
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}