import { useState, useEffect } from 'react';
import type { ReadingStats } from '@/types/stats';
import { getReadingStats } from '@/api/books';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 bg-surface-raised border border-border rounded-lg">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  );
}

export function StatsOverview() {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReadingStats()
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-text-secondary text-center py-8">Failed to load stats.</p>;
  }

  const maxCount = Math.max(...stats.books_by_month.map(m => m.count), 1);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total books" value={stats.total_books} color="#6366f1" />
        <StatCard label="Currently reading" value={stats.books_reading} color="#22c55e" />
        <StatCard label="Finished" value={stats.books_finished} color="#3b82f6" />
        <StatCard label="Abandoned" value={stats.books_abandoned} color="#ef4444" />
        <StatCard label="Conversations" value={stats.total_conversations} color="#a855f7" />
        <StatCard label="Messages" value={stats.total_messages} color="#f59e0b" />
      </div>

      {stats.books_by_month.length > 0 && (
        <div className="p-4 bg-surface-raised border border-border rounded-lg">
          <h3 className="text-sm font-medium text-text-primary mb-3">Books added by month</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.books_by_month.map(({ month, count }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-accent/60 rounded-t min-h-[4px] transition-all"
                  style={{ height: `${(count / maxCount) * 100}%` }}
                />
                <span className="text-[10px] text-text-secondary">{month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
