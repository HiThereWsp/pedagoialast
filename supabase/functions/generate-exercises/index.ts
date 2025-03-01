
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!MISTRAL_API_KEY) {
    throw new Error('Clé API Mistral non configurée');
  }

  try {
    const params = await req.json();
    console.log('📝 Paramètres reçus:', JSON.stringify(params, null, 2));

    const systemPrompt = `Tu es un assistant pédagogique expert qui crée des exercices adaptés au système éducatif français.

RÈGLES DE FORMATAGE STRICTES:
1. JAMAIS de tableaux HTML ou Markdown. Utilise des listes numérotées et des puces à la place.
2. Commence directement avec les exercices, sans titre ni introduction.
3. Génère TOUJOURS deux sections distinctes avec EXACTEMENT ces marqueurs :

FICHE ÉLÈVE
[Exercices uniquement, sans titre ni préambule. PAS de mention de "Titre de la séquence" ou d'objectifs.]

FICHE CORRECTION
[Correction DÉTAILLÉE et COMPLÈTE de chaque exercice avec explications développées et pédagogiques.]

4. NE JAMAIS ajouter de texte avant "FICHE ÉLÈVE" ni entre les sections.
5. Utilise des formats suivants pour structurer ton contenu:
   - Exercice 1: (description)
   - Question 1.a: (question)
   - Liste de points: utilise des puces (-)
   - Énumération: utilise des nombres (1., 2., 3.)
6. JAMAIS de balises HTML, de colonnes ou de mise en page complexe.
7. Chaque exercice doit avoir sa correction correspondante dans la FICHE CORRECTION.
8. La FICHE CORRECTION doit être DÉTAILLÉE avec des explications pédagogiques.`;

    const userPrompt = isDifferentiationRequest(params) 
      ? buildDifferentiationPrompt(params) 
      : buildStandardPrompt(params);

    console.log('📤 Envoi du prompt à Mistral AI');

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur de l\'API Mistral:', error);
      throw new Error(`Erreur API Mistral: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Génération réussie, vérification des sections...');
    
    let result = data.choices[0].message.content;

    // Post-traitement pour supprimer tout texte avant "FICHE ÉLÈVE"
    const studentMarker = "FICHE ÉLÈVE";
    const correctionMarker = "FICHE CORRECTION";
    
    const studentIndex = result.indexOf(studentMarker);
    const correctionIndex = result.indexOf(correctionMarker);
    
    if (studentIndex === -1 || correctionIndex === -1) {
      console.error(`❌ Sections manquantes. studentIndex: ${studentIndex}, correctionIndex: ${correctionIndex}`);
      
      // Reformater la réponse si les sections sont manquantes
      let reformattedResult = "";
      
      if (studentIndex === -1 && correctionIndex === -1) {
        // Aucun marqueur trouvé, considérer tout comme fiche élève et ajouter une correction générique
        reformattedResult = `FICHE ÉLÈVE\n\n${result}\n\nFICHE CORRECTION\n\nConsulte ton enseignant pour la correction détaillée de ces exercices.`;
      } else if (studentIndex === -1) {
        // Seulement la correction existe
        reformattedResult = `FICHE ÉLÈVE\n\nExercices à réaliser selon les consignes.\n\n${result}`;
      } else if (correctionIndex === -1) {
        // Seulement la fiche élève existe
        reformattedResult = `${result}\n\nFICHE CORRECTION\n\nConsulte ton enseignant pour la correction détaillée de ces exercices.`;
      }
      
      result = reformattedResult;
      console.log('⚠️ Réponse reformatée pour inclure les sections manquantes');
    } else if (studentIndex > 0) {
      // Supprimer tout texte avant le premier marqueur
      result = result.substring(studentIndex);
      console.log('🔄 Texte avant FICHE ÉLÈVE supprimé');
    }

    // Vérifier si des tableaux sont présents et les convertir en listes
    if (result.includes('|') && (result.includes('---') || result.includes('+-'))) {
      console.log('⚠️ Tableaux détectés, tentative de conversion en listes...');
      result = convertTableToList(result);
    }

    console.log('✅ Génération finale prête à être envoyée');
    
    return new Response(
      JSON.stringify({ exercises: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fonction utilitaire pour détecter si la demande concerne une différenciation
function isDifferentiationRequest(params: any): boolean {
  return params.isDifferentiation === true || 
         (params.originalExercise && params.studentProfile);
}

// Fonction pour construire un prompt de différenciation
function buildDifferentiationPrompt(params: any): string {
  return `Adapte cet exercice de ${params.subject} (niveau ${params.classLevel}) pour un élève avec le profil suivant:

EXERCICE ORIGINAL:
${params.originalExercise}

PROFIL DE L'ÉLÈVE:
${params.studentProfile}
${params.learningDifficulties ? `Difficultés d'apprentissage: ${params.learningDifficulties}` : ''}
${params.challenges ? `Défis spécifiques: ${params.challenges}` : ''}
${params.additionalInstructions ? `Instructions supplémentaires: ${params.additionalInstructions}` : ''}

DIRECTIVES:
- Adapte la difficulté et la clarté sans changer l'objectif pédagogique fondamental
- Simplifie ou reformule les consignes si nécessaire
- Structure clairement les étapes de résolution
- Ajoute des indices ou des exemples si pertinent
- NE JAMAIS utiliser de tableaux HTML ou Markdown
- Fournis une correction détaillée avec explications pédagogiques adaptées au profil de l'élève

RAPPEL: Génère directement les deux sections "FICHE ÉLÈVE" suivie de "FICHE CORRECTION", sans introduction ni titre supplémentaire.`;
}

// Fonction pour construire un prompt standard
function buildStandardPrompt(params: any): string {
  return `Crée des exercices de ${params.subject} pour une classe de ${params.classLevel}.
Objectif principal: ${params.objective}
${params.exerciseType ? `Type d'exercices souhaité: ${params.exerciseType}` : ''}
${params.numberOfExercises ? `Nombre d'exercices souhaité: ${params.numberOfExercises}` : ''}
${params.questionsPerExercise ? `Nombre de questions par exercice: ${params.questionsPerExercise}` : ''}
${params.specificNeeds ? `Besoins spécifiques: ${params.specificNeeds}` : ''}
${params.additionalInstructions ? `Instructions supplémentaires: ${params.additionalInstructions}` : ''}

DIRECTIVES IMPORTANTES:
- Les exercices doivent être progressifs en difficulté
- Chaque exercice doit avoir un objectif d'apprentissage clair
- Respecte le niveau scolaire indiqué
- Les consignes doivent être claires et précises
- NE JAMAIS utiliser de tableaux HTML ou Markdown
- Utilise des listes numérotées ou des puces pour structurer le contenu
- Fournis une correction DÉTAILLÉE avec explications pédagogiques

RAPPEL: Génère directement les deux sections "FICHE ÉLÈVE" suivie de "FICHE CORRECTION", sans introduction ni titre supplémentaire.`;
}

// Fonction utilitaire pour convertir des tableaux en listes
function convertTableToList(text: string): string {
  // Fonction pour traiter les tableaux ligne par ligne
  const processLines = (lines: string[]): string[] => {
    // Ignorer les lignes d'en-tête/séparation
    const contentLines = lines.filter(line => 
      !line.match(/^\s*[+|-]{3,}\s*$/) && 
      line.includes('|')
    );
    
    // Convertir chaque ligne en élément de liste
    return contentLines.map(line => {
      // Extraire les cellules en supprimant les | aux extrémités et en divisant
      const cells = line.trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map(cell => cell.trim());
      
      // Convertir en élément de liste
      return `- ${cells.join(': ')}`;
    });
  };

  // Diviser le texte en blocs pour traiter chaque tableau séparément
  const sections = text.split(/(FICHE ÉLÈVE|FICHE CORRECTION)/g);
  
  // Traiter chaque section
  for (let i = 0; i < sections.length; i++) {
    if (sections[i] !== "FICHE ÉLÈVE" && sections[i] !== "FICHE CORRECTION") {
      // Identifier les blocs de tableaux
      const lines = sections[i].split('\n');
      const newLines: string[] = [];
      let tableLines: string[] = [];
      let inTable = false;
      
      // Parcourir chaque ligne
      for (const line of lines) {
        // Détecter le début ou la fin d'un tableau
        if ((line.includes('|') && (line.includes('---') || line.includes('+-'))) || 
            (inTable && line.includes('|'))) {
          
          // Si pas encore dans un tableau, marquer le début
          if (!inTable) {
            inTable = true;
          }
          
          tableLines.push(line);
          
          // Si fin de tableau détectée par une ligne sans |
        } else if (inTable) {
          // Convertir le tableau en liste
          newLines.push(...processLines(tableLines));
          tableLines = [];
          inTable = false;
          newLines.push(line);
        } else {
          // Ligne normale, pas dans un tableau
          newLines.push(line);
        }
      }
      
      // Traiter un tableau qui se terminerait à la fin de la section
      if (inTable && tableLines.length > 0) {
        newLines.push(...processLines(tableLines));
      }
      
      // Remplacer la section par la version traitée
      sections[i] = newLines.join('\n');
    }
  }
  
  // Recombiner les sections
  return sections.join('');
}
