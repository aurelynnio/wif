import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  trend,
  loading,
  color = 'neutral',
  iconBgClass,
}) => {
  const colorStyles = {
    neutral:
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
    primary:
      'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900',
    success:
      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning:
      'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  const trendBadgeClass =
    trend === 'up'
      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500';

  return (
    <Card
      role="group"
      aria-label={title}
    >
      <CardHeader className="flex flex-row items-start justify-between !py-0">
        <div
          className={`p-2.5 rounded-xl ${
            iconBgClass ? iconBgClass : colorStyles[color]
          }`}
        >
          {Icon && <Icon size={18} strokeWidth={1.5} />}
        </div>

        {!loading && change && (
          <Badge className={`flex items-center gap-1 text-xs font-semibold ${trendBadgeClass}`}>
            {trend === 'up' && <TrendingUp size={12} strokeWidth={2} />}
            {trend === 'down' && <TrendingDown size={12} strokeWidth={2} />}
            {change}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-1">
        {loading ? (
          <>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-28" />
          </>
        ) : (
          <>
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-1">
              {title}
            </CardTitle>
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-white tracking-tight">
              {value}
            </h3>
          </>
        )}
      </CardContent>
    </Card>
  );
};


export default StatCard;