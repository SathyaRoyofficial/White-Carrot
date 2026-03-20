import { create } from 'zustand'

export type SectionType = 'hero' | 'about' | 'jobs' | 'culture' | 'benefits'

export interface BuilderSection {
  id: string
  type: SectionType
  content: Record<string, any>
  order_index: number
}

export interface ThemeSettings {
  primaryColor: string
  font: string
  tagline: string
  logoUrl?: string
  bannerUrl?: string
  contactEmail?: string
  contactText?: string
}

interface BuilderState {
  pageId: string | null
  theme: ThemeSettings
  sections: BuilderSection[]
  selectedSectionId: string | null
  activeTab: 'theme' | 'sections' // Left panel active tab
  
  // Actions
  setInitialData: (pageId: string, theme: ThemeSettings, sections: BuilderSection[]) => void
  updateTheme: (updates: Partial<ThemeSettings>) => void
  addSection: (type: SectionType) => void
  removeSection: (id: string) => void
  updateSection: (id: string, contentUpdates: Record<string, any>) => void
  reorderSections: (newSections: BuilderSection[]) => void
  selectSection: (id: string | null) => void
  setActiveTab: (tab: 'theme' | 'sections') => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  pageId: null,
  theme: {
    primaryColor: '#5138EE',
    font: 'Inter',
    tagline: 'Build the future with us'
  },
  sections: [],
  selectedSectionId: null,
  activeTab: 'sections',

  setInitialData: (pageId, theme, sections) => set({ 
    pageId, 
    theme: { ...theme }, 
    sections: sections.sort((a,b) => a.order_index - b.order_index) 
  }),

  updateTheme: (updates) => set((state) => ({
    theme: { ...state.theme, ...updates }
  })),

  addSection: (type) => set((state) => {
    const newSection: BuilderSection = {
      id: `new-${Date.now()}`, // Temporary ID until saved to DB
      type,
      content: getDefaultContent(type),
      order_index: state.sections.length
    }
    return { sections: [...state.sections, newSection], selectedSectionId: newSection.id }
  }),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter(s => s.id !== id),
    selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId
  })),

  updateSection: (id, contentUpdates) => set((state) => ({
    sections: state.sections.map(s => 
      s.id === id ? { ...s, content: { ...s.content, ...contentUpdates } } : s
    )
  })),

  reorderSections: (newSections) => set({
    sections: newSections.map((s, idx) => ({ ...s, order_index: idx }))
  }),

  selectSection: (id) => set({ selectedSectionId: id }),

  setActiveTab: (tab) => set({ activeTab: tab })
}))

function getDefaultContent(type: SectionType) {
  switch (type) {
    case 'hero':
      return { title: 'Join Our Team', subtitle: 'Help us build the future.', buttonText: 'View Open Roles' }
    case 'about':
      return { headline: 'About Us', body: 'We are a fast-growing company on a mission...' }
    case 'jobs':
      return { title: 'Open Roles', subtitle: 'Find your next career opportunity here.' }
    case 'culture':
      return { headline: 'Life at the Company', body: 'We value creativity and innovation.' }
    case 'benefits':
      return { title: 'Our Benefits', items: ['Flexible Hours', 'Health Insurance', 'Remote First'] }
    default:
      return {}
  }
}
