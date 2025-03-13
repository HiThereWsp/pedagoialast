
export function Footer() {
  return (
    <footer className="mt-8 text-center text-sm text-muted-foreground">
      <div className="space-x-4">
        <span>© 2024 PedagoIA</span>
        <a 
          href="/legal"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          Mentions légales
        </a>
      </div>
    </footer>
  )
}
