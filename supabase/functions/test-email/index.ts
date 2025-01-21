import { createClient } from '@supabase/supabase-js'
import { serve } from 'https://deno.fresh.run/std@v9.6.1/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    console.log('🚀 Starting test email function')

    const { data, error } = await supabase.auth.admin.sendEmail({
      email: 'andyguitteaud@gmail.com',
      type: 'signup',
      data: {
        first_name: 'Test'
      }
    })

    console.log('📧 Test email result:', { data, error })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})