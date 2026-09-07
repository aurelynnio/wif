import { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  Clock,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  BarChart3,
} from 'lucide-react';
import { useSystemHealth } from '@/hooks/useAdminQuery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

const SystemHealth = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { data: systemHealth, isLoading: loading, refetch } = useSystemHealth();

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'connected':
      case 'running':
        return 'bg-success/10 text-success';
      case 'warning':
      case 'degraded':
        return 'bg-warning/10 text-warning';
      case 'error':
      case 'down':
      case 'disconnected':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatUptime = seconds => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner className="size-7 text-muted-foreground" />
      </div>
    );
  }

  const services = [
    {
      name: 'API Server',
      icon: Server,
      status: 'running',
      uptime: 124332,
      latency: '24ms',
    },
    {
      name: 'Database',
      icon: Database,
      status: 'connected',
      uptime: 124332,
      latency: '12ms',
    },
    {
      name: 'Redis Cache',
      icon: Activity,
      status: 'ok',
      hitRate: '98%',
      memory: '256MB',
    },
    {
      name: 'Storage',
      icon: HardDrive,
      status: 'healthy',
      used: '45%',
      free: '550GB',
    },
    { name: 'Socket.IO', icon: Wifi, status: 'connected', connections: 1250 },
    { name: 'Worker', icon: Cpu, status: 'running', load: '45%', queue: 0 },
  ];

  return (
    <div className="admin-page" role="region" aria-label="System health">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Hệ thống
          </p>
          <h2 className="text-2xl font-semibold text-content flex items-center gap-2">
            <Activity size={20} strokeWidth={1.5} />
            Sức khỏe hệ thống
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Trạng thái và hiệu suất máy chủ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock size={12} />
            {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted"
            aria-label="Làm mới trạng thái hệ thống"
          >
            <RefreshCcw
              size={18}
              strokeWidth={1.5}
              className={loading ? 'animate-spin' : ''}
            />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-xl text-success">
              <CheckCircle2 size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Trạng thái
              </p>
              <p className="text-base font-semibold text-foreground">
                Ổn định
              </p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-success h-1.5 rounded-full w-[95%]"></div>
          </div>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-info/10 rounded-xl text-info">
              <Cpu size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                CPU
              </p>
              <p className="text-base font-semibold text-foreground">
                45%
              </p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-info h-1.5 rounded-full w-[45%]"></div>
          </div>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-muted rounded-xl text-muted-foreground">
              <BarChart3 size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Memory
              </p>
              <p className="text-base font-semibold text-foreground">
                2.4 GB
              </p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-foreground h-1.5 rounded-full w-[60%]"></div>
          </div>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning/10 rounded-xl text-warning">
              <AlertTriangle size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Errors
              </p>
              <p className="text-base font-semibold text-foreground">
                0
              </p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-warning h-1.5 rounded-full w-[0%]"></div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-base font-semibold text-content mb-4 flex items-center gap-2">
          <Server size={18} strokeWidth={1.5} />
          Dịch vụ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <div key={index} className="admin-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                    <service.icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-foreground">
                    {service.name}
                  </span>
                </div>
                <Badge
                  className={`text-[10px] font-semibold uppercase px-2 py-1 ${getStatusColor(
                    service.status
                  )}`}
                >
                  {service.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                {service.uptime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium text-foreground">
                      {formatUptime(service.uptime)}
                    </span>
                  </div>
                )}
                {service.latency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-medium text-foreground">
                      {service.latency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;