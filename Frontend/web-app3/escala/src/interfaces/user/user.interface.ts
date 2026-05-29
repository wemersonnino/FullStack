import { ThemeEnum } from "@/interfaces/enums/theme.enum"

export interface User {
  id: string | number
  username: string
  email: string
  roles: string[]
  theme?: ThemeEnum
  avatar?: string | { url: string }
  avatarUrl?: string | null
  address?: string
  position?: string
  function?: string
  companies?: any[]
}
