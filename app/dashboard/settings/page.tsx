'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2, Link } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [pageId, setPageId] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#5138EE')
  const [font, setFont] = useState('Inter')
  
  const [showSalary, setShowSalary] = useState(true)
  const [perPage, setPerPage] = useState('10')
  
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setInitialLoading(false)
        return
      }

      const { data: company } = await supabase
        .from('companies')
        .select('id, name, pages(id, theme_settings)')
        .eq('user_id', user.id)
        .single()

      if (company) {
        setCompanyId(company.id)
        setName(company.name)
        if (company.pages && company.pages.length > 0) {
          const page = company.pages[0]
          setPageId(page.id)
          const ts = page.theme_settings || {}
          setLogo(ts.logoUrl || '')
          setPrimaryColor(ts.primaryColor || '#5138EE')
          setFont(ts.font || 'Inter')
          if (ts.seo) {
            setSeoTitle(ts.seo.title || '')
            setSeoDescription(ts.seo.description || '')
          }
          if (ts.jobs) {
            setShowSalary(ts.jobs.showSalary ?? true)
            setPerPage(ts.jobs.perPage?.toString() || '10')
          }
        }
      }
      setInitialLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!companyId || !pageId) return
    setLoading(true)

    // Save company name
    await supabase.from('companies').update({ name }).eq('id', companyId)

    // Save deeply nested settings inside theme_settings to match user's architectural expectations
    const settingsUpdate = {
      primaryColor,
      font,
      logoUrl: logo,
      seo: {
        title: seoTitle,
        description: seoDescription
      },
      jobs: {
        showSalary,
        perPage: parseInt(perPage) || 10
      }
    }

    await supabase.from('pages').update({ theme_settings: settingsUpdate }).eq('id', pageId)
    
    setLoading(false)
    alert('Settings saved successfully!')
  }

  if (initialLoading) {
    return <div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5138EE]" /></div>
  }

  if (!companyId) {
    return <div className="p-12 text-center text-gray-500">Company profile not found. Complete onboarding first.</div>
  }

  if (!pageId) {
    return (
      <div className="p-12 text-center text-gray-500 max-w-lg mx-auto mt-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Projects Found</h2>
        <p className="mb-6">You need to create a careers page project before you can manage brand settings and SEO preferences.</p>
        <a href="/dashboard">
          <Button className="bg-[#5138EE] hover:bg-[#432dd4]">Go to Dashboard</Button>
        </a>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Settings</h1>
          <p className="text-sm text-gray-500">Manage your brand identity, careers page preferences, and SEO metadata.</p>
        </div>
        <Button className="bg-[#5138EE] hover:bg-[#432dd4]" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Settings
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="p-6 border-gray-100 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-2">Brand Preferences</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Primary Color (Hex)</Label>
              <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Primary Font Family</Label>
              <select 
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5138EE]/50"
                value={font}
                onChange={e => setFont(e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-100 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-2">Job Board Settings</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col justify-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showSalary} 
                  onChange={e => setShowSalary(e.target.checked)}
                  className="rounded text-[#5138EE] focus:ring-[#5138EE]"
                />
                <span className="text-sm font-medium text-gray-700">Show Salary by default on Job Cards</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Jobs per page</Label>
              <Input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-100 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-2">SEO & Metadata</h3>
          <p className="text-sm text-gray-500 mb-4">Optimize how your candidate-facing page appears on Google, Twitter, and LinkedIn.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Careers | Your Company" />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea 
                value={seoDescription} 
                onChange={e => setSeoDescription(e.target.value)} 
                placeholder="Join our team to build the future..." 
                className="h-24 resize-none"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
