'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Sparkles, Upload, Loader2, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Papa from 'papaparse'

// The UI has two panels: Left (Main Input) and Right (Settings)
// Plus a CSV import utility.

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  
  // Job State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('Full-time')
  const [salary, setSalary] = useState('')
  const [skills, setSkills] = useState('')
  const [applyLink, setApplyLink] = useState('')
  const [status, setStatus] = useState('Active')
  const [department, setDepartment] = useState('Engineering')

  const [importedJobs, setImportedJobs] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    async function loadCompany() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
        if (company) {
          setCompanyId(company.id)
        }
      }
    }
    loadCompany()
  }, [])

  const handleSave = async (draft = false) => {
    if (!title || !companyId) return
    setLoading(true)
    const finalStatus = draft ? 'Draft' : status

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)

    await supabase.from('jobs').insert({
      company_id: companyId,
      title,
      description,
      location,
      type,
      salary,
      skills: skillsArray,
      apply_link: applyLink,
      status: finalStatus
    })

    setLoading(false)
    router.push('/dashboard/jobs')
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !companyId) return
    setLoading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const jobs = results.data as any[]
        console.log("CSV Parsed Results:", jobs)
        
        const validJobs = jobs.filter(j => j.title)
        
        await supabase.from('jobs').insert(
          validJobs.map((job) => ({
            title: job.title,
            location: job.location,
            type: job.type,
            salary: job.salary,
            description: job.description,
            skills: typeof job.skills === 'string' ? job.skills.split(',').map((s: string) => s.trim()) : [],
            apply_link: job.apply_link || '',
            company_id: companyId,
            status: "Active",
          }))
        )
        
        setLoading(false)
        router.push('/dashboard/jobs')
      }
    })
  }

  const confirmBulkUpload = async () => {
    if (!companyId || importedJobs.length === 0) return
    setLoading(true)

    const jobsToInsert = importedJobs.map(job => ({
      company_id: companyId,
      title: job.title,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      skills: job.skills ? job.skills.split(',').map((s: string) => s.trim()) : [],
      status: 'Active'
    }))

    await supabase.from('jobs').insert(jobsToInsert)
    setLoading(false)
    router.push('/dashboard/jobs')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Job Post</h1>
            <p className="text-sm text-gray-500">Draft your job posting or bulk import multiple.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={loading || !title}>
            Save Draft
          </Button>
          <Button className="bg-[#5138EE] hover:bg-[#432dd4]" onClick={() => handleSave(false)} disabled={loading || !title}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Publish Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold" htmlFor="title">Job Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Senior Frontend Developer" 
                  className="h-12 bg-gray-50/50"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 font-semibold" htmlFor="description">Job Description *</Label>
                  <Button variant="ghost" size="sm" className="h-8 text-[#5138EE] hover:text-[#432dd4] hover:bg-[#5138EE]/10 bg-[#5138EE]/5">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea 
                  id="description" 
                  placeholder="Describe the role, responsibilities, and requirements..." 
                  className="h-48 resize-none bg-gray-50/50"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold" htmlFor="location">Location *</Label>
                <Input id="location" placeholder="e.g. Remote / New York" className="bg-gray-50/50 h-11" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold" htmlFor="salary">Salary (Optional)</Label>
                <Input id="salary" placeholder="e.g. $120k - $150k" className="bg-gray-50/50 h-11" value={salary} onChange={e => setSalary(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold" htmlFor="skills">Tags / Skills</Label>
              <Input id="skills" placeholder="e.g. React, Next.js, Node (comma separated)" className="bg-gray-50/50 h-11" value={skills} onChange={e => setSkills(e.target.value)} />
              <p className="text-xs text-gray-500">Press comma to separate skills</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold" htmlFor="applyLink">External Application Link</Label>
              <Input id="applyLink" placeholder="https://boards.greenhouse.io/yourcompany/job" className="bg-gray-50/50 h-11" value={applyLink} onChange={e => setApplyLink(e.target.value)} />
            </div>
          </Card>

          {/* BULK IMPORT CARD */}
          <Card className="p-6 border-gray-100 shadow-sm border-dashed border-2 bg-[#5138EE]/[0.02]">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#5138EE]" />
              Bulk Import Jobs
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Recruiters often hire in bulk. Upload a CSV to import multiple jobs instantly and reduce friction.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="outline" className="h-11 bg-white">
                  Choose CSV File
                </Button>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCSVUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>
              <Button variant="ghost" className="text-gray-500 hover:text-gray-900" onClick={() => {
                const csv = 'title,location,type,salary,description,skills,apply_link\nFrontend Developer,Remote,Full-time,$120k,Build UI,React,https://apply.co\nBackend Engineer,New York,Full-time,$130k,APIs,Node.js,https://apply.co'
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'sample_jobs.csv'
                a.click()
              }}>
                <Download className="w-4 h-4 mr-2" /> Download Template
              </Button>
            </div>

            {showPreview && importedJobs.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Preview ({importedJobs.length} jobs ready to import)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {importedJobs.slice(0, 3).map((job, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-900">{job.title}</span>
                      <span className="text-gray-500">{job.location} • {job.type}</span>
                    </div>
                  ))}
                  {importedJobs.length > 3 && (
                    <div className="text-xs text-center text-gray-400 py-2">...and {importedJobs.length - 3} more</div>
                  )}
                </div>
                <Button className="w-full mt-4 bg-[#5138EE] hover:bg-[#432dd4]" onClick={confirmBulkUpload} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm & Import All
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          <Card className="p-6 border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900">Settings</h3>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Status</Label>
              <select 
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5138EE]/50"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Visibility</Label>
              <select className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5138EE]/50">
                <option value="Public">Public</option>
                <option value="Private">Private / Direct Link</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Job Type</Label>
              <select 
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5138EE]/50"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Department</Label>
              <select 
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5138EE]/50"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Product">Product</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Posted Date</span>
                <span className="font-medium text-gray-900">Auto</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
