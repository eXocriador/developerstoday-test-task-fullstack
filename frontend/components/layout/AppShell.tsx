'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import clsx from 'clsx';

const navigation = [
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/create', label: 'Create Quiz' },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();

  const activePath = useMemo(() => {
    if (!pathname) {
      return '/quizzes';
    }
    if (pathname.startsWith('/create')) {
      return '/create';
    }
    if (pathname.startsWith('/quizzes')) {
      return '/quizzes';
    }
    return pathname;
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[6%] top-[-8%] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-[-10%] top-[30%] h-72 w-72 rounded-full bg-fuchsia-500/15 blur-[140px] sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute inset-x-0 bottom-[-30%] h-80 bg-gradient-to-t from-slate-900 via-slate-950 to-transparent opacity-80" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/quizzes"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 transition hover:text-cyan-300"
          >
            Quiz Builder
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            {navigation.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70',
                  activePath === href
                    ? 'bg-cyan-500 text-slate-900 shadow-[0_10px_40px_-20px_rgba(56,189,248,0.5)]'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
};

export default AppShell;
