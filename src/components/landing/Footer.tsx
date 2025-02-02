const Footer = () => {
  return (
    <footer className="py-6 mt-12 border-t">
      <div className="container flex justify-center gap-4">
        <a 
          href="mailto:bonjour@pedagoia.fr"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Nous contacter
        </a>
        <a 
          href="/legal"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Mentions légales
        </a>
      </div>
    </footer>
  )
}

export default Footer