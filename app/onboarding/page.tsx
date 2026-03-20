'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase'
import { Loader2, Building, Briefcase, Zap, Check } from 'lucide-react'

const STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [businessType, setBusinessType] = useState('')
  const [hiringFor, setHiringFor] = useState<string[]>([])
  const [showcase, setShowcase] = useState<string[]>([])
  const [companyName, setCompanyName] = useState('')
  const [tagline, setTagline] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleMultiselect = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleSubmit = async () => {
    if (!companyName) {
      setError('Company name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate unique slug
      const baseSlug = generateSlug(companyName)
      const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`

      // Ideally we upload logo to storage here and get URL
      let logo_url = null
      
      // 1. Create Company
      const { data: company, error: companyErr } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: companyName,
          slug: uniqueSlug,
          logo_url: logo_url,
          primary_color: '#5138EE'
        })
        .select()
        .single()

      if (companyErr) throw companyErr

      // 2. Create Default Page
      const { data: page, error: pageErr } = await supabase
        .from('pages')
        .insert({
          company_id: company.id,
          theme_settings: { tagline, hiringFor, showcase },
        })
        .select()
        .single()

      if (pageErr) throw pageErr

      // 3. Create Default Sections (Hero, Jobs)
      await supabase.from('sections').insert([
        {
          page_id: page.id,
          type: 'hero',
          order_index: 0,
          content: { title: 'Join Our Team', subtitle: tagline || 'Build the future with us' }
        },
        {
          page_id: page.id,
          type: 'jobs',
          order_index: 1,
          content: { title: 'Open Roles' }
        }
      ])

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-12">
      <div className="max-w-xl mx-auto w-full px-6">
        
        {/* Progress header map */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-400 mb-2">
            <span>Step {step} of {STEPS}</span>
            {step < STEPS ? <span>Almost there</span> : <span>Final step</span>}
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#5138EE] transition-all duration-300 ease-out"
              style={{ width: `${(step / STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Is this for a new or existing business?</h2>
                <p className="text-gray-500">We'll tailor the setup experience based on your needs.</p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => setBusinessType('New')}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                    businessType === 'New' 
                      ? 'border-[#5138EE] bg-[#5138EE]/5' 
                      : 'border-gray-200 hover:border-[#5138EE]/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${businessType === 'New' ? 'bg-[#5138EE]/10 text-[#5138EE]' : 'bg-gray-100 text-gray-500'}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">I'm just starting</h3>
                    <p className="text-sm text-gray-500">I don't have a careers page yet</p>
                  </div>
                </button>
                <button
                  onClick={() => setBusinessType('Existing')}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                    businessType === 'Existing' 
                      ? 'border-[#5138EE] bg-[#5138EE]/5' 
                      : 'border-gray-200 hover:border-[#5138EE]/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${businessType === 'Existing' ? 'bg-[#5138EE]/10 text-[#5138EE]' : 'bg-gray-100 text-gray-500'}`}>
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Existing business</h3>
                    <p className="text-sm text-gray-500">I want to migrate or upgrade my careers page</p>
                  </div>
                </button>
              </div>

              <Button 
                className="w-full h-12 text-lg bg-[#5138EE] hover:bg-[#432dd4] mt-4" 
                onClick={() => setStep(2)}
                disabled={!businessType}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">What are you hiring for?</h2>
                <p className="text-gray-500">Select all areas you typically recruit for.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Frontend (React, Next.js)', 'Backend (Node, Java)', 'AI/ML', 'Design', 'Marketing', 'Sales'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleMultiselect(role, hiringFor, setHiringFor)}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                      hiringFor.includes(role)
                        ? 'border-[#5138EE] bg-[#5138EE]/5 text-[#5138EE]'
                        : 'border-gray-200 hover:border-[#5138EE]/50 text-gray-700'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mr-3 shrink-0" />
                    <span className="font-medium">{role}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="w-1/3 h-12" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  className="w-2/3 h-12 text-lg bg-[#5138EE] hover:bg-[#432dd4]" 
                  onClick={() => setStep(3)}
                  disabled={hiringFor.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">What do you want to showcase?</h2>
                <p className="text-gray-500">Choose the blocks you want on your careers page.</p>
              </div>

              <div className="space-y-3">
                {['About Company', 'Culture', 'Benefits', 'Team', 'Jobs'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleMultiselect(item, showcase, setShowcase)}
                    className={`w-full flex items-center p-4 rounded-xl border-2 transition-all text-left justify-between ${
                      showcase.includes(item)
                        ? 'border-[#5138EE] bg-[#5138EE]/5'
                        : 'border-gray-200 hover:border-[#5138EE]/50'
                    }`}
                  >
                    <span className={`font-medium ${showcase.includes(item) ? 'text-[#5138EE]' : 'text-gray-700'}`}>
                      {item}
                    </span>
                    {showcase.includes(item) && <Check className="w-5 h-5 text-[#5138EE]" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="w-1/3 h-12" onClick={() => setStep(2)}>Back</Button>
                <Button 
                  className="w-2/3 h-12 text-lg bg-[#5138EE] hover:bg-[#432dd4]" 
                  onClick={() => setStep(4)}
                  disabled={showcase.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Let's set up your brand</h2>
                <p className="text-gray-500">You can always change this later in your dashboard.</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input 
                    id="companyName" 
                    placeholder="e.g. Tesla" 
                    className="h-12"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input 
                    id="tagline" 
                    placeholder="e.g. Build the future with us" 
                    className="h-12"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo (Optional)</Label>
                  <Input 
                    id="logo" 
                    type="file" 
                    accept="image/*"
                    className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5138EE]/10 file:text-[#5138EE] hover:file:bg-[#5138EE]/20 pt-2"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="w-1/3 h-12" onClick={() => setStep(3)} disabled={loading}>Back</Button>
                <Button 
                  className="w-2/3 h-12 text-lg bg-[#5138EE] hover:bg-[#432dd4]" 
                  onClick={handleSubmit}
                  disabled={loading || !companyName}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Finish Setup
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
