'use client';

import React, { useActionState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Handshake, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { registerAction, AuthActionState } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const initialState: AuthActionState = {
  success: false,
  message: '',
  fieldErrors: {},
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className="w-full max-w-lg mx-auto py-6 sm:py-10">
      <Card className="border-stone-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-600/30 w-fit mb-3">
            <Handshake className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-black">Dołącz do społeczności Barter</CardTitle>
          <CardDescription>
            Zarejestruj się, aby wypożyczać narzędzia od sąsiadów w Rzeszowie i oferować własny sprzęt.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} noValidate className="space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />

            {state.message && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 shadow-md">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{state.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Imię i nazwisko / Pseudonim"
                name="name"
                placeholder="np. Michał Wiśniewski"
                autoComplete="name"
                error={state.fieldErrors?.name?.[0]}
              />

              <Input
                label="Adres e-mail"
                type="email"
                name="email"
                placeholder="np. michal@example.com"
                autoComplete="email"
                error={state.fieldErrors?.email?.[0]}
              />
            </div>

            <Input
              label="Hasło (min. 8 znaków)"
              type="password"
              name="password"
              placeholder="Minimum 8 znaków"
              autoComplete="new-password"
              error={state.fieldErrors?.password?.[0]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dzielnica / Osiedle (Rzeszów)"
                name="neighborhood"
                placeholder="np. Nowe Miasto, Drabinianka"
                helperText="Widoczne dla sąsiadów w katalogu"
                error={state.fieldErrors?.neighborhood?.[0]}
              />

              <Input
                label="Dokładny adres i telefon"
                name="exactAddress"
                placeholder="ul. Hetmańska 10/4, tel. 601..."
                helperText="Widoczne tylko po opłaceniu rezerwacji"
                error={state.fieldErrors?.exactAddress?.[0]}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Rejestrując się, akceptujesz zasady ekonomii współdzielenia, 15% opłaty serwisowej oraz weryfikację odbiorem kodem PIN.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isPending}
            >
              <UserPlus className="w-4 h-4" /> Zarejestruj konto i zaloguj
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-stone-800/80 py-4 text-xs text-stone-400">
          <span>Masz już konto w Barter?</span>
          <Link
            href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-orange-400 font-semibold hover:text-orange-300 ml-1"
          >
            Zaloguj się
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-sm font-medium">Ładowanie formularza rejestracji...</span>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
