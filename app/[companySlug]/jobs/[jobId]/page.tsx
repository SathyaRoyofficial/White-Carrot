import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import JobPortalClient from './JobPortalClient'

// Force dynamic rendering since we are reading from DB
export const dynamic = 'force-dynamic'

export default async function JobPage(props: { params: Promise<{ companySlug: string, jobId: string }> }) {
  const params = await props.params
  const { companySlug, jobId } = params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )

  // 1. Fetch Company
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, logo_url, primary_color')
    .eq('slug', companySlug)
    .single()

  if (!company) {
    notFound()
  }

  // 2. Fetch Job Details
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar Minimal */}
      <header className="w-full border-b border-gray-100 flex justify-center py-6">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="h-8 object-contain" />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: company.primary_color || '#111827' }}>
            {company.name}
          </h1>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Job Meta */}
          <div className="lg:col-span-4 space-y-8">
            <Link 
              href={`/${companySlug}/careers`} 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-8">
                {job.title}
              </h1>

              <div className="space-y-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-gray-900">{job.location || 'Not specified'}</p>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Employment Type</p>
                  <p className="text-gray-900">{job.type || 'Full time'}</p>
                </div>

                <div className="border-t border-gray-100 pt-4 border-b pb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-gray-900">Engineering & Product</p> {/* TODO: Add department to schema if needed */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Portal Client (Tabs + Form) */}
          <div className="lg:col-span-8 lg:pl-8">
            <JobPortalClient job={job} company={company} />
          </div>

        </div>
      </main>
    </div>
  )
}
