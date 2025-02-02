import { Link } from "react-router-dom"

interface LegalCardProps {
  to: string
  title: string
}

export const LegalCard = ({ to, title }: LegalCardProps) => {
  return (
    <div className="p-6 border rounded-lg hover:border-primary transition-colors">
      <Link to={to} className="no-underline">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </Link>
    </div>
  )
}