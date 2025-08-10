import Link from 'next/link';
import { ArrowRight } from 'lucide-react'; // Changed from ArrowRightIcon

export default function Page() {
  return (
    <main className="relative min-h-[80vh] flex flex-col items-center justify-center px-2 py-8">
      {/* Animated Gradient Background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90"
      />
      {/* Floating Glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl z-0 w-[60vw] h-[40vw] rounded-full bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-sky-400/10 animate-pulse"
      />

      {/* Hero Header */}
      <header className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
          <span
            className="inline-block"
            style={{
              background:
                'linear-gradient(90deg,#a5b4fc,#f472b6,#38bdf8,#a5b4fc)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: 'gradient-move 4s ease-in-out infinite',
            }}
          >
            Shared Food Budget
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          The Budget Planner for meals
        </p>
      </header>

      {/* Card with animated hover */}
      <section className="relative z-10 w-full max-w-md mx-auto">
        <div className="card gradient-card p-6 shadow-xl transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl group">
          <h2 className="font-semibold mb-3 text-xl text-gradient bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
            Get Started
          </h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/setup"
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-background/60 hover:bg-indigo-900/60 hover:text-white font-medium group/link"
              >
                <span className="transition-colors duration-200 group-hover/link:text-indigo-300">
                  Create users
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover/link:translate-x-1 group-hover/link:text-indigo-200 transition-transform duration-200" />
              </Link>
            </li>
            <li>
              <Link
                href="/groceries"
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-background/60 hover:bg-fuchsia-900/60 hover:text-white font-medium group/link"
              >
                <span className="transition-colors duration-200 group-hover/link:text-fuchsia-300">
                  Log groceries
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover/link:translate-x-1 group-hover/link:text-fuchsia-200 transition-transform duration-200" />
              </Link>
            </li>
            <li>
              <Link
                href="/schedule"
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-background/60 hover:bg-sky-900/60 hover:text-white font-medium group/link"
              >
                <span className="transition-colors duration-200 group-hover/link:text-sky-300">
                  Set meal schedule
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover/link:translate-x-1 group-hover/link:text-sky-200 transition-transform duration-200" />
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-background/60 hover:bg-gradient-to-r hover:from-indigo-800 hover:to-fuchsia-800 hover:text-white font-medium group/link"
              >
                <span className="transition-colors duration-200 group-hover/link:text-indigo-200">
                  View dashboard
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover/link:translate-x-1 group-hover/link:text-indigo-100 transition-transform duration-200" />
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
