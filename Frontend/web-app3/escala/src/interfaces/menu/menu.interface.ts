import { MenuLocationEnum } from "../enums/menu-location.enum"
import { MenuLinkTypeEnum } from "../enums/menu-link-type.enum"
import { IconPositionEnum } from "../enums/icon-position.enum"

export interface MenuIcon {
  id: number
  url: string
  alternativeText?: string
}

export interface MenuItem {
  id: number
  documentId?: string
  title: string
  slug?: string
  description?: string
  order: number
  active: boolean
  linkType?: MenuLinkTypeEnum | null
  destination?: string | null
  location: MenuLocationEnum
  icon?: MenuIcon
  iconPosition?: IconPositionEnum
  childItems?: MenuItem[]
  parentItem?: MenuItem | null
}
