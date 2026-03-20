import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // Ignore Server Component mutation errors
            }
          },
        },
      }
    )
    
    // Exchange the auth code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
        if (!company) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("Auth Callback Error:", error.message)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
