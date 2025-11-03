'use client';

import Image from 'next/image';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { IconPositionEnum } from '@/interfaces/enums/iconPosition.enum';

export const Menu = ({ items }: { items: MenuItem[] }) => {
  return (
    <nav className="flex items-center gap-6">
      {items.map((item) => (
        <MenuItemComponent key={item.id} item={item} />
      ))}
    </nav>
  );
};

function MenuItemComponent({ item }: { readonly item: MenuItem }) {
  if (!item.active) return null;
  const hasChildren = item.childItems && item.childItems.length > 0;

  return (
    <div className="group relative">
      <a href={item.destination ?? '#'} className="flex items-center gap-2 hover:text-blue-600">
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
      </a>

      {hasChildren && (
        <ul className="invisible absolute left-0 mt-2 rounded-lg border bg-white opacity-0 shadow-md transition group-hover:visible group-hover:opacity-100">
          {item.childItems!.map((child) => (
            <li key={child.id}>
              <a href={child.destination ?? '#'} className="block px-4 py-2 hover:bg-gray-100">
                {child.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
