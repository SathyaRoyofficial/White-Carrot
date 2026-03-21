'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase } from 'lucide-react'

export default function JobBoardClient({ jobs, theme, perPageCount, companySlug }: { jobs: any[], theme: any, perPageCount: number, companySlug: string }) {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const uniqueLocations = useMemo(() => Array.from(new Set(jobs.map((j: any) => j.location).filter(Boolean))), [jobs])
  const uniqueTypes = useMemo(() => Array.from(new Set(jobs.map((j: any) => j.type).filter(Boolean))), [jobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const matchSearch = search ? job.title.toLowerCase().includes(search.toLowerCase()) || job.department?.toLowerCase().includes(search.toLowerCase()) : true
      const matchLoc = location ? job.location === location : true
      const matchType = type ? job.type === type : true
      return matchSearch && matchLoc && matchType
    })
  }, [jobs, search, location, type])

  const displayedJobs = filteredJobs.slice(0, page * perPageCount)

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search roles or departments..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5138EE] transition-colors bg-gray-50/50 focus:bg-white text-gray-900 shadow-inner shadow-gray-100/50"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5138EE] transition-colors bg-gray-50/50 focus:bg-white appearance-none text-gray-900 shadow-inner shadow-gray-100/50"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((loc: any) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div className="w-full md:w-64 relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5138EE] transition-colors bg-gray-50/50 focus:bg-white appearance-none text-gray-900 shadow-inner shadow-gray-100/50"
          >
            <option value="">All Types</option>
            {uniqueTypes.map((t: any) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {displayedJobs.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xl mb-2">🔍</p>
          <p className="text-lg">No open roles found matching your filters. Try adjusting them!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedJobs.map((job: any) => (
            <div key={job.id} className="p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-lg transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 transition-colors mb-2" style={{ color: theme.primaryColor }}>
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-gray-500 font-medium mt-3">
                  {job.location && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
                  )}
                  {job.department && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">{job.department}</span>
                  )}
                </div>
                
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills.slice(0, 4).map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-[#5138EE]/5 text-[#5138EE] border border-[#5138EE]/10 text-sm rounded-full font-semibold">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-sm rounded-full font-medium">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <Link 
                href={job.apply_link || `/${companySlug}/jobs/${job.id}`}
                target={job.apply_link ? "_blank" : undefined}
                className="w-full sm:w-auto text-center px-8 py-4 rounded-xl text-white font-bold transition-transform hover:scale-105 shrink-0 shadow-md hover:shadow-lg z-10" 
                style={{ backgroundColor: theme.primaryColor || '#5138EE' }}
              >
                Apply Now
              </Link>
            </div>
          ))}
          
          {displayedJobs.length < filteredJobs.length && (
            <div className="pt-8 text-center">
              <button 
                onClick={() => setPage(page + 1)}
                className="inline-block px-10 py-3 rounded-full font-bold transition-all hover:scale-105 hover:bg-gray-50 bg-white"
                style={{ border: `2px solid ${theme.primaryColor || '#5138EE'}`, color: theme.primaryColor || '#5138EE' }}
              >
                Load More Roles
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
