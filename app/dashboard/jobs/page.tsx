'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, FileSpreadsheet, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadJobs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get company
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (company) {
          const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .eq('company_id', company.id)
            .order('created_at', { ascending: false })
          
          if (jobsData) setJobs(jobsData)
        }
      }
      setLoading(false)
    }
    loadJobs()
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Open Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your job listings to be displayed on your careers page.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs/new">
            <Button className="bg-[#5138EE] hover:bg-[#432dd4]">
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-colors"
            />
          </div>
          <div className="text-sm text-gray-500">
            {jobs.length} roles found
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5138EE]" /></div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No jobs yet</h3>
            <p className="text-sm mb-4 text-gray-400">Create your first role or bulk import to get started.</p>
            <Link href="/dashboard/jobs/new">
              <Button variant="outline" className="text-[#5138EE] hover:text-[#432dd4] hover:bg-[#5138EE]/5 border-[#5138EE]/20">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors group">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#5138EE] transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{job.type}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className={job.status === 'Active' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function Briefcase(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}
