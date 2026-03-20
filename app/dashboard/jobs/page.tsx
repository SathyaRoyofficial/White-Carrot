'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, FileSpreadsheet, Search, Trash2, Edit3, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
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

  const toggleSelectAll = () => {
    if (selectedJobs.size === jobs.length && jobs.length > 0) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(jobs.map(j => j.id)))
    }
  }

  const toggleSelectJob = (id: string) => {
    const newSet = new Set(selectedJobs)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedJobs(newSet)
  }

  const handleDeleteSelected = async () => {
    if (selectedJobs.size === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedJobs.size} job(s)? This action cannot be undone.`)) return
    
    setLoading(true)
    const idsToDelete = Array.from(selectedJobs)
    const { error } = await supabase.from('jobs').delete().in('id', idsToDelete)
    
    if (error) {
      toast.error('Failed to delete jobs')
    } else {
      toast.success(`${idsToDelete.length} jobs deleted`)
      setJobs(prev => prev.filter(j => !selectedJobs.has(j.id)))
      setSelectedJobs(new Set())
    }
    setLoading(false)
  }

  const [editingJob, setEditingJob] = useState<any>(null)
  const [editDescription, setEditDescription] = useState('')

  const handleSaveDescription = async () => {
    if (!editingJob) return
    setLoading(true)
    const { error } = await supabase.from('jobs').update({ description: editDescription }).eq('id', editingJob.id)
    
    if (error) {
      toast.error('Failed to update description')
    } else {
      toast.success('Description updated successfully!')
      setJobs(prev => prev.map(j => j.id === editingJob.id ? { ...j, description: editDescription } : j))
      setEditingJob(null)
    }
    setLoading(false)
  }

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
          {selectedJobs.size > 0 && (
            <Button variant="ghost" size="sm" onClick={handleDeleteSelected} className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors h-9 px-3">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedJobs.size})
            </Button>
          )}
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
            {jobs.length > 0 && (
              <div className="p-4 bg-gray-50/50 flex items-center gap-4 border-b border-gray-100">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#5138EE] focus:ring-[#5138EE]"
                  checked={selectedJobs.size === jobs.length && jobs.length > 0}
                  onChange={toggleSelectAll}
                />
                <span className="text-sm font-medium text-gray-500">Select All</span>
              </div>
            )}
            {jobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 flex items-center gap-4 transition-colors group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#5138EE] focus:ring-[#5138EE]"
                  checked={selectedJobs.has(job.id)}
                  onChange={() => toggleSelectJob(job.id)}
                />
                <div className="flex-1 flex items-center justify-between">
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
                      {job.keyword && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-[#5138EE] bg-[#5138EE]/10 px-2 rounded-full text-xs font-medium py-0.5">Keyword: {job.keyword}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#5138EE] transition-opacity" onClick={() => {
                        setEditingJob(job)
                        setEditDescription(job.description || '')
                    }}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                       if(window.confirm('Delete this job?')) {
                         const { error } = await supabase.from('jobs').delete().eq('id', job.id)
                         if(!error) setJobs(prev => prev.filter(j => j.id !== job.id))
                       }
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Description Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Description</h3>
                <p className="text-sm text-gray-500 mt-1">{editingJob.title} • {editingJob.location}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingJob(null)} className="text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">Job Description</label>
              <RichTextEditor 
                value={editDescription}
                onChange={setEditDescription}
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
              <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
              <Button onClick={handleSaveDescription} disabled={loading} className="bg-[#5138EE] hover:bg-[#432dd4]">
                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Description</>}
              </Button>
            </div>
          </Card>
        </div>
      )}
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
