import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Metadata } from 'next'
import JobBoardClient from '@/components/public/JobBoardClient'

export async function generateMetadata(props: { params: Promise<{ companySlug: string }> }): Promise<Metadata> {
  const params = await props.params
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )

  const { data: company } = await supabase
    .from('companies')
    .select('name, pages(theme_settings)')
    .eq('slug', params.companySlug)
    .single()

  if (!company) return { title: 'Careers' }

  return {
    title: `Careers at ${company.name}`,
    description: company.pages?.[0]?.theme_settings?.tagline || `Join the team at ${company.name}`
  }
}

export default async function PublicCareersPage(props: { params: Promise<{ companySlug: string }>, searchParams: Promise<{ preview?: string, page?: string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  const isPreview = searchParams.preview === 'true'
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )

  // 1. Fetch Company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', params.companySlug)
    .single()

  if (!company) return notFound()

  // 2. Fetch Page
  const query = supabase.from('pages').select('*').eq('company_id', company.id)
  if (!isPreview) {
    query.eq('published', true)
  }
  const { data: pageResult } = await query.single()

  if (!pageResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl text-gray-500">This careers page is not published yet.</h1>
      </div>
    )
  }

  // 3. Fetch Sections
  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', pageResult.id)
    .order('order_index')

  // 4. Fetch Active Jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'Active')

  const theme = pageResult.theme_settings || { primaryColor: '#5138EE', font: 'Inter' }
  const fontStyle = { fontFamily: `"${theme.font}", sans-serif` }

  // Dynamically map sections to navbar links
  const availableLinks = []
  if (sections?.some(s => s.type === 'about')) availableLinks.push({ label: 'About', href: '#about' })
  if (sections?.some(s => s.type === 'culture')) availableLinks.push({ label: 'Culture', href: '#culture' })
  if (sections?.some(s => s.type === 'benefits')) availableLinks.push({ label: 'Benefits', href: '#benefits' })
  if (sections?.some(s => s.type === 'jobs')) availableLinks.push({ label: 'Jobs', href: '#jobs' })

  return (
    <main className="min-h-screen bg-white sm:pt-6 pt-12" style={fontStyle}>
      {/* Floating Pill Navbar */}
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/90 backdrop-blur-lg border border-gray-200/60 shadow-xl shadow-black/5 rounded-full px-4 py-3 sm:py-4 flex items-center gap-6 md:gap-12 transition-all w-max max-w-[95vw] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 pl-2 sm:pl-4 shrink-0">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt={company.name} className="h-6 sm:h-8 max-w-[120px] object-contain" />
            ) : (
              <div className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 truncate">{company.name}</div>
            )}
          </div>
          
          {availableLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-500">
              {availableLinks.map(link => (
                <a key={link.href} href={link.href} className="hover:text-gray-900 hover:scale-105 transition-all">
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <a href="#jobs">
              <button className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-transform hover:scale-105 shadow-md flex-shrink-0" style={{ backgroundColor: theme.primaryColor }}>
                View Roles
              </button>
            </a>
          </div>
        </nav>
      </div>

      {/* Render Sections */}
      <div className="w-full">
        {sections?.map((section) => {
          if (section.type === 'hero') {
            const bgStyle = section.content.image ? {
              backgroundImage: `url(${section.content.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : { backgroundColor: theme.primaryColor + '05' }

            return (
              <div key={section.id} className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative py-24 sm:py-32 px-6 text-center rounded-[2.5rem] overflow-hidden max-w-7xl mx-auto border border-gray-100/50 shadow-2xl shadow-gray-200/40 transition-shadow" style={bgStyle}>
                  {section.content.image && (
                    <div 
                      className="absolute inset-0 z-0" 
                      style={{ backgroundColor: `rgba(0,0,0,${section.content.opacity ?? 0.25})` }} 
                    />
                  )}
                  <div className="relative z-10 max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                  <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight" style={{ color: section.content.textColor || '#111827' }}>
                    {section.content.title}
                  </h1>
                  <p className="text-xl sm:text-2xl" style={{ color: section.content.textColor ? section.content.textColor + 'e6' : '#4b5563' }}>
                    {section.content.subtitle}
                  </p>
                  <div className="pt-8">
                    <a href="#jobs">
                      <button className="px-8 py-4 rounded-full text-white font-medium text-lg shadow-xl shadow-black/10 hover:scale-105 transition-transform" style={{ backgroundColor: theme.primaryColor }}>
                        {section.content.buttonText || 'Explore Careers'}
                      </button>
                    </a>
                  </div>
                </div>
              </div>
              </div>
            )
          }

          if (section.type === 'about') {
            return (
              <div id="about" key={section.id} className="py-24 px-6 max-w-4xl mx-auto text-center md:text-left text-gray-900">
                <h2 className="text-4xl font-bold mb-8">{section.content.headline}</h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                  {section.content.body}
                </p>
              </div>
            )
          }

          if (section.type === 'culture') {
            return (
              <div id="culture" key={section.id} className="py-24 px-6 bg-gray-900 text-white rounded-[3rem] mx-4 sm:mx-12 my-12 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${theme.primaryColor}, transparent)` }} />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl font-bold mb-6">{section.content.headline}</h2>
                  <p className="text-xl text-gray-300 leading-relaxed mb-16">{section.content.body}</p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.content.images && section.content.images.length > 0 ? (
                      section.content.images.map((img: string, i: number) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 relative">
                          <img src={img} alt={`Culture ${i}`} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10"></div>
                        <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 hidden sm:block"></div>
                        <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          if (section.type === 'benefits') {
            return (
              <div id="benefits" key={section.id} className="py-24 px-6 max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">{section.content.title}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(section.content.items || []).map((item: string, i: number) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start break-words whitespace-normal overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white text-xl shadow-lg shrink-0" style={{ backgroundColor: theme.primaryColor }}>✨</div>
                      <p className="text-xl font-bold text-gray-900 break-words leading-relaxed w-full min-w-0">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          if (section.type === 'jobs') {
            return (
              <div id="jobs" key={section.id} className="py-24 px-6 bg-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">{section.content.title}</h2>
                  <p className="text-xl text-gray-500 mb-12">{section.content.subtitle}</p>
                  
                  {(() => {
                    const keywordFilter = section.content.keywordFilter?.trim()?.toLowerCase()
                    const filteredJobs = keywordFilter 
                      ? (jobs || []).filter(j => j.keyword?.toLowerCase()?.includes(keywordFilter))
                      : (jobs || [])

                    if (filteredJobs.length === 0) {
                      return (
                        <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                          <p className="text-lg">No open roles at the moment. Check back later!</p>
                        </div>
                      )
                    }

                    const perPageCount = theme.jobs?.perPage ? parseInt(theme.jobs.perPage.toString()) : 10

                    return (
                      <JobBoardClient 
                        jobs={filteredJobs} 
                        theme={theme} 
                        perPageCount={perPageCount} 
                        companySlug={company.slug} 
                      />
                    )
                  })()}
                </div>
              </div>
            )
          }

          return null
        })}
      </div>

      <footer className="py-16 bg-gray-50 text-center border-t border-gray-100 mt-12">
        <div className="max-w-xl mx-auto mb-10 px-6">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-2xl" style={{ color: theme.primaryColor }}>💬</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Get in Touch</h3>
          <p className="text-gray-500 mb-6 text-lg">{theme.contactText || `Have questions about our hiring process or working at ${company.name}? Reach out to our team.`}</p>
          <a href={`mailto:${theme.contactEmail || `careers@${company.slug}.com`}`} className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold transition-transform hover:scale-105" style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}>
            {theme.contactEmail || `careers@${company.slug}.com`}
          </a>
        </div>
        <div className="flex justify-center items-center text-gray-400 text-sm gap-2">
          <p>Built with</p>
          <a href="/" className="transition-opacity opacity-80 hover:opacity-100">
            <img src="/logo.png" alt="Whitecarrot" className="h-5 object-contain" />
          </a>
        </div>
      </footer>
    </main>
  )
}
