import { useMemo, useState } from 'react';
import { Alert, Button, Card, Skeleton, Tabs } from '@/components/common';
import { ActivityList } from '@/components/features/dashboard/ActivityList';
import { LineChart } from '@/components/features/dashboard/LineChart';
import { MetricCard, MetricCardSkeleton } from '@/components/features/dashboard/MetricCard';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDashboard } from '@/hooks/useDashboard';
import { useCurrentUser } from '@/stores/authStore';
import { formatCompact } from '@/utils/format';

const currencyCompact = (v: number) => `$${formatCompact(v)}`;

/** Container: owns data fetching and passes plain props to presentational children. */
export default function DashboardPage() {
  const user = useCurrentUser();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const [chartTab, setChartTab] = useState('revenue');

  const labels = useMemo(() => data?.trend.map((p) => p.label) ?? [], [data]);
  const revenue = useMemo(() => data?.trend.map((p) => p.revenue) ?? [], [data]);
  const orders = useMemo(() => data?.trend.map((p) => p.orders) ?? [], [data]);

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}. Here's how the platform is doing.`} />

      {isError && (
        <Alert variant="error" title="Couldn't load dashboard" className="mb-6">
          <p>{error.message}</p>
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      <section aria-labelledby="kpi-heading" aria-busy={isLoading}>
        <h2 id="kpi-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} />) : data?.metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" aria-labelledby="trend-heading">
          <Card.Header title="Trends — last 12 months" titleId="trend-heading" />
          <Card.Body>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Tabs
                label="Trend metric"
                value={chartTab}
                onChange={setChartTab}
                items={[
                  {
                    id: 'revenue',
                    label: 'Revenue',
                    content: (
                      <LineChart
                        labels={labels}
                        series={[{ key: 'revenue', label: 'Revenue (USD)', colorClass: 'text-brand-600 dark:text-brand-400', values: revenue }]}
                        summary={`Monthly revenue from ${labels[0]} to ${labels[labels.length - 1]}, rising from ${currencyCompact(revenue[0] ?? 0)} to ${currencyCompact(revenue[revenue.length - 1] ?? 0)}.`}
                        formatValue={currencyCompact}
                      />
                    ),
                  },
                  {
                    id: 'orders',
                    label: 'Orders',
                    content: (
                      <LineChart
                        labels={labels}
                        series={[{ key: 'orders', label: 'Orders', colorClass: 'text-emerald-600 dark:text-emerald-400', values: orders }]}
                        summary={`Monthly orders from ${labels[0]} to ${labels[labels.length - 1]}, from ${orders[0] ?? 0} to ${orders[orders.length - 1] ?? 0}.`}
                      />
                    ),
                  },
                ]}
              />
            )}
          </Card.Body>
        </Card>

        <div className="flex flex-col gap-6">
          <Card aria-labelledby="actions-heading">
            <Card.Header title="Quick actions" titleId="actions-heading" />
            <Card.Body>
              <QuickActions />
            </Card.Body>
          </Card>
          <Card aria-labelledby="activity-heading">
            <Card.Header title="Recent activity" titleId="activity-heading" />
            <Card.Body>
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <ActivityList items={data?.activity ?? []} />
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
}
