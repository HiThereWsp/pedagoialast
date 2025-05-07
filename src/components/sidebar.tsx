import type React from "react"
import { useState } from "react"
import Image from "next/image"
import {
  BookOpen,
  Wand2,
  FileText,
  LayoutGrid,
  BookmarkIcon,
  MessageCircleQuestion,
  ImageIcon,
  ChevronRight,
} from "lucide-react"

export function Sidebar() {
  const [activeItem, setActiveItem] = useState<string | null>(null)

  return (
    <div className="w-60 h-full flex flex-col border-r border-gray-200 bg-white text-gray-800 shadow-sm">
      <div className="p-5 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="PedagoIA Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-pink-500 text-transparent bg-clip-text">
            peda<span className="text-gray-800">GO</span>IA
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-2 pl-2">
            OUTILS PÉDAGOGIQUES
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs">
              i
            </span>
          </h2>
          <nav className="space-y-1">
            <NavItem
              icon={<Wand2 size={18} />}
              label="Générateur de séquences"
              isActive={activeItem === "sequences"}
              onClick={() => setActiveItem("sequences")}
            />
            <NavItem
              icon={<FileText size={18} />}
              label="Générateur d'exercices"
              isActive={activeItem === "exercices"}
              onClick={() => setActiveItem("exercices")}
            />
            <NavItem
              icon={<BookOpen size={18} />}
              label="Assistant administratif"
              isActive={activeItem === "admin"}
              onClick={() => setActiveItem("admin")}
            />
            <NavItem
              icon={<ImageIcon size={18} />}
              label="Générateur d'images"
              isActive={activeItem === "images"}
              onClick={() => setActiveItem("images")}
            />
            <NavItem
              icon={<LayoutGrid size={18} />}
              label="Plan de classe"
              badge="Nouveau"
              isActive={activeItem === "plan"}
              onClick={() => setActiveItem("plan")}
            />
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <span className="text-sm font-medium">M</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">Maîtresse</span>
            <span className="text-xs text-gray-500 block">Compte premium</span>
          </div>
        </div>

        <nav className="space-y-1 mt-3">
          <NavItem
            icon={<BookmarkIcon size={18} />}
            label="Mes ressources"
            isActive={activeItem === "ressources"}
            onClick={() => setActiveItem("ressources")}
          />
          <NavItem
            icon={<MessageCircleQuestion size={18} />}
            label="Demander des fonctionnalités"
            isActive={activeItem === "fonctionnalites"}
            onClick={() => setActiveItem("fonctionnalites")}
          />
        </nav>
      </div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  badge,
  isActive = false,
  onClick,
}: {
  icon?: React.ReactNode
  label: string
  badge?: string
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
        isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className={`${isActive ? "text-blue-600" : "text-gray-500"}`}>{icon}</span>
        <span className={`text-sm ${isActive ? "font-medium" : ""}`}>{label}</span>
      </div>
      {badge ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{badge}</span>
      ) : isActive ? (
        <ChevronRight size={16} className="text-blue-600" />
      ) : null}
    </div>
  )
}
