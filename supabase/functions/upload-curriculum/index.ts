import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const subject = formData.get('subject') as string
    const gradeLevel = formData.get('gradeLevel') as string
    const academicYear = formData.get('academicYear') as string
    const userId = formData.get('userId') as string

    if (!file) {
      throw new Error('No file uploaded')
    }

    // Sanitize filename to remove non-ASCII characters
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = sanitizedFileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload file to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('curriculum-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (storageError) {
      throw storageError
    }

    // Insert metadata into curriculum_documents table
    const { data: dbData, error: dbError } = await supabase
      .from('curriculum_documents')
      .insert({
        title,
        description,
        file_path: filePath,
        subject,
        grade_level: gradeLevel,
        academic_year: academicYear,
        uploaded_by: userId
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Document uploaded successfully',
        data: dbData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})