import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCircle, Zap, Send } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Assistant Pédagogique IA</h1>
            <button className="p-2">
              <UserCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-emerald-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Bonjour, je suis Élia, votre assistante pédagogique IA
          </h2>
          <p className="text-gray-600">
            Je peux vous aider sur tous les aspects de votre métier. Posez simplement votre question !
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-emerald-50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Actions rapides</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Créer un exercice</span>
            </Card>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Générer une séquence</span>
            </Card>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Rechercher dans le programme scolaire officiel</span>
            </Card>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Créer une progression</span>
            </Card>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Adapter un exercice</span>
            </Card>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Planifier une séance</span>
            </Card>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-gray-900">Créer un plan de différenciation</span>
            </Card>
          </div>
        </div>

        {/* Chat Input */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2">
              <Input 
                placeholder="Comment puis-je vous aider ?" 
                className="flex-1"
              />
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;