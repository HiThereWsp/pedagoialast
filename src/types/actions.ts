export type ActionType = {
  title: string
  route: string
  icon: React.ComponentType<{ className?: string }>
  isUtilityAction?: boolean
}