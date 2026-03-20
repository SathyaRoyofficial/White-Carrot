'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import { useBuilderStore } from '@/store/useBuilderStore'
import { Loader2, Star } from 'lucide-react'
import LeftPanel from '@/components/builder/LeftPanel'
import RightPanel from '@/components/builder/RightPanel'
import LivePreview from '@/components/builder/LivePreview'

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const pageId = unwrappedParams.id
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const { setInitialData } = useBuilderStore()
  const [error, setError] = useState<string | null>(null)
  
  const [projectName, setProjectName] = useState('')
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Not authenticated')
        }

        const { data: pageData } = await supabase
          .from('pages')
          .select('*, companies(id)')
          .eq('id', pageId)
          .single()

        if (!pageData) {
          throw new Error('Project not found')
        }

        setProjectName(pageData.name || 'Untitled Career Page')
        setIsStarred(pageData.is_starred || false)

        const theme = pageData.theme_settings || {}

        const { data: sections } = await supabase
          .from('sections')
          .select('*')
          .eq('page_id', pageId)
          .order('order_index')

        setInitialData(pageId, theme, sections || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    loadData()
  }, [pageId])

  const handleUpdateName = async (newName: string) => {
    setProjectName(newName)
    const { data } = await supabase.from('pages').select('theme_settings').eq('id', pageId).single()
    if (data) {
      await supabase.from('pages').update({ theme_settings: { ...data.theme_settings, projectName: newName } }).eq('id', pageId)
    }
  }

  const toggleStar = async () => {
    const updated = !isStarred
    setIsStarred(updated)
    const { data } = await supabase.from('pages').select('theme_settings').eq('id', pageId).single()
    if (data) {
      await supabase.from('pages').update({ theme_settings: { ...data.theme_settings, is_starred: updated } }).eq('id', pageId)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#5138EE]" /></div>
  if (error) return <div className="p-8 text-red-500">Error loading builder: {error}</div>

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Top Bar - Database Settings */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-3">
           <input 
             value={projectName}
             onChange={(e) => setProjectName(e.target.value)}
             onBlur={(e) => handleUpdateName(e.target.value)}
             className="text-lg font-bold text-gray-900 bg-transparent border-none outline-none hover:bg-gray-50 focus:bg-gray-50 px-2 py-1 rounded transition-colors"
           />
           <button onClick={toggleStar} className="focus:outline-none transition-transform hover:scale-110">
             <Star className={`w-5 h-5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`} />
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <LeftPanel />
        </div>

        {/* Center - Live Preview Area */}
        <div className="flex-1 overflow-y-auto relative flex flex-col items-center p-8 bg-gray-50/50">
          <div className="mb-4 text-sm font-medium text-gray-500 flex items-center justify-between w-full max-w-[1000px]">
            <span>Live Preview</span>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
            </div>
          </div>
          <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-xl overflow-hidden min-h-[800px] border border-gray-200 ring-1 ring-black/5">
            <LivePreview />
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
