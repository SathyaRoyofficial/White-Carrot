'use client'

import { useBuilderStore, BuilderSection } from '@/store/useBuilderStore'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

// Renderers for Sections
const RenderHero = ({ content, theme }: { content: any, theme: any }) => {
  const bgStyle = content.image ? {
    backgroundImage: `url(${content.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : { backgroundColor: theme.primaryColor + '10' }

  return (
    <div className="relative py-24 px-8 text-center rounded-2xl mx-4 my-6 overflow-hidden" style={bgStyle}>
      {content.image && (
        <div 
          className="absolute inset-0 z-0" 
          style={{ backgroundColor: `rgba(0,0,0,${content.opacity ?? 0.25})` }} 
        />
      )}
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6" style={{ color: content.textColor || '#111827' }}>
          {content.title}
        </h1>
        <p className="text-xl mb-8" style={{ color: content.textColor ? content.textColor + 'e6' : '#4b5563' }}>
          {content.subtitle}
        </p>
        <button className="px-8 py-4 rounded-xl text-white font-medium text-lg shadow-lg" style={{ backgroundColor: theme.primaryColor }}>
          {content.buttonText || 'View Jobs'}
        </button>
      </div>
    </div>
  )
}

const RenderAbout = ({ content }: { content: any }) => (
  <div className="py-16 px-8 max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-6">{content.headline}</h2>
    <p className="text-lg text-gray-600 leading-relaxed">{content.body}</p>
  </div>
)

const RenderJobs = ({ content, theme, pageId }: { content: any, theme: any, pageId?: string }) => {
  const [jobs, setJobs] = useState<any[]>([])
  
  useEffect(() => {
    if (!pageId) return
    const fetchJobs = async () => {
      const supabase = createClient()
      const { data: page } = await supabase.from('pages').select('company_id').eq('id', pageId).single()
      if (page?.company_id) {
        const { data } = await supabase.from('jobs').select('*').eq('company_id', page.company_id).eq('status', 'Active')
        if (data) {
          const keywordFilter = content.keywordFilter?.trim()?.toLowerCase()
          if (keywordFilter) {
            setJobs(data.filter((j: any) => j.keyword?.toLowerCase()?.includes(keywordFilter)))
          } else {
            setJobs(data)
          }
        }
      }
    }
    fetchJobs()
  }, [pageId])

  return (
    <div className="py-16 px-8 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h2>
        <p className="text-gray-500 mb-8">{content.subtitle}</p>
        
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            <p>No open roles at the moment. Jobs added to this project will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50 flex justify-between items-center group hover:border-gray-300 transition-colors cursor-pointer">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                  <p className="text-gray-500 mt-1">{job.location} • {job.type}</p>
                </div>
                <div className="px-5 py-2.5 rounded-lg text-white font-medium transition-transform group-hover:scale-105" style={{ backgroundColor: theme.primaryColor }}>
                  Apply
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const RenderCulture = ({ content }: { content: any }) => (
  <div className="py-16 px-8 bg-gray-900 text-white rounded-3xl mx-4 my-6">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">{content.headline}</h2>
      <p className="text-lg text-gray-300 leading-relaxed mb-10">{content.body}</p>
      {/* Mock Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {content.images && content.images.length > 0 ? (
          content.images.map((img: string, i: number) => (
            <div key={i} className="h-48 bg-white/10 rounded-xl overflow-hidden relative border border-white/10">
              <img src={img} alt={`Culture ${i}`} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))
        ) : (
          <>
            <div className="h-48 bg-white/10 rounded-xl border border-white/10"></div>
            <div className="h-48 bg-white/10 rounded-xl border border-white/10"></div>
            <div className="h-48 bg-white/10 rounded-xl border border-white/10 hidden md:block"></div>
          </>
        )}
      </div>
    </div>
  </div>
)

const RenderBenefits = ({ content, theme }: { content: any, theme: any }) => (
  <div className="py-16 px-8 max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">{content.title}</h2>
    <div className="grid sm:grid-cols-3 gap-6">
      {(content.items || []).map((item: string, i: number) => (
        <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-start break-words whitespace-normal overflow-hidden shadow-sm">
          <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white shrink-0" style={{ backgroundColor: theme.primaryColor }}>✓</div>
          <p className="font-semibold text-gray-900 text-sm break-words leading-relaxed w-full min-w-0">{item}</p>
        </div>
      ))}
    </div>
  </div>
)

// Sortable Item Component
function SortableSection({ section }: { section: BuilderSection }) {
  const { theme, selectedSectionId, selectSection, removeSection } = useBuilderStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isSelected = selectedSectionId === section.id

  const renderContent = () => {
    switch(section.type) {
      case 'hero': return <RenderHero content={section.content} theme={theme} />
      case 'about': return <RenderAbout content={section.content} />
      case 'jobs': return <RenderJobs content={section.content} theme={theme} pageId={useBuilderStore.getState().pageId || undefined} />
      case 'culture': return <RenderCulture content={section.content} />
      case 'benefits': return <RenderBenefits content={section.content} theme={theme} />
      default: return <div>Unknown section</div>
    }
  }

  return (
    <div 
      ref={setNodeRef} 
      className={`relative group transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-2 z-10' : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 z-0'}`}
      style={{ ...style, '--tw-ring-color': isSelected ? theme.primaryColor : undefined } as any}
      onClick={() => selectSection(section.id)}
    >
      {/* Controls Overlay */}
      <div className={`absolute top-4 right-4 flex items-center gap-1 bg-white shadow-lg rounded-lg border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isSelected ? 'opacity-100' : ''}`}>
        <button 
          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button 
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className={`pointer-events-none md:pointer-events-auto ${isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`}>
        {renderContent()}
      </div>
    </div>
  )
}

export default function LivePreview() {
  const { sections, reorderSections, theme } = useBuilderStore()
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id)
      const newIndex = sections.findIndex(s => s.id === over.id)
      reorderSections(arrayMove(sections, oldIndex, newIndex))
    }
  }
  const availableLinks: string[] = []
  if (sections.some((s: any) => s.type === 'about')) availableLinks.push('About')
  if (sections.some((s: any) => s.type === 'culture')) availableLinks.push('Culture')
  if (sections.some((s: any) => s.type === 'benefits')) availableLinks.push('Benefits')
  if (sections.some((s: any) => s.type === 'jobs')) availableLinks.push('Jobs')

  const primaryColor = theme.primaryColor || '#5138EE'
  const fontStyle = { fontFamily: `"${theme.font || 'Inter'}", sans-serif` }

  return (
    <div className="w-full h-[90vh] overflow-y-auto bg-slate-50" style={fontStyle}>
      {/* Simulated Browser Bar */}
      <div className="w-full h-12 bg-white flex items-center px-4 border-b border-gray-200 sticky top-0 z-50 rounded-t-lg">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="mx-auto text-sm text-gray-500 font-medium">Live Preview</div>
      </div>

      <div className="relative w-full min-h-[800px] bg-white pt-24 pb-32 shadow-xl border-x border-b border-gray-200 rounded-b-lg">
        
        {/* Floating Pill Navbar Wrapper */}
        <div className="absolute top-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <nav className="pointer-events-auto bg-white/90 backdrop-blur-lg border border-gray-200/60 shadow-xl shadow-black/5 rounded-full px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-6 md:gap-12 transition-all w-max max-w-[95%] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 pl-2 overflow-hidden shrink-0">
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="h-6 object-contain" />
              ) : (
                <div className="font-bold text-lg tracking-tight text-gray-900 truncate">Company Logo</div>
              )}
            </div>
            
            {availableLinks.length > 0 && (
              <div className="hidden md:flex items-center gap-4 lg:gap-6 font-medium text-xs text-gray-500">
                {availableLinks.map(link => (
                  <span key={link} className="hover:text-gray-900 transition-colors cursor-pointer">
                    {link}
                  </span>
                ))}
              </div>
            )}
  
            <button className="px-4 py-2 rounded-full text-white text-xs font-bold shadow-md flex-shrink-0 ml-4" style={{ backgroundColor: primaryColor }}>
              View Roles
            </button>
          </nav>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="min-h-[500px]">
               {sections.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                   <p>No sections added yet.</p>
                   <p className="text-sm mt-1">Add sections from the Left Panel.</p>
                 </div>
               ) : (
                 sections.map(section => <SortableSection key={section.id} section={section} />)
               )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Dynamic Footer Preview */}
        <div className="py-16 border-t border-gray-100 mt-20 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 text-2xl">
            💬
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Get in Touch</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {theme.contactText || 'Have questions about our hiring process? Reach out to our team.'}
          </p>
          <div className="px-6 py-3 rounded-full font-medium inline-block mb-16 transition-transform hover:scale-105" style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}>
            {theme.contactEmail || 'careers@company.com'}
          </div>
          
          <div className="flex justify-center items-center text-gray-400 text-sm gap-2">
            <p>Built with</p>
            <span className="transition-opacity opacity-80">
              <img src="/logo.png" alt="Whitecarrot" className="h-5 object-contain" />
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
