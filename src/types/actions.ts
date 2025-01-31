import { LucideIcon } from "lucide-react"

export interface Action {
  title: string
  route: string
  icon: LucideIcon
  isUtilityAction?: boolean
}