'use client';

import React, { useActionState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Handshake, AlertCircle, Sparkles, Loader2, KeyRound } from 'lucide-react';
import { loginAction, AuthActionState } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const initialState: AuthActionState = {
  success: false,
  message: '',
  fieldErrors: {},
};

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md mx-auto py-8 sm:py-12">
      <Card className="border-stone-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-600/30 w-fit mb-3">
            <Handshake className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-black">Zaloguj się do Barter</CardTitle>
          <CardDescription>
            Wypożyczaj sprzęt od sąsiadów w Rzeszowie lub wystawiaj własne narzędzia.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} noValidate className="space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />

            {state.message && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{state.message}</span>
              </div>
            )}

            <Input
              label="Adres e-mail"
              type="email"
              name="email"
              placeholder="np. jan.kowalski@example.com"
              required
              autoComplete="email"
              error={state.fieldErrors?.email?.[0]}
            />

            <Input
              label="Hasło"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              error={state.fieldErrors?.password?.[0]}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isPending}
            >
              <LogIn className="w-4 h-4" /> Zaloguj się
            </Button>
          </form>

          {/* SZYBKIE LOGOWANIE DLA ŚRODOWISKA DEV */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-stone-400 font-medium">
              <KeyRound className="w-3.5 h-3.5 text-orange-500" />
              <span>Konta testowe (hasło: <code className="text-orange-400 font-mono">haslo1234</code>):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { email: 'marek.kowalski@barter.local', label: 'Marek (Wiertarka)' },
                { email: 'anna.nowak@barter.local', label: 'Anna (Kärcher)' },
                { email: 'piotr.wisniewski@barter.local', label: 'Piotr (Glebogryzarka)' },
                { email: 'jan.kowalski@example.com', label: 'Jan (Wypożyczający)' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
                    const passInput = document.querySelector<HTMLInputElement>('input[name="password"]');
                    if (emailInput && passInput) {
                      emailInput.value = acc.email;
                      passInput.value = 'haslo1234';
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-300 hover:text-white hover:border-orange-500/50 hover:bg-stone-800 transition text-left cursor-pointer flex flex-col"
                >
                  <span className="font-semibold text-stone-200">{acc.label}</span>
                  <span className="text-[10px] text-stone-500 font-mono truncate">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-stone-800/80 py-4 text-xs text-stone-400">
          <span>Nie masz jeszcze konta?</span>
          <Link
            href={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-orange-400 font-semibold hover:text-orange-300 ml-1"
          >
            Zarejestruj się bezpłatnie
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-sm font-medium">Ładowanie formularza logowania...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
