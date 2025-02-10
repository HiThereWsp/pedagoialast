
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { classLevel, totalSessions, subject, text, additionalInstructions } = await req.json()
    console.log('Received request with:', { classLevel, totalSessions, subject, text, additionalInstructions })

    if (!classLevel || !totalSessions) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'classLevel and totalSessions are required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate cache key
    const cacheKeyInputs = [
      classLevel,
      totalSessions.toString(),
      subject || '',
      text || '',
      additionalInstructions || ''
    ].join('')
    const cacheKey = await crypto.subtle.digest(
      "MD5",
      new TextEncoder().encode(cacheKeyInputs)
    ).then(buffer => 
      Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )

    // Check cache
    console.log('Checking cache for key:', cacheKey)
    const { data: cachedPlan } = await supabase
      .from('lesson_plan_cache')
      .select('lesson_plan')
      .eq('cache_key', cacheKey)
      .single()

    if (cachedPlan) {
      console.log('Cache hit!')
      // Increment usage count
      await supabase
        .from('lesson_plan_cache')
        .update({ usage_count: cachedPlan.usage_count + 1 })
        .eq('cache_key', cacheKey)

      return new Response(
        JSON.stringify({ 
          lessonPlan: cachedPlan.lesson_plan,
          cached: true,
          metrics: {
            contentLength: cachedPlan.lesson_plan.length
          }
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Cache miss, generating new lesson plan')

    // Construire le prompt de base
    let prompt = `En tant qu'expert en pédagogie à l'éducation nationale, crée une séquence pédagogique détaillée pour le niveau ${classLevel} en ${totalSessions} séances.`

    if (subject) {
      prompt += `\nLe sujet est: ${subject}.`
    }

    if (text) {
      prompt += `\nBasé sur ce texte: ${text}.`
    }

    if (additionalInstructions) {
      prompt += `\nInstructions supplémentaires: ${additionalInstructions}.`
    }

    prompt += `
Format de la réponse souhaitée:
1. Objectifs d'apprentissage
2. Prérequis
3. Durée estimée (${totalSessions} séances)
4. Matériel nécessaire
5. Déroulement détaillé:
   - Phase 1: Introduction
   - Phase 2: Développement
   - Phase 3: Application
   - Phase 4: Conclusion
6. Évaluation
7. Prolongements possibles`

    console.log('Calling OpenAI with prompt:', prompt)

    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pédagogie qui aide à créer des séquences pédagogiques détaillées et structurées, en respectant scrupuleusement les programmes officiels de l\'Education Nationale.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    // Set up streaming response
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const reader = response.body?.getReader()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        try {
          if (!reader) throw new Error('No reader available')
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.trim() === 'data: [DONE]') continue

              try {
                const json = JSON.parse(line.replace(/^data: /, ''))
                if (json.choices[0].delta?.content) {
                  const text = json.choices[0].delta.content
                  fullResponse += text
                  controller.enqueue(encoder.encode(text))
                }
              } catch (error) {
                console.error('Error parsing chunk:', error)
              }
            }
          }

          // Store in cache once complete
          if (fullResponse) {
            await supabase
              .from('lesson_plan_cache')
              .insert({
                class_level: classLevel,
                total_sessions: totalSessions,
                subject,
                text,
                additional_instructions: additionalInstructions,
                lesson_plan: fullResponse,
              })
            console.log('Stored new lesson plan in cache')
          }
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating the lesson plan'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
