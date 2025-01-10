import type { FC } from "react"

export const Footer: FC = () => {
  return (
    <div className="mt-12 flex items-center gap-2">
      <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
      <p className="text-2xl font-semibold text-gray-800">PedagoIA</p>
    </div>
  )
}