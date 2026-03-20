'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Edit2, Copy, Search, Star, Loader2, Plus, LayoutTemplate } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (companyData) {
          setCompany(companyData)
          const { data: pages } = await supabase
            .from('pages')
            .select('*')
            .eq('company_id', companyData.id)
            .order('created_at', { ascending: false })
            
          const sortedPages = (pages || []).sort((a, b) => {
            const aStar = a.theme_settings?.is_starred ? 1 : 0
            const bStar = b.theme_settings?.is_starred ? 1 : 0
            return bStar - aStar
          })
          setProjects(sortedPages)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateProject = async () => {
    if (!company) return
    setCreating(true)
    const { data: newPage, error } = await supabase
      .from('pages')
      .insert({
        company_id: company.id,
        published: false,
        theme_settings: { projectName: 'Untitled Career Page', is_starred: false, primaryColor: '#5138EE', font: 'Inter' }
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create project')
      setCreating(false)
      return
    }

    toast.success('Project created!')
    router.push(`/dashboard/builder/${newPage.id}`)
  }

  const toggleStar = async (pageId: string, currentStatus: boolean) => {
    const updated = !currentStatus
    const target = projects.find(p => p.id === pageId)
    if (!target) return
    
    setProjects(prev => prev.map(p => p.id === pageId ? { ...p, theme_settings: { ...p.theme_settings, is_starred: updated } } : p).sort((a, b) => Number(b.theme_settings?.is_starred || false) - Number(a.theme_settings?.is_starred || false)))
    await supabase.from('pages').update({ theme_settings: { ...target.theme_settings, is_starred: updated } }).eq('id', pageId)
  }

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5138EE]" /></div>
  }

  if (!company) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
           <h2 className="text-2xl font-bold text-gray-900">Please log in to manage Career Pages</h2>
           <p className="text-gray-500 max-w-md">You are currently in demo mode. Create an account to start building and publishing real career portals.</p>
           <Link href="/login">
             <Button className="h-11 bg-[#5138EE] hover:bg-[#432dd4]">Sign In / Sign Up</Button>
           </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Your Career Pages
          </h1>
          <p className="text-gray-500 mt-1">
            Manage, build, and publish your branded talent portals.
          </p>
        </div>
        <Button className="h-11 bg-[#5138EE] hover:bg-[#432dd4] shadow-lg shadow-[#5138EE]/20" onClick={handleCreateProject} disabled={creating}>
          {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
          Create New Career Page
        </Button>
      </div>

      {!company ? (
        <Card className="p-12 text-center text-gray-500">
          Company profile not found.
        </Card>
      ) : projects.length === 0 ? (
        <Card className="p-16 border-dashed border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
            <LayoutTemplate className="w-8 h-8 text-[#5138EE]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-500 max-w-sm mb-8">Create your first branded career page to start attracting top talent.</p>
          <Button className="h-11 bg-[#5138EE] hover:bg-[#432dd4]" onClick={handleCreateProject} disabled={creating}>
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const publicUrl = `${window.location.origin}/${company.slug}/careers?page=${project.id}`
            return (
              <Card key={project.id} className="p-6 border-gray-100 shadow-sm group hover:shadow-md hover:border-[#5138EE]/30 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStar(project.id, project.theme_settings?.is_starred)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-5 h-5 ${project.theme_settings?.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 group-hover:text-gray-400'}`} />
                    </button>
                    <h3 className="font-semibold text-lg text-gray-900 tracking-tight truncate max-w-[180px]" title={project.theme_settings?.projectName || 'Untitled Career Page'}>
                      {project.theme_settings?.projectName || 'Untitled Career Page'}
                    </h3>
                  </div>
                  {project.published ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800">
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      Draft
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 flex-1 space-y-2 mb-6">
                  {project.published && (
                    <div className="flex items-center gap-1.5 truncate">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <a href={`/${company.slug}/careers?page=${project.id}`} target="_blank" className="hover:text-[#5138EE] hover:underline truncate">
                        /{company.slug}/careers...
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
                  {project.published && (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-900" onClick={() => {
                        navigator.clipboard.writeText(publicUrl)
                        toast.success('Link copied!')
                      }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                  <Link href={`/dashboard/builder/${project.id}`} className="ml-auto">
                    <Button size="sm" className="h-8 bg-gray-50 hover:bg-[#5138EE] text-gray-700 hover:text-white border border-gray-200 hover:border-transparent transition-all">
                      <Edit2 className="w-3.5 h-3.5 mr-2" />
                      Edit Builder
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
