import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useMutation, useQuery } from '@tanstack/react-query'
import { generateLessonPlan, getLessonPlans, LessonPlanData } from '@/lib/lesson-plan'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useSearchParams } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/date-range-picker"

interface HistoryItem {
  id: string
  title: string
  content: string
  subject: string
  created_at: string
  type: string
  tags: {
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }[]
}

const LessonPlanCreator = () => {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState<number>(60)
  const [learningObjectives, setLearningObjectives] = useState([''])
  const [materials, setMaterials] = useState([''])
  const [activities, setActivities] = useState([''])
  const [assessment, setAssessment] = useState('')
  const [differentiation, setDifferentiation] = useState('')
  const [notes, setNotes] = useState('')
  const [searchParams] = useSearchParams()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: searchParams.get("from") ? new Date(searchParams.get("from") as string) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to") as string) : undefined,
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [search, setSearch] = useState<string>('')
  const { user } = useAuth()

  const { data, isLoading: isLoadingHistory, refetch } = useQuery({
    queryKey: ['lessonPlans', user?.id],
    queryFn: () => getLessonPlans(user?.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    refetch()
  }, [user?.id, refetch])

  const { mutate, isLoading: isGenerating } = useMutation({
    mutationFn: generateLessonPlan,
    onSuccess: () => {
      toast({
        title: 'Plan de leçon créé !',
        description: 'Votre plan de leçon a été créé avec succès.',
      })
      refetch()
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur lors de la création du plan de leçon.',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  const handleGenerateLessonPlan = async () => {
    if (!user) {
      toast({
        title: 'Vous devez être connecté pour générer un plan de leçon.',
        variant: 'destructive',
      })
      return
    }

    const lessonPlanData: LessonPlanData = {
      userId: user.id,
      title,
      subject,
      level,
      topic,
      duration,
      learningObjectives,
      materials,
      activities,
      assessment,
      differentiation,
      notes,
      type: 'lesson-plan',
      tags: [
        {
          label: 'Pédagogie',
          color: 'text-sky-500',
          backgroundColor: 'bg-sky-500/10',
          borderColor: 'border-sky-500/30',
        },
      ],
    }

    mutate(lessonPlanData)
  }

  const handleAddObjective = () => {
    setLearningObjectives([...learningObjectives, ''])
  }

  const handleObjectiveChange = (index: number, value: string) => {
    const updatedObjectives = [...learningObjectives]
    updatedObjectives[index] = value
    setLearningObjectives(updatedObjectives)
  }

  const handleRemoveObjective = (index: number) => {
    const updatedObjectives = [...learningObjectives]
    updatedObjectives.splice(index, 1)
    setLearningObjectives(updatedObjectives)
  }

  const handleAddMaterial = () => {
    setMaterials([...materials, ''])
  }

  const handleMaterialChange = (index: number, value: string) => {
    const updatedMaterials = [...materials]
    updatedMaterials[index] = value
    setMaterials(updatedMaterials)
  }

  const handleRemoveMaterial = (index: number) => {
    const updatedMaterials = [...materials]
    updatedMaterials.splice(index, 1)
    setMaterials(updatedMaterials)
  }

  const handleAddActivity = () => {
    setActivities([...activities, ''])
  }

  const handleActivityChange = (index: number, value: string) => {
    const updatedActivities = [...activities]
    updatedActivities[index] = value
    setActivities(updatedActivities)
  }

  const handleRemoveActivity = (index: number) => {
    const updatedActivities = [...activities]
    updatedActivities.splice(index, 1)
    setActivities(updatedActivities)
  }

  const filteredItems = data?.filter((item) => {
    const searchTerm = search.toLowerCase()
    const itemTitle = item.title.toLowerCase()
    const itemSubject = item.subject.toLowerCase()

    const dateMatches = !date?.from || !date?.to ||
      (new Date(item.created_at) >= date.from && new Date(item.created_at) <= date.to)

    const tagMatches = selectedTags.length === 0 ||
      item.tags.some(tag => selectedTags.includes(tag.label))

    const searchMatches = searchTerm === '' ||
      itemTitle.includes(searchTerm) ||
      itemSubject.includes(searchTerm)

    return dateMatches && tagMatches && searchMatches
  })

  const historyItems: HistoryItem[] = data?.map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    subject: item.subject,
    created_at: item.created_at,
    type: 'lesson-plan',
    tags: item.tags
  })) || []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Créateur de plan de leçon</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lesson Plan Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Informations sur le plan de leçon</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject">Matière</Label>
                <Input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="level">Niveau</Label>
                <Input
                  type="text"
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="topic">Sujet</Label>
                <Input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Durée (en minutes)</Label>
                <Slider
                  id="duration"
                  defaultValue={[duration]}
                  max={120}
                  step={15}
                  onValueChange={(value) => setDuration(value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Durée sélectionnée: {duration} minutes
                </p>
              </div>

              <div>
                <Label>Objectifs d'apprentissage</Label>
                {learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      type="text"
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveObjective(index)}
                    >
                      <span className="sr-only">Supprimer</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddObjective}>
                  Ajouter un objectif
                </Button>
              </div>

              <div>
                <Label>Matériels</Label>
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      type="text"
                      value={material}
                      onChange={(e) => handleMaterialChange(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <span className="sr-only">Supprimer</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddMaterial}>
                  Ajouter un matériel
                </Button>
              </div>

              <div>
                <Label>Activités</Label>
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      type="text"
                      value={activity}
                      onChange={(e) => handleActivityChange(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveActivity(index)}
                    >
                      <span className="sr-only">Supprimer</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddActivity}>
                  Ajouter une activité
                </Button>
              </div>

              <div>
                <Label htmlFor="assessment">Évaluation</Label>
                <Textarea
                  id="assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="differentiation">Différenciation</Label>
                <Textarea
                  id="differentiation"
                  value={differentiation}
                  onChange={(e) => setDifferentiation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateLessonPlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    Génération...
                    <svg
                      className="animate-spin h-5 w-5 ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </>
                ) : (
                  'Générer un plan de leçon'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lesson Plan History */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Historique des plans de leçon</h2>
          </CardHeader>
          <CardContent className="pl-2 pr-2">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Rechercher un plan de leçon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !date?.from && !date.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <DateRangePicker date={date} setDate={setDate} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="mb-4">
              <Label>Filtrer par tags :</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {
                  [
                    {
                      label: 'Pédagogie',
                      color: 'text-sky-500',
                      backgroundColor: 'bg-sky-500/10',
                      borderColor: 'border-sky-500/30',
                    },
                    {
                      label: 'IA',
                      color: 'text-pink-500',
                      backgroundColor: 'bg-pink-500/10',
                      borderColor: 'border-pink-500/30',
                    },
                    {
                      label: 'Mathématiques',
                      color: 'text-orange-500',
                      backgroundColor: 'bg-orange-500/10',
                      borderColor: 'border-orange-500/30',
                    },
                    {
                      label: 'Français',
                      color: 'text-green-500',
                      backgroundColor: 'bg-green-500/10',
                      borderColor: 'border-green-500/30',
                    },
                  ].map((tag) => (
                    <div key={tag.label} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.label}
                        checked={selectedTags.includes(tag.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag.label])
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag.label))
                          }
                        }}
                      />
                      <Label htmlFor={tag.label} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                        {tag.label}
                      </Label>
                    </div>
                  ))
                }
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="flex flex-col space-y-4">
                <Skeleton className="w-[100px] h-[20px]" />
                <Skeleton className="h-[150px]" />
                <Skeleton className="w-[100px] h-[20px]" />
                <Skeleton className="h-[150px]" />
              </div>
            ) : filteredItems && filteredItems.length > 0 ? (
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="p-4">
                  {filteredItems.map((item) => (
                    <Accordion type="single" collapsible key={item.id}>
                      <AccordionItem value={item.id}>
                        <AccordionTrigger>
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">
                            {item.subject} - {item.created_at}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.content}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag) => (
                              <Badge
                                key={tag.label}
                                className="text-xs"
                                style={{
                                  color: tag.color,
                                  backgroundColor: tag.backgroundColor,
                                  borderColor: tag.borderColor,
                                }}
                              >
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p>Aucun plan de leçon trouvé.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LessonPlanCreator
