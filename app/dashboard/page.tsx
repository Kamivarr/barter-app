import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getUserDashboardDataAction } from '@/app/actions/rental.actions';
import { DashboardClientView } from '@/components/dashboard/dashboard-client-view';

export const metadata = {
  title: 'Pulpit Sąsiedzki – Barter Rzeszów',
  description: 'Zarządzaj swoimi wypożyczeniami, wnioskami sąsiadów i wystawionymi narzędziami.',
};

interface DashboardPageProps {
  searchParams: Promise<{ tab?: string }>;
}

async function DashboardDataLoader({ searchParamsPromise }: { searchParamsPromise: DashboardPageProps['searchParams'] }) {
  const resolvedParams = await searchParamsPromise;
  const data = await getUserDashboardDataAction();

  return (
    <DashboardClientView
      initialData={data}
      initialTab={resolvedParams.tab}
    />
  );
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-sm font-medium">Ładowanie Twojego pulpitu Barter...</span>
        </div>
      }
    >
      <DashboardDataLoader searchParamsPromise={searchParams} />
    </Suspense>
  );
}
