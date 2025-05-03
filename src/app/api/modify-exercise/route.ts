import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { openai } from '@/lib/openai';
import { authOptions } from '@/lib/auth';
import { incrementApiUsage } from '@/lib/user-limits';
import { modifyExerciseSystemPrompt } from '@/lib/prompts/modify-exercise';

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Extraire les données de la requête
    const {
      formData,
      currentExercises,
      modificationInstructions,
      isDifferentiation
    } = await req.json();

    // Validation des données requises
    if (!formData || !currentExercises || !modificationInstructions) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Vérifier et incrémenter les limites API
    const userId = session.user.id;
    const incrementResult = await incrementApiUsage(userId);
    
    if (!incrementResult.success) {
      return NextResponse.json(
        { error: incrementResult.message || 'Limite API dépassée' },
        { status: 429 }
      );
    }

    // Construction du contexte pour l'IA
    let contextInput = "";

    // Pour un exercice standard
    if (!isDifferentiation) {
      contextInput = `
- Matière: ${formData.subject || "Non spécifié"}
- Niveau scolaire: ${formData.classLevel || "Non spécifié"}
- Nombre d'exercices: ${formData.numberOfExercises || "Non spécifié"}
- Questions par exercice: ${formData.questionsPerExercise || "Non spécifié"}
- Type d'exercice: ${formData.exerciseType || "Non spécifié"}
- Objectif: ${formData.objective || "Non spécifié"}
- Instructions supplémentaires: ${formData.additionalInstructions || "Aucune"}
- Besoins spécifiques: ${formData.specificNeeds || "Aucun"}
      `;
    } 
    // Pour un exercice différencié
    else {
      contextInput = `
- Matière: ${formData.subject || "Non spécifié"}
- Niveau scolaire: ${formData.classLevel || "Non spécifié"}
- Exercice original: Fourni
- Profil de l'élève: ${formData.studentProfile || "Non spécifié"}
- Difficultés d'apprentissage: ${formData.learningDifficulties || "Aucune"}
- Plan de leçon sélectionné: ${formData.selectedLessonPlan || "Non spécifié"}
- Défis: ${formData.challenges || "Aucun"}
- Instructions supplémentaires: ${formData.additionalInstructions || "Aucune"}
      `;
    }

    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: modifyExerciseSystemPrompt,
        },
        {
          role: 'user',
          content: `
### CONTEXTE
${contextInput}

### EXERCICE ACTUEL
${currentExercises}

### INSTRUCTIONS DE MODIFICATION
${modificationInstructions}
          `,
        },
      ],
      temperature: 0.7,
    });

    // Extraire la réponse
    const modifiedContent = completion.choices[0]?.message?.content || '';

    // Répondre avec le contenu modifié
    return NextResponse.json({ content: modifiedContent });
  } catch (error) {
    console.error('Erreur de modification d\'exercice:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'exercice' },
      { status: 500 }
    );
  }
} 