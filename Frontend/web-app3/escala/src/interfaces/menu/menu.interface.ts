import { MenuLocationEnum } from "../enums/menuLocation.enum"
import { MenuLinkTypeEnum } from "../enums/menuLinkType.enum"
import { IconPositionEnum } from "../enums/iconPosition.enum"

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
