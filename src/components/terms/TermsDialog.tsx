import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-primary hover:underline">
        conditions d'utilisation
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            Conditions Générales d'Utilisation - PedagoIA
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">1. Service</h3>
              <p>PedagoIA est un assistant pédagogique basé sur l'intelligence artificielle, actuellement proposé en version beta.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">2. Tarification</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Le service est actuellement gratuit pendant la phase beta</li>
                <li>Vous serez informé(e) 30 jours avant toute modification tarifaire</li>
                <li>Aucun engagement de durée n'est requis</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">3. Protection de vos données</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Vos données sont hébergées en Europe</li>
                <li>Nous respectons strictement le RGPD</li>
                <li>Vos données pédagogiques sont chiffrées</li>
                <li>Nous ne partageons pas vos données avec des tiers</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">4. Données collectées</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Données d'utilisation anonymisées pour améliorer le service</li>
                <li>Informations de compte (email, prénom)</li>
                <li>Contenus générés via l'assistant</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">5. Vos droits</h3>
              <p className="mb-2">Vous pouvez à tout moment :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Accéder à vos données</li>
                <li>Les modifier ou les supprimer</li>
                <li>Exporter vos contenus</li>
                <li>Supprimer votre compte</li>
              </ul>
              <p className="mt-2">Pour toute demande : bonjour@pedagoia.fr</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">6. Nos engagements</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Support réactif</li>
                <li>Transparence sur les évolutions du service</li>
                <li>Protection de vos données pédagogiques</li>
                <li>Information préalable pour tout changement important</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">7. Résiliation</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Résiliation possible à tout moment</li>
                <li>Suppression des données sur demande</li>
                <li>Export des contenus disponible</li>
              </ul>
            </section>

            <footer className="mt-8 pt-4 border-t text-sm text-muted-foreground">
              <p>Dernière mise à jour : 19/12/2024</p>
              <p className="mt-2 italic">Pour toute question ou demande : bonjour@pedagoia.fr</p>
            </footer>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}