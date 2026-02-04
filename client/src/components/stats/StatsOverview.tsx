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

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(month: string): string {
  const parts = month.split('-');
  if (parts.length === 2) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0].slice(2);
    return `${monthNames[monthIdx] ?? parts[1]} '${year}`;
  }
  return month;
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
          <h3 className="text-sm font-medium text-text-primary mb-4">Books added by month</h3>
          <div className="flex items-end gap-2">
            <div className="flex flex-col justify-between h-48 text-[10px] text-text-secondary pr-2 shrink-0">
              <span>{maxCount}</span>
              <span>{Math.round(maxCount / 2) || ''}</span>
              <span>0</span>
            </div>
            <div className="flex items-end gap-2 flex-1 h-48 border-l border-b border-border pl-2 pb-1">
              {stats.books_by_month.map(({ month, count }) => (
                <div key={month} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <span className="text-xs text-text-primary font-medium">{count > 0 ? count : ''}</span>
                  <div
                    className="w-full bg-accent/70 rounded-t transition-all"
                    style={{ height: count > 0 ? `max(${(count / maxCount) * 100}%, 16px)` : '0px' }}
                  />
                  <span className="text-[10px] text-text-secondary whitespace-nowrap">{formatMonth(month)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
