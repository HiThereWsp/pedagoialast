import { LucideIcon } from "lucide-react"

export type Action = {
  title: string
  route: string
  icon: LucideIcon
  isUtilityAction?: boolean
  isNew?: boolean
  maintenanceLabel?: string
}