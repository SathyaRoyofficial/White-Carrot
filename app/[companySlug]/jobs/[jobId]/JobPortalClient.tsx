'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, Upload, Paperclip } from 'lucide-react'

export default function JobPortalClient({ job, company }: { job: any, company: any }) {
  const [activeTab, setActiveTab] = useState<'Overview'|'Application'>('Overview')
  
  // Form State
  const [loading, setLoading] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentCompany: '',
    linkedinUrl: '',
    location: '',
    rightToWork: '',
    relocate: ''
  })

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resumeFile) {
       toast.error("Please upload a resume.")
       return
    }
    
    if (!formData.name || !formData.email || !formData.phone || !formData.location || !formData.rightToWork || !formData.relocate) {
       toast.error("Please fill in all required fields.")
       return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Upload Resume
      const fileExt = resumeFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${company.id}/${job.id}/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('resumes')
        .upload(filePath, resumeFile)

      if (uploadError) throw new Error(`Resume upload failed: ${uploadError.message}. Make sure 'resumes' bucket exists!`)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath)

      // 2. Insert into Applications table
      const { error: dbError } = await supabase.from('applications').insert({
        job_id: job.id,
        company_id: company.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        current_company: formData.currentCompany,
        linkedin_url: formData.linkedinUrl,
        location: formData.location,
        resume_url: publicUrl,
        right_to_work: formData.rightToWork,
        willing_to_relocate: formData.relocate
      })

      if (dbError) throw new Error(`Application save failed: ${dbError.message}`)

      toast.success("Application submitted successfully!")
      // Clear form
      setFormData({
        name: '', email: '', phone: '', currentCompany: '', linkedinUrl: '', location: '', rightToWork: '', relocate: ''
      })
      setResumeFile(null)
      
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('Overview')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'Overview' ? 'text-[#5138EE]' : 'text-gray-500 hover:text-gray-900'}`}
          style={{ color: activeTab === 'Overview' ? company.primary_color || '#5138EE' : undefined }}
        >
          Overview
          {activeTab === 'Overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-md" style={{ backgroundColor: company.primary_color || '#5138EE' }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('Application')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'Application' ? 'text-[#5138EE]' : 'text-gray-500 hover:text-gray-900'}`}
          style={{ color: activeTab === 'Application' ? company.primary_color || '#5138EE' : undefined }}
        >
          Application
          {activeTab === 'Application' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-md" style={{ backgroundColor: company.primary_color || '#5138EE' }} />
          )}
        </button>
      </div>

      {/* Overview Content */}
      {activeTab === 'Overview' && (
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {job.description ? (
            <div dangerouslySetInnerHTML={{ __html: job.description }} />
          ) : (
            <p className="italic text-gray-400">No detailed description provided for this role.</p>
          )}
        </div>
      )}

      {/* Application Form */}
      {activeTab === 'Application' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <SparklesIcon /> Autofill from resume
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload your resume here to autofill key application fields.</p>
            </div>
            <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm shrink-0" onClick={() => toast("Autofill not implemented in MVP", { icon: "🚧" })}>
              Upload file
            </button>
          </div>

          <form onSubmit={submitApplication} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Name *</label>
                <p className="text-xs text-gray-500 mb-2">Please, add your name followed by your surname</p>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-shadow" placeholder="Type here..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-shadow" placeholder="hello@example.com..." />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Resume *</label>
                <div className="relative w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50 p-8 flex flex-col items-center justify-center transition-colors">
                  <input required type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Paperclip className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-900 text-sm">
                    {resumeFile ? resumeFile.name : (
                      <>
                        <span style={{ color: company.primary_color || '#5138EE' }}>Upload File</span> or drag and drop here
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Phone number *</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-shadow" placeholder="1-415-555-1234..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Current Company</label>
                <input name="currentCompany" value={formData.currentCompany} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-shadow" placeholder="Type here..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">LinkedIn URL</label>
                <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-shadow" placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Location *</label>
                <input required name="location" value={formData.location} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:outline-none transition-shadow" placeholder="Start typing..." />
              </div>

              {/* Custom Questions */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-900">Do you have the right to work and/or hold a valid working permit for the stated role location? *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="rightToWork" value="Yes" required onChange={handleChange} checked={formData.rightToWork === 'Yes'} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="rightToWork" value="No" onChange={handleChange} checked={formData.rightToWork === 'No'} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-900">Are you willing to relocate for this role? *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="relocate" value="Yes" required onChange={handleChange} checked={formData.relocate === 'Yes'} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="relocate" value="No" onChange={handleChange} checked={formData.relocate === 'No'} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              style={{ backgroundColor: company.primary_color || '#0000FF' }}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Submit Application
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
            </button>
          </form>
        </div>
      )}

    </div>
  )
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5138EE]">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  )
}
