import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="mt-8 text-center text-sm text-muted-foreground">
      <div className="space-x-4">
        <Link to="/contact" className="hover:text-primary transition-colors">
          Nous contacter
        </Link>
        <span>•</span>
        <span>© 2024 PedagoIA</span>
      </div>
    </footer>
  )
}