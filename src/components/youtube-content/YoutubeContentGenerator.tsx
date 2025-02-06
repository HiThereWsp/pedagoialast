
import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Youtube, BookOpen, GraduationCap } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function YoutubeContentGenerator() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <Card className="p-6 bg-gradient-to-r from-violet-100 to-fuchsia-100 border-none shadow-premium">
        <div className="flex items-center gap-4 mb-6">
          <Youtube className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-800">Générateur de contenu YouTube</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">URL de la vidéo YouTube</Label>
            <Input 
              id="youtube-url" 
              placeholder="https://youtube.com/watch?v=..." 
              className="bg-white/80"
            />
          </div>

          <Tabs defaultValue="course" className="w-full">
            <TabsList className="w-full bg-white/50">
              <TabsTrigger value="course" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Cours
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                QCM
              </TabsTrigger>
            </TabsList>

            <TabsContent value="course" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Niveau scolaire</Label>
                  <Select>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primaire</SelectItem>
                      <SelectItem value="middle">Collège</SelectItem>
                      <SelectItem value="high">Lycée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Matière</Label>
                  <Select>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathématiques</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="history">Histoire</SelectItem>
                      <SelectItem value="science">Sciences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de questions</Label>
                  <Select>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Nombre de questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulté</Label>
                  <Select>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Niveau de difficulté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full bg-primary hover:bg-primary/90">
            Générer le contenu
          </Button>
        </div>
      </Card>
    </div>
  )
}
