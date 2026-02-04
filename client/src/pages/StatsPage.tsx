import { StatsOverview } from '@/components/stats/StatsOverview';

export function StatsPage() {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-1">Reading Stats</h2>
          <p className="text-text-secondary text-sm">Your reading activity at a glance.</p>
        </div>
        <StatsOverview />
      </div>
    </div>
  );
}
