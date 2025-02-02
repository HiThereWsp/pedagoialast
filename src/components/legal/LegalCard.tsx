import { Link } from "react-router-dom"

interface LegalCardProps {
  to: string
  title: string
  description: string
}

export const LegalCard = ({ to, title, description }: LegalCardProps) => {
  return (
    <div className="p-6 border rounded-lg hover:border-primary transition-colors">
      <Link to={to} className="no-underline">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </Link>
    </div>
  )
}