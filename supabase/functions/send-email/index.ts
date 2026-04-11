import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import nodemailer from 'npm:nodemailer@6.9.15'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Manual Authorization Check 
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Unauthorized: Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const anonKey = (Deno.env.get('SUPABASE_ANON_KEY') ?? '').trim().replace(/^["']|["']$/g, '')
    const serviceKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '').trim().replace(/^["']|["']$/g, '')

    // For Edge-to-Edge invokes, or front-end invokes
    if (token !== anonKey && token !== serviceKey) {
      console.warn('❌ Blocked request: Invalid token provided')
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { to, subject, html, text } = await req.json()

    if (!to || !subject) {
      throw new Error('Missing required fields: to or subject')
    }

    const SMTP_EMAIL = Deno.env.get('SMTP_EMAIL')
    const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD')
    
    if (!SMTP_EMAIL || !SMTP_PASSWORD) {
      console.log('Would send email to:', to)
      console.log('Subject:', subject)
      return new Response(
        JSON.stringify({ message: "Development mode: Email logged securely but not sent (Missing SMTP credentials)." }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Configure Nodemailer for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD, 
      },
    })

    // For sending email
    const info = await transporter.sendMail({
      from: `"Valley Care Clinic" <${SMTP_EMAIL}>`, 
      to: to, 
      subject: subject,
      text: text,
      html: html,
    })

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
