import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Metadata } from 'next'

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

export default async function PublicCareersPage(props: { params: Promise<{ companySlug: string }>, searchParams: Promise<{ preview?: string }> }) {
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

  return (
    <main className="min-h-screen bg-white" style={fontStyle}>
      {/* Brand Header */}
      <nav className="w-full h-20 border-b border-gray-100 px-6 sm:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt={company.name} className="h-8 max-w-[150px] object-contain" />
          ) : (
            <div className="font-bold text-2xl tracking-tight text-gray-900">{company.name}</div>
          )}
        </div>
        <a href="#jobs">
          <button className="px-5 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: theme.primaryColor }}>
            View Roles
          </button>
        </a>
      </nav>

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
              <div key={section.id} className="relative py-32 px-6 text-center border-b border-gray-100 overflow-hidden" style={bgStyle}>
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
            )
          }

          if (section.type === 'about') {
            return (
              <div key={section.id} className="py-24 px-6 max-w-4xl mx-auto text-center md:text-left text-gray-900">
                <h2 className="text-4xl font-bold mb-8">{section.content.headline}</h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                  {section.content.body}
                </p>
              </div>
            )
          }

          if (section.type === 'culture') {
            return (
              <div key={section.id} className="py-24 px-6 bg-gray-900 text-white rounded-[3rem] mx-4 sm:mx-12 my-12 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${theme.primaryColor}, transparent)` }} />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl font-bold mb-6">{section.content.headline}</h2>
                  <p className="text-xl text-gray-300 leading-relaxed mb-16">{section.content.body}</p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10"></div>
                    <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 hidden sm:block"></div>
                    <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10"></div>
                  </div>
                </div>
              </div>
            )
          }

          if (section.type === 'benefits') {
            return (
              <div key={section.id} className="py-24 px-6 max-w-6xl mx-auto">
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
                  
                  {(!jobs || jobs.length === 0) ? (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                      <p className="text-lg">No open roles at the moment. Check back later!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-md transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#5138EE] transition-colors mb-2" style={{ ':hover': { color: theme.primaryColor } } as any}>
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-gray-500 font-medium">
                              <span>{job.location}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span>{job.type}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span>{job.department || 'Engineering'}</span>
                            </div>
                            
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {job.skills.slice(0, 4).map((skill: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                                    {skill}
                                  </span>
                                ))}
                                {job.skills.length > 4 && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                                    +{job.skills.length - 4} logic
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <a 
                            href={job.apply_link || `mailto:${job.apply_email || 'careers@' + company.slug + '.com'}?subject=Application for ${job.title}`}
                            target={job.apply_link ? "_blank" : "_self"}
                            className="w-full sm:w-auto text-center px-8 py-4 rounded-xl text-white font-bold transition-transform group-hover:scale-105" 
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            Apply Now
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
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
        <div className="text-gray-400 text-sm">
          <p>Built with <a href="/" className="font-semibold hover:text-gray-600 transition-colors" style={{ color: theme.primaryColor }}>Whitecarrot</a></p>
        </div>
      </footer>
    </main>
  )
}
