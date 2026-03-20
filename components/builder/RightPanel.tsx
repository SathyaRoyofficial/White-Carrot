'use client'

import { useBuilderStore } from '@/store/useBuilderStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Settings2 } from 'lucide-react'

export default function RightPanel() {
  const { sections, selectedSectionId, updateSection } = useBuilderStore()

  const activeSection = sections.find(s => s.id === selectedSectionId)

  if (!activeSection) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
        <Settings2 className="w-8 h-8 mb-4 opacity-50" />
        <p className="text-sm">Select a section in the preview to edit its properties.</p>
      </div>
    )
  }

  const handleUpdate = (key: string, value: any) => {
    updateSection(activeSection.id, { [key]: value })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-900 capitalize px-1">{activeSection.type} Properties</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {activeSection.type === 'hero' && (
          <>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input 
                value={activeSection.content.title || ''} 
                onChange={(e) => handleUpdate('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea 
                value={activeSection.content.subtitle || ''} 
                onChange={(e) => handleUpdate('subtitle', e.target.value)}
                className="h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input 
                value={activeSection.content.buttonText || ''} 
                onChange={(e) => handleUpdate('buttonText', e.target.value)}
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <Label>Background Image URL</Label>
              <Input 
                value={activeSection.content.image || ''} 
                onChange={(e) => handleUpdate('image', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Overlay Opacity (0 to 1)</Label>
              <Input 
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={Number.isNaN(Number(activeSection.content.opacity)) ? '' : (activeSection.content.opacity ?? 0.25)} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleUpdate('opacity', Number.isNaN(val) ? '' : val);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={activeSection.content.textColor || '#111827'}
                  onChange={(e) => handleUpdate('textColor', e.target.value)}
                  className="w-10 h-10 p-1 rounded border-gray-200"
                />
                <Input 
                  value={activeSection.content.textColor || '#111827'} 
                  onChange={(e) => handleUpdate('textColor', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Similar logic for other section types... we can keep it simple */}
        {(activeSection.type === 'about' || activeSection.type === 'culture') && (
          <>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input 
                value={activeSection.content.headline || ''} 
                onChange={(e) => handleUpdate('headline', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Body Paragraph</Label>
              <Textarea 
                value={activeSection.content.body || ''} 
                onChange={(e) => handleUpdate('body', e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            {activeSection.type === 'culture' && (
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <Label>Culture Images</Label>
                <Input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) return
                    
                    // Note: Ensure the user creates 'logos' & 'culture' buckets in Supabase!
                    const { createClient } = await import('@/lib/supabase')
                    const supabase = createClient()
                    
                    const uploadedUrls = []
                    for (const file of files) {
                      const { data } = await supabase.storage
                        .from("culture")
                        .upload(`img-${Date.now()}-${file.name}`, file)
                      if (data) {
                        const { data: urlData } = supabase.storage.from("culture").getPublicUrl(data.path)
                        uploadedUrls.push(urlData.publicUrl)
                      }
                    }
                    
                    if (uploadedUrls.length > 0) {
                      const existing = activeSection.content.images || []
                      handleUpdate('images', [...existing, ...uploadedUrls])
                    }
                  }}
                />
                <p className="text-xs text-gray-400">Upload multiple images. Requires "culture" bucket in Storage.</p>
              </div>
            )}
          </>
        )}

        {activeSection.type === 'benefits' && (
          <>
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input 
                value={activeSection.content.title || ''} 
                onChange={(e) => handleUpdate('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Benefits (comma separated)</Label>
              <Textarea 
                value={(activeSection.content.items || []).join(', ')} 
                onChange={(e) => handleUpdate('items', e.target.value.split(',').map(s=>s.trim()))}
                className="min-h-[100px]"
              />
            </div>
          </>
        )}

        {activeSection.type === 'jobs' && (
          <>
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input 
                value={activeSection.content.title || ''} 
                onChange={(e) => handleUpdate('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input 
                value={activeSection.content.subtitle || ''} 
                onChange={(e) => handleUpdate('subtitle', e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label>Keyword Filter</Label>
              <Input 
                placeholder="e.g. engineering"
                value={activeSection.content.keywordFilter || ''} 
                onChange={(e) => handleUpdate('keywordFilter', e.target.value)}
              />
              <p className="text-xs text-gray-400">Only display jobs that contain this keyword.</p>
            </div>
            <p className="text-xs text-gray-400 border-l-2 border-orange-300 pl-3 mt-4">
              Note: This block automatically renders active jobs from your database on the live page.
            </p>
          </>
        )}

      </div>
    </div>
  )
}
