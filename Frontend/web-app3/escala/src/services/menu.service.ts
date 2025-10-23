import { API_ROUTES } from "@/constants";
import { httpGet } from "@/lib/request"
import { MenuItem } from "@/interfaces/menu/menu.interface"
import { MenuLocationEnum } from "@/interfaces/enums/menuLocation.enum"
import { MenuLinkTypeEnum } from "@/interfaces/enums/menuLinkType.enum"
import { IconPositionEnum } from "@/interfaces/enums/iconPosition.enum"

export async function getMenu(location: MenuLocationEnum): Promise<MenuItem[]> {
  const data = await httpGet<{ data: any[] }>(API_ROUTES.MENU, { cache: "no-store" })

  if (!data?.data) return []

  return data.data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    order: item.order,
    active: item.active,
    destination: item.destination,
    location: item.location as MenuLocationEnum,
    linkType: item.linkType as MenuLinkTypeEnum,
    iconPosition: (item.iconPosition as IconPositionEnum) ?? IconPositionEnum.LEFT,
    icon: item.icon
      ? {
          id: item.icon.id,
          url: item.icon.url,
          alternativeText: item.icon.alternativeText,
        }
      : undefined,
    childItems: item.childItems || [],
  }))
}
