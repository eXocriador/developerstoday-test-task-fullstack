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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/quizzes" className="text-xl font-semibold tracking-tight">
            Quiz Builder
          </Link>
          <nav className="flex gap-1 text-sm font-medium">
            {navigation.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'rounded-full px-4 py-2 transition-colors',
                  activePath === href
                    ? 'bg-cyan-500 text-slate-900'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default AppShell;

