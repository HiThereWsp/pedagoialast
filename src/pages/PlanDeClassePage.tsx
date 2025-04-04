import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Folder, Trash2, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  name: string;
  color: string;
}

interface SeparationRule {
  student1: string;
  student2: string;
}

interface Position {
  row: number;
  col: number;
}

interface DraggedStudent {
  id: string;
  name: string;
  currentPosition: { row: number; col: number; };
}

interface SavedSeatingPlan {
  id: string;
  name: string;
  rows: number;
  columns: number;
  students: Student[];
  separationRules: SeparationRule[];
  seatingArrangement: (Student | null)[][];
  createdAt: string;
}

const PlanDeClassePage: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [separationRules, setSeparationRules] = useState<SeparationRule[]>([]);
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(4);
  const [selectedStudent1, setSelectedStudent1] = useState('');
  const [selectedStudent2, setSelectedStudent2] = useState('');
  const [seatingPlan, setSeatingPlan] = useState<(Student | null)[][]>([]);
  const [spaceType, setSpaceType] = useState<'empty' | 'none'>('empty');
  const [draggedStudent, setDraggedStudent] = useState<DraggedStudent | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedSeatingPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  
  // Fonction pour générer des couleurs pastel aléatoires
  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  };
  
  // Ajouter un élève avec une couleur aléatoire
  const addStudent = () => {
    if (newStudentName.trim()) {
      const updatedStudents = [
        ...students, 
        { 
          id: Date.now().toString(), 
          name: newStudentName.trim(),
          color: generatePastelColor()
        }
      ];
      setStudents(updatedStudents);
      saveStudentsLocally(updatedStudents);
      setNewStudentName('');
    }
  };

  // Supprimer un élève
  const removeStudent = (studentId: string) => {
    const updatedStudents = students.filter(student => student.id !== studentId);
    setStudents(updatedStudents);
    saveStudentsLocally(updatedStudents);
    
    // Supprimer aussi les règles de séparation associées
    setSeparationRules(separationRules.filter(rule => 
      rule.student1 !== studentId && rule.student2 !== studentId
    ));
  };

  // Ajouter une règle de séparation
  const addSeparationRule = () => {
    if (selectedStudent1 && selectedStudent2 && selectedStudent1 !== selectedStudent2) {
      setSeparationRules([...separationRules, {
        student1: selectedStudent1,
        student2: selectedStudent2
      }]);
      setSelectedStudent1('');
      setSelectedStudent2('');
    }
  };

  // Supprimer une règle de séparation
  const removeSeparationRule = (index: number) => {
    setSeparationRules(separationRules.filter((_, i) => i !== index));
  };

  // Vérifier si deux positions sont adjacentes
  const areAdjacent = (pos1: Position, pos2: Position): boolean => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff <= 1 && colDiff <= 1);
  };

  // Vérifier si le placement est valide selon les règles de séparation
  const isValidPlacement = (
    plan: (Student | null)[][],
    studentPositions: Map<string, Position>,
    newStudent: Student,
    row: number,
    col: number
  ): boolean => {
    // Vérifier les règles de séparation
    for (const rule of separationRules) {
      if (rule.student1 === newStudent.id) {
        const pos2 = studentPositions.get(rule.student2);
        if (pos2 && areAdjacent({ row, col }, pos2)) {
          return false;
        }
      }
      if (rule.student2 === newStudent.id) {
        const pos1 = studentPositions.get(rule.student1);
        if (pos1 && areAdjacent({ row, col }, pos1)) {
          return false;
        }
      }
    }
    return true;
  };

  // Modifier la fonction de génération du plan pour respecter exactement le nombre de rangées
  const generateSeatingPlan = () => {
    const maxAttempts = 100;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
      try {
        // Créer un plan vide avec EXACTEMENT le nombre de rangées et colonnes spécifié
        const plan: (Student | null)[][] = Array(rows).fill(null)
          .map(() => Array(columns).fill(null));
        
        // Copier et mélanger la liste des élèves
        const shuffledStudents = [...students]
          .sort(() => Math.random() - 0.5);
        
        // Créer la liste des positions disponibles
        const availablePositions: Position[] = [];
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            availablePositions.push({ row: i, col: j });
          }
        }

        // Mélanger les positions disponibles
        const shuffledPositions = availablePositions
          .sort(() => Math.random() - 0.5);
        
        // Placer chaque élève
        for (let i = 0; i < shuffledStudents.length && i < shuffledPositions.length; i++) {
          const student = shuffledStudents[i];
          const position = shuffledPositions[i];
          plan[position.row][position.col] = student;
        }
        
        // Si on arrive ici, on a trouvé une solution valide
        console.log(`Plan généré avec ${rows} rangées et ${columns} colonnes`);
        setSeatingPlan(plan);
        return;
        
      } catch (error) {
        attempt++;
        console.log(`Tentative ${attempt} échouée, nouvel essai...`);
      }
    }
    
    alert("Impossible de générer un plan respectant toutes les contraintes.");
  };

  // Ajouter une validation pour les entrées
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) { // Limite arbitraire de 10 rangées
      setRows(value);
      
      // Ne pas effacer le plan existant, juste le redimensionner
      if (seatingPlan.length !== value) {
        const newPlan: (Student | null)[][] = Array(value)
          .fill(null)
          .map((_, rowIndex) => {
            // Conserver les données existantes si possible
            if (rowIndex < seatingPlan.length) {
              return [...seatingPlan[rowIndex]];
            }
            return Array(columns).fill(null);
          });
        setSeatingPlan(newPlan);
      }
    }
  };

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) { // Limite arbitraire de 10 colonnes
      setColumns(value);
      
      // Ne pas effacer le plan existant, juste le redimensionner
      if (seatingPlan.length > 0 && seatingPlan[0]?.length !== value) {
        const newPlan: (Student | null)[][] = seatingPlan.map(row => {
          const newRow = [...row];
          // Si on a besoin de plus de colonnes, ajouter des cases vides
          if (newRow.length < value) {
            while (newRow.length < value) {
              newRow.push(null);
            }
          } 
          // Si on a besoin de moins de colonnes, tronquer
          else if (newRow.length > value) {
            return newRow.slice(0, value);
          }
          return newRow;
        });
        setSeatingPlan(newPlan);
      }
    }
  };

  // Gérer le début du drag
  const handleDragStart = (e: React.DragEvent, row: number, col: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
  };

  // Gérer le drop
  const handleDrop = (e: React.DragEvent, toRow: number, toCol: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const fromRow = data.row;
    const fromCol = data.col;

    // Créer une nouvelle copie du plan
    const newPlan = seatingPlan.map(row => [...row]);
    
    // Échanger les positions
    const temp = newPlan[fromRow][fromCol];
    newPlan[fromRow][fromCol] = newPlan[toRow][toCol];
    newPlan[toRow][toCol] = temp;

    setSeatingPlan(newPlan);
  };

  // Permettre le drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Fonction de sauvegarde du plan de classe
  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        variant: "destructive",
        description: "Veuillez donner un nom à votre plan de classe"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Simulons la sauvegarde dans la base de données
      const newPlan: SavedSeatingPlan = {
        id: Date.now().toString(), // ID unique simulé
        name: planName.trim(),
        rows,
        columns,
        students,
        separationRules,
        seatingArrangement: seatingPlan,
        createdAt: new Date().toISOString()
      };
      
      // Ajouter le nouveau plan à la liste
      setSavedPlans([newPlan, ...savedPlans]);
      
      toast({
        description: "Plan de classe sauvegardé avec succès"
      });
      setShowSaveDialog(false);
      setPlanName("");
      
      // Basculer vers l'onglet des plans sauvegardés pour montrer le résultat
      setActiveTab("saved");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la sauvegarde"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Modifier le composant SeatCell pour un meilleur équilibre de taille
  const SeatCell: React.FC<{
    student: Student | null;
    row: number;
    col: number;
  }> = ({ student, row, col }) => {
    const isEmpty = !student && spaceType === 'empty';

    return (
      <div 
        draggable={!!student}
        onDragStart={(e) => handleDragStart(e, row, col)}
        onDrop={(e) => handleDrop(e, row, col)}
        onDragOver={handleDragOver}
        className={`
          aspect-square rounded-lg p-2 flex items-center justify-center
          ${isEmpty ? 'bg-gray-100 border-2 border-dashed border-gray-200' : 
            student ? 'shadow-sm border cursor-move' : 'bg-transparent'}
          transition-all duration-200 hover:shadow-md
          w-full
        `}
        style={student ? { backgroundColor: student.color, borderColor: student.color } : {}}
      >
        {student ? (
          <div className="text-center w-full">
            <span className="font-medium text-gray-900 text-base">{student.name}</span>
          </div>
        ) : (
          isEmpty && <div className="text-gray-400 text-sm">Vide</div>
        )}
      </div>
    );
  };

  const loadSavedPlans = async () => {
    setIsLoadingPlans(true);
    try {
      // Ici, vous feriez appel à votre service seatingPlansService.getAll()
      // Pour l'instant, simulons des données
      const mockSavedPlans: SavedSeatingPlan[] = [
        {
          id: "1",
          name: "Plan de classe CM1",
          rows: 3,
          columns: 4,
          students: [
            { id: "1", name: "Alice", color: "hsl(120, 70%, 85%)" },
            { id: "2", name: "Bob", color: "hsl(240, 70%, 85%)" },
            { id: "3", name: "Charlie", color: "hsl(60, 70%, 85%)" }
          ],
          separationRules: [{ student1: "1", student2: "2" }],
          seatingArrangement: [[null, null, null, null], [null, null, null, null], [null, null, null, null]],
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          name: "Plan de classe CE2",
          rows: 4,
          columns: 5,
          students: [
            { id: "4", name: "David", color: "hsl(180, 70%, 85%)" },
            { id: "5", name: "Emma", color: "hsl(300, 70%, 85%)" }
          ],
          separationRules: [],
          seatingArrangement: [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
          createdAt: new Date().toISOString()
        }
      ];
      
      setSavedPlans(mockSavedPlans);
    } catch (error) {
      console.error("Erreur lors du chargement des plans sauvegardés:", error);
      toast({
        variant: "destructive",
        description: "Impossible de charger les plans sauvegardés"
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const loadSeatingPlan = (plan: SavedSeatingPlan) => {
    // Copier toutes les valeurs pour éviter de modifier l'original
    setRows(plan.rows);
    setColumns(plan.columns);
    
    // Copie profonde des étudiants pour éviter les références partagées
    const studentsCopy = JSON.parse(JSON.stringify(plan.students));
    setStudents(studentsCopy);
    
    // Copie profonde des règles de séparation
    const rulesCopy = JSON.parse(JSON.stringify(plan.separationRules));
    setSeparationRules(rulesCopy);
    
    // Copie profonde du plan d'arrangement
    const seatingPlanCopy = JSON.parse(JSON.stringify(plan.seatingArrangement));
    setSeatingPlan(seatingPlanCopy);
    
    // Revenir à l'onglet éditeur
    setActiveTab("editor");
    
    toast({
      description: `Plan "${plan.name}" chargé avec succès`
    });
  };

  const deleteSavedPlan = async (id: string) => {
    try {
      // Ici, vous feriez appel à votre service seatingPlansService.delete(id)
      // Pour l'instant, simulons la suppression
      setSavedPlans(savedPlans.filter(plan => plan.id !== id));
      
      toast({
        description: "Plan supprimé avec succès"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Impossible de supprimer le plan"
      });
    }
  };

  // Ajouter une fonction pour enregistrer les élèves localement
  const saveStudentsLocally = (updatedStudents: Student[]) => {
    try {
      localStorage.setItem('savedStudents', JSON.stringify(updatedStudents));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des élèves:", error);
    }
  };

  useEffect(() => {
    loadSavedPlans();
    
    // Charger les étudiants sauvegardés localement
    try {
      const savedStudents = localStorage.getItem('savedStudents');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
    }
  }, []);

  return (
    <DashboardWrapper>
      <Helmet>
        <title>Plan de classe | PedagoIA</title>
        <meta name="description" content="Créez et gérez vos plans de classe avec PedagoIA" />
      </Helmet>

      <div className="container mx-auto py-4 px-4">
        {/* En-tête */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-balance max-w-lg mx-auto">
            <span className="bg-gradient-to-r from-[#FFE29F] to-[#FF719A] bg-clip-text text-transparent">
              Plan de classe
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm">
            Organisez votre classe comme vous le souhaitez et générez automatiquement un plan optimal
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="editor">Éditeur</TabsTrigger>
              <TabsTrigger value="saved">Plans sauvegardés</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor">
              {/* Configuration de la salle */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rangées (1-10)
                    </label>
                    <Input
                      type="number"
                      value={rows}
                      onChange={handleRowsChange}
                      className="w-full"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colonnes (1-10)
                    </label>
                    <Input
                      type="number"
                      value={columns}
                      onChange={handleColumnsChange}
                      className="w-full"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Espaces vides</label>
                    <select
                      value={spaceType}
                      onChange={(e) => setSpaceType(e.target.value as 'empty' | 'none')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="empty">Afficher les tables vides</option>
                      <option value="none">Masquer les espaces vides</option>
                    </select>
                  </div>
                </div>
                
                {/* Plan de classe */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div 
                    className="grid gap-2" 
                    style={{ 
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                    }}
                  >
                    {Array(rows).fill(null).map((_, rowIndex) => (
                      Array(columns).fill(null).map((_, colIndex) => (
                        <SeatCell
                          key={`${rowIndex}-${colIndex}`}
                          student={seatingPlan[rowIndex]?.[colIndex] || null}
                          row={rowIndex}
                          col={colIndex}
                        />
                      ))
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    onClick={() => setShowSaveDialog(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Sauvegarder le plan
                  </Button>
                  <Button
                    onClick={generateSeatingPlan}
                    className="bg-gradient-to-r from-[#FFE29F] to-[#FF719A] text-black hover:from-[#FFD166] hover:to-[#FF5E8F] flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Générer un nouveau plan
                  </Button>
                </div>
              </div>

              {/* Configuration en deux colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Colonne de gauche */}
                <div className="space-y-3">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Liste des élèves</h2>
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Nom de l'élève"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                      />
                      <Button
                        onClick={addStudent}
                        className="bg-gradient-to-r from-[#FFE29F] to-[#FF719A] text-black hover:from-[#FFD166] hover:to-[#FF5E8F] px-4"
                      >
                        +
                      </Button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {students.map(student => (
                        <div key={student.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <span>{student.name}</span>
                          <button
                            onClick={() => removeStudent(student.id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Supprimer l'élève"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonne de droite */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Élèves à séparer</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={selectedStudent1}
                        onChange={(e) => setSelectedStudent1(e.target.value)}
                        className="p-2 border rounded-md"
                      >
                        <option value="">1er élève</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedStudent2}
                        onChange={(e) => setSelectedStudent2(e.target.value)}
                        className="p-2 border rounded-md"
                      >
                        <option value="">2e élève</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={addSeparationRule}
                      className="w-full bg-gradient-to-r from-[#FFE29F] to-[#FF719A] text-black hover:from-[#FFD166] hover:to-[#FF5E8F]"
                    >
                      Ajouter la séparation
                    </Button>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {separationRules.map((rule, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <span>
                            {students.find(s => s.id === rule.student1)?.name} + {students.find(s => s.id === rule.student2)?.name}
                          </span>
                          <button
                            onClick={() => removeSeparationRule(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="saved">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Plans de classe sauvegardés</h2>
                
                {isLoadingPlans ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : savedPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Folder className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                    <p>Aucun plan de classe sauvegardé</p>
                    <Button 
                      onClick={() => setActiveTab("editor")} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Créer un nouveau plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedPlans.map(plan => (
                      <div 
                        key={plan.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-all flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium text-lg">{plan.name}</h3>
                          <p className="text-sm text-gray-500">
                            {plan.rows} rangées × {plan.columns} colonnes • 
                            {plan.students.length} élèves •
                            Créé le {new Date(plan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => loadSeatingPlan(plan)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Button>
                          <Button
                            onClick={() => deleteSavedPlan(plan.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogue de sauvegarde */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le plan de classe</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Donnez un nom à votre plan de classe"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-gradient-to-r from-[#FFE29F] to-[#FF719A] text-black hover:from-[#FFD166] hover:to-[#FF5E8F]"
            >
              {isSaving ? "Sauvegarde en cours..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardWrapper>
  );
};

export default PlanDeClassePage; 