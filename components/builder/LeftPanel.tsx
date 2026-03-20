'use client'

import { useBuilderStore, SectionType } from '@/store/useBuilderStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, LayoutTemplate, Palette, Type, Link, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Check, Copy, ExternalLink } from 'lucide-react'

export default function LeftPanel() {
  const { activeTab, setActiveTab, theme, updateTheme, addSection, pageId, sections } = useBuilderStore()
  const [saving, setSaving] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSavePage = async (silent = false) => {
    if (!pageId) return
    setSaving(true)

    // Update theme
    await supabase.from('pages').update({ theme_settings: theme, published: false }).eq('id', pageId)
    
    // Update sections (re-insert or update). For simplicity, we can delete all and insert new.
    await supabase.from('sections').delete().eq('page_id', pageId)
    const sectionsToInsert = sections.map(s => ({
      page_id: pageId,
      type: s.type,
      content: s.content,
      order_index: s.order_index
    }))
    await supabase.from('sections').insert(sectionsToInsert)
    
    setSaving(false)
    if (!silent) toast.success('Draft saved')
  }

  const handlePublish = async () => {
    if (!pageId) return
    setSaving(true)
    await handleSavePage(true) // Silent save before publish
    
    await supabase.from('pages').update({ published: true }).eq('id', pageId)
    
    // Fetch slug to redirect
    const { data } = await supabase.from('pages').select('company_id, companies(slug)').eq('id', pageId).single()
    const rawCompanies = data?.companies as any
    const slug = Array.isArray(rawCompanies) ? rawCompanies[0]?.slug : rawCompanies?.slug
    
    setSaving(false)
    toast.success('Published successfully 🚀')
    
    if (slug) {
      setPublicUrl(`${window.location.origin}/${slug}/careers?page=${pageId}`)
      setShowPublishModal(true)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Builder</h2>
        <Button size="sm" className="h-8 bg-[#5138EE] hover:bg-[#432dd4]" onClick={() => handleSavePage(false)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
      </div>

      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'theme' ? 'border-[#5138EE] text-[#5138EE]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Theme
        </button>
        <button 
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sections' ? 'border-[#5138EE] text-[#5138EE]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Sections
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'theme' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Palette className="w-4 h-4 text-gray-500"/> Primary Color</Label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2 max-w-min">
                <input 
                  type="color" 
                  value={theme.primaryColor} 
                  onChange={e => updateTheme({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-medium text-gray-700 uppercase font-mono">{theme.primaryColor}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Type className="w-4 h-4 text-gray-500"/> Font Family</Label>
              <select 
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5138EE]/50"
                value={theme.font}
                onChange={e => updateTheme({ font: e.target.value })}
              >
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
                <option value="System">System Default</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-500"/> Logo</Label>
              <Input 
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const { data } = await supabase.storage
                    .from("logos")
                    .upload(`logo-${Date.now()}`, file);
                  
                  if (data) {
                    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(data.path);
                    updateTheme({ logoUrl: urlData.publicUrl });
                  } else {
                    alert("Failed to upload. Make sure the 'logos' bucket exists and has public policies.");
                  }
                }}
              />
              <p className="text-xs text-gray-400">Upload your logo directly (Requires "logos" storage bucket).</p>
            </div>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Type className="w-4 h-4 text-gray-500"/> Global Tagline</Label>
              <Input 
                placeholder="Build the future" 
                value={theme.tagline || ''}
                onChange={e => updateTheme({ tagline: e.target.value })}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Label className="flex items-center gap-2"><Type className="w-4 h-4 text-gray-500"/> Footer Contact Text</Label>
              <Input 
                placeholder="Reach out to our team." 
                value={theme.contactText || ''}
                onChange={e => updateTheme({ contactText: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Link className="w-4 h-4 text-gray-500"/> Footer Contact Email</Label>
              <Input 
                type="email"
                placeholder="careers@company.com" 
                value={theme.contactEmail || ''}
                onChange={e => updateTheme({ contactEmail: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-4 animate-in fade-in">
            <p className="text-sm text-gray-500">Click to add a section to your page.</p>
            <div className="grid gap-2">
              {[
                { type: 'hero', label: 'Hero Banner', icon: LayoutTemplate },
                { type: 'about', label: 'About Us', icon: Type },
                { type: 'culture', label: 'Company Culture', icon: ImageIcon },
                { type: 'benefits', label: 'Benefits List', icon: Type },
                { type: 'jobs', label: 'Job Listings', icon: Link }
              ].map(block => (
                <Button 
                  key={block.type} 
                  variant="outline" 
                  className="justify-start h-12 bg-white hover:border-[#5138EE] hover:text-[#5138EE] hover:bg-[#5138EE]/5"
                  onClick={() => addSection(block.type as SectionType)}
                >
                  <block.icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-[#5138EE]" />
                  {block.label}
                  <Plus className="w-4 h-4 ml-auto opacity-50" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
         <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white" onClick={handlePublish} disabled={saving}>
          Publish Changes
         </Button>
         <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
            <Link className="w-3 h-3" /> Creates public URL
         </p>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Published! 🚀</h2>
            <p className="text-gray-500 mb-6">Your careers page is now live and ready to be shared with candidates.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 flex items-center justify-between gap-3 overflow-hidden">
              <span className="text-sm font-medium text-gray-700 truncate">{publicUrl}</span>
            </div>

            <div className="flex gap-3">
               <Button variant="outline" className="flex-1 h-11" onClick={copyLink}>
                 {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                 {copied ? 'Copied' : 'Copy Link'}
               </Button>
               <Button className="flex-1 h-11 bg-[#5138EE] hover:bg-[#432dd4]" onClick={() => window.open(publicUrl, '_blank')}>
                 Open Page <ExternalLink className="w-4 h-4 ml-2" />
               </Button>
            </div>
            
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
              onClick={() => setShowPublishModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
