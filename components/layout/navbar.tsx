'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Handshake,
  Wrench,
  PlusCircle,
  KeyRound,
  Search,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  UserPlus,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth.actions';

export interface NavbarProps {
  user?: SessionUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    {
      href: '/',
      label: 'Katalog',
      icon: Wrench,
      active: pathname === '/',
    },
    {
      href: '/items/new',
      label: 'Wystaw sprzęt',
      icon: PlusCircle,
      active: pathname === '/items/new',
    },
    {
      href: '/dashboard',
      label: 'Moje wypożyczenia',
      icon: KeyRound,
      active: pathname.startsWith('/dashboard'),
    },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      window.location.href = '/login';
    } catch (err) {
      console.error('Błąd wylogowywania:', err);
      setIsLoggingOut(false);
    }
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/90 bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* LOGO BARTER */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bg-orange-600 p-2 sm:p-2.5 rounded-xl text-white shadow-lg shadow-orange-600/30 group-hover:bg-orange-500 transition-colors">
              <Handshake className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  Barter
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-600/20 text-orange-400 border border-orange-500/30">
                  Rzeszów
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-stone-400 font-medium">
                Sąsiedzkie wypożyczalnie P2P
              </span>
            </div>
          </Link>

          {/* WYSZUKIWARKA GLOBALNA (DESKTOP / TABLET) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm lg:max-w-md relative items-center"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj wiertarki, drabiny, myjki..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900/90 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
          </form>

          {/* GŁÓWNA NAWIGACJA DESKTOP */}
          <nav className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 select-none',
                    link.active
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900 border border-transparent hover:border-stone-800'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* SEKCJA UŻYTKOWNIKA / AUTH DESKTOP */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-stone-850">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-stone-700 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate max-w-[120px] flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                      <span>{user.neighborhood || 'Rzeszów'}</span>
                    </div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={isLoggingOut}
                  className="text-stone-400 hover:text-red-400 hover:bg-red-950/20"
                  title="Wyloguj się"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" /> Zaloguj się
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    <UserPlus className="w-4 h-4" /> Rejestracja
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* PRZYCISK HAMBURGER MENU (MOBILE) */}
          <div className="flex items-center lg:hidden gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="border-stone-800 text-stone-300 hover:text-white"
              aria-label="Otwórz menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* WYSZUKIWARKA MOBILNA (WIDOCZNA PONIŻEJ MD) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj sprzętu w Rzeszowie..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </form>
        </div>
      </div>

      {/* ROZWIJANE MENU MOBILNE */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-800 bg-stone-950/98 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* Status profilu w menu mobilnym */}
          {user ? (
            <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-400 font-bold text-sm flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-stone-400">{user.email}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="text-red-400 border-red-500/30 hover:bg-red-950/30"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-800">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  <LogIn className="w-4 h-4" /> Zaloguj się
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  <UserPlus className="w-4 h-4" /> Rejestracja
                </Button>
              </Link>
            </div>
          )}

          {/* Linki nawigacyjne */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3',
                    link.active
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900 border border-stone-800/60'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
