import * as React from "react"

type SidebarState = "expanded" | "collapsed"

type SidebarContext = {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)
  const isMobile = window.innerWidth < 768

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(prev => !prev) : setOpen(prev => !prev)
  }, [isMobile])

  const value = React.useMemo(
    () => ({
      state: open ? "expanded" as const : "collapsed" as const,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, openMobile, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex h-screen w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}