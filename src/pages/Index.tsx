import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, UserCircle, Zap } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1">
          <nav className="border-b">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-xl font-semibold">Assistant Pédagogique IA</h1>
              <button className="p-2">
                <UserCircle className="h-6 w-6" />
              </button>
            </div>
          </nav>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 rounded-lg bg-emerald-50 p-6">
              <h2 className="mb-2 text-2xl font-semibold">
                Bonjour, je suis Élia, votre assistante pédagogique IA
              </h2>
              <p className="text-gray-600">
                Je peux vous aider sur tous les aspects de votre métier. Posez simplement votre question !
              </p>
            </div>

            <div className="mb-8 rounded-lg bg-emerald-50 p-6">
              <div className="mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Actions rapides</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  "Créer un exercice",
                  "Générer une séquence",
                  "Rechercher dans le programme scolaire officiel",
                  "Créer une progression",
                  "Adapter un exercice",
                  "Planifier une séance",
                  "Créer un plan de différenciation",
                ].map((action) => (
                  <div
                    key={action}
                    className="cursor-pointer rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <span className="text-gray-900">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
            <div className="mx-auto max-w-7xl">
              <div className="flex gap-2">
                <Input placeholder="Comment puis-je vous aider ?" className="flex-1" />
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index