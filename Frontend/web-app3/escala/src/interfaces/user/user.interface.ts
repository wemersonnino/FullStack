import { ThemeEnum } from "@/interfaces/enums/theme.enum"

export interface User {
  id: string | number
  username: string
  email: string
  roles: string[]
  theme?: ThemeEnum
}
