import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">FlickFuse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Streaming Recommendations,{' '}
              <span className="text-[#2563EB]">All in One Place</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600">
              Aggregate viewing from Netflix, Prime Video, and Hotstar.
              Get AI-powered recommendations. Share taste with friends privately.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Button variant="secondary" size="lg">Learn More</Button>
            </div>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#DBEAFE] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Import Your Watch History</h3>
              <p className="mt-2 text-gray-600">Easily import viewing data from Netflix, Prime Video, and Hotstar.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#DBEAFE] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered Recommendations</h3>
              <p className="mt-2 text-gray-600">Get personalized suggestions based on your unique taste profile.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#DBEAFE] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Share With Friends</h3>
              <p className="mt-2 text-gray-600">Discover what your friends are watching and find common interests.</p>
            </div>
          </div>

          <div className="mt-20 bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E50914] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="font-semibold text-gray-700">Netflix</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00A8E1] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-semibold text-gray-700">Prime Video</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#D4AF37] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-gray-700">Hotstar</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to discover your next favorite show?</h2>
              <p className="mt-4 text-gray-400">Join thousands of users who trust FlickFuse for their streaming recommendations.</p>
              <div className="mt-8">
                <Link to="/signup">
                  <Button size="lg">Start For Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2563EB] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold text-gray-900">FlickFuse</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">About</a>
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
