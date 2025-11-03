import { MenuItem } from "@/interfaces/menu/menu.interface";
import { normalizeImageUrlStrapi } from "@/lib/utils";

/**
 * Converte um item cru do Strapi em um MenuItem tipado.
 * Suporta hierarquia (childItems e parentItem).
 */
export function mapMenu(item: any): MenuItem {
  return {
    id: item.id,
    documentId: item.documentId || undefined,
    title: item.title,
    slug: item.slug || undefined,
    description: item.description || undefined,
    order: item.order,
    active: item.active,
    linkType: item.linkType || null,
    destination: item.destination || null,
    location: item.location,
    icon: item.icon
      ? {
          id: item.icon.id,
          url: normalizeImageUrlStrapi(item.icon.url),
          alternativeText: item.icon.alternativeText || undefined,
        }
      : undefined,
    iconPosition: item.iconPosition || undefined,
    childItems: item.childItems?.length
      ? item.childItems.map((child: any) => mapMenu(child))
      : [],
    parentItem: item.parentItem ? mapMenu(item.parentItem) : null,
  };
}

/**
 * Converte uma lista de menus vindos do Strapi.
 */
export function mapMenus(data: any[]): MenuItem[] {
  return data.map(mapMenu);
}
