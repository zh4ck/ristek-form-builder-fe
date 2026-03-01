import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full bg-white relative overflow-hidden py-24 sm:py-32 flex flex-col items-center text-center">
        {/* Decorative Background Blob */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 z-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl mb-8">
            Create Beautiful Forms in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Seconds
            </span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto mb-10">
            Design dynamic surveys, collect real-time respondent data, and manage your questions effortlessly with our modern intuitive Form Builder layout.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="bg-white border hover:bg-gray-50 transition-all duration-300">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="w-full bg-gray-50 py-20 px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-500">Built deeply on Next.js and Prisma, ensuring your form renders responsively near instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure by Default</h3>
              <p className="text-gray-500">Encrypted passwords and JWT verified endpoints protect your builder architecture organically.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Atomic UI Components</h3>
              <p className="text-gray-500">Designed with reusable aesthetic Tailwind CSS blocks maximizing flexibility and beauty.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
