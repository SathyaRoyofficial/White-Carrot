import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Whitecarrot" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/login">
            <Button className="bg-[#5138EE] hover:bg-[#432dd4]">
              Start Building &rarr;
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-24 text-center">
        <div className="inline-flex items-center rounded-full border border-[#5138EE]/20 bg-[#5138EE]/5 px-3 py-1 text-sm font-medium text-[#5138EE] mb-8">
          🚀 The Spotify-like experience for hiring
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 w-full max-w-4xl mx-auto leading-tight">
          Hiring Made Easy. <br/>
          <span className="text-[#5138EE]">Build beautiful careers pages</span><br/> in minutes.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 w-full max-w-2xl mx-auto">
          Instead of boring ATS pages, create interactive, branded, and storytelling career environments that candidates actually want to read.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-lg bg-[#5138EE] hover:bg-[#432dd4] shadow-xl shadow-[#5138EE]/20">
              Start Building Your Careers Page
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg hover:bg-gray-50">
            View Candidate Demo
          </Button>
        </div>

        {/* Features Preview */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 text-xl">
              🎨
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Custom Branding</h3>
            <p className="text-sm text-gray-500">Inject your brand colors, fonts, and culture seamlessly.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 text-xl">
              ⚡
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Instant Pages</h3>
            <p className="text-sm text-gray-500">Use our visual drag-and-drop builder to launch in minutes.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 text-xl">
              📱
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Mobile-first</h3>
            <p className="text-sm text-gray-500">Looks stunning on every device, optimized for mobile traffic.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 text-xl">
              🔗
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Shareable Links</h3>
            <p className="text-sm text-gray-500">Custom slugs like /tesla/careers ready to be shared instantly.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
