import { useState, useMemo } from 'react';
import {
  Users,
  FileText,
  MessageSquare,
  ArrowUpRight,
  RefreshCcw,
  Activity,
  TrendingUp,
} from 'lucide-react';

import {
  useDashboardStats,
  useUserGrowth,
  useTopUsers,
} from '@/hooks/useAdminQuery';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import UserGrowthChart from './UserGrowthChart';
import StatCard from '../Shared/StatCard';

const Dashboard = () => {
  const [period, setPeriod] = useState(30);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - period);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [period]);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: topUsersData,
    isLoading: usersLoading,
    refetch: refetchTopUsers,
  } = useTopUsers(1, 5);

  const topUsers = Array.isArray(topUsersData)
    ? topUsersData
    : topUsersData?.users || [];

  const { data: growthData } = useUserGrowth(startDate, endDate);

  const handleRefresh = () => {
    refetchStats();
    refetchTopUsers();
  };

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.users?.total?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Bài viết mới',
      value: stats?.posts?.total?.toLocaleString() || '0',
      change: '+8.2%',
      trend: 'up',
      icon: FileText,
      color: 'success',
    },
    {
      title: 'Bình luận',
      value: stats?.comments?.total?.toLocaleString() || '0',
      change: '-2.4%',
      trend: 'down',
      icon: MessageSquare,
      color: 'warning',
    },
    {
      title: 'Lượt tương tác',
      value: stats?.interactions?.total?.toLocaleString() || '0',
      change: '+24.5%',
      trend: 'up',
      icon: Activity,
      color: 'danger',
    },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Tổng quan
          </p>
          <h2 className="text-2xl font-semibold text-content">
            Xin chào! 👋
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Tổng quan hoạt động hôm nay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(period)}
            onValueChange={value => setPeriod(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
              <SelectItem value="90">90 ngày</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted"
            aria-label="Tải lại"
          >
            <RefreshCcw
              size={18}
              strokeWidth={1.5}
              className={statsLoading ? 'animate-spin' : ''}
            />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            trend={stat.trend}
            color={stat.color}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Growth Chart */}
        <div className="lg:col-span-2 admin-card p-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-content">
                Tăng trưởng người dùng
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-semibold text-content">
                  {growthData?.totalGrowth || 0}
                </span>
                <span className="admin-pill admin-pill-success">
                  +{growthData?.percentage || 0}%
                </span>
              </div>
            </div>
            <div className="p-2 bg-muted rounded-xl text-muted-foreground">
              <TrendingUp size={18} strokeWidth={1.6} />
            </div>
          </div>
          <div className="h-[240px] w-full">
            <UserGrowthChart data={growthData?.chartData || []} />
          </div>
        </div>

        {/* Top Users */}
        <div className="admin-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-content">
              Người dùng tích cực
            </h3>
            <Button
              type="button"
              variant="ghost"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Xem tất cả
            </Button>
          </div>
          <div className="flex-1 space-y-3">
            {usersLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-3.5 w-24 bg-muted rounded mb-1.5" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  ))
              : topUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar || 'https://via.placeholder.com/40'}
                        alt={user.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-popover rounded-full text-[9px] font-bold flex items-center justify-center text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {user.username}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText size={12} strokeWidth={1.6} />
                        {user.postsCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} strokeWidth={1.6} />
                        {user.followersCount || 0}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full mt-4 py-2.5 text-sm"
          >
            Xem chi tiết
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;