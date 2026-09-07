import { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Trash2,
  RefreshCcw,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Bell,
} from 'lucide-react';
import {
  useNotificationsPage,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@/hooks/useNotificationQuery';
import { notify } from '@/utils/notify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import AdminPagination from '@/components/Admin/Shared/AdminPagination.jsx';

const Notifications = () => {
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 10;

  // Data Fetching
  const { data, isLoading, isPreviousData, refetch } = useNotificationsPage(
    currentPage,
    LIMIT,
    filterType
  );

  const { data: unreadCount = 0 } = useUnreadCount();

  // Mutations
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutateAsync: deleteNotification } = useDeleteNotification();
  const { mutateAsync: deleteAllNotifications } = useDeleteAllNotifications();

  // Derived state
  const notifications = data?.notifications || [];
  const pagination = data?.pagination || {};

  const handleMarkAsRead = id => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onError: () => notify.error('Không thể đánh dấu tất cả là đã đọc'),
      onSuccess: () => notify.success('Đã đánh dấu tất cả là đã đọc'),
    });
  };

  const handleDelete = async id => {
    try {
      await deleteNotification(id);
      notify.success('Đã xóa thông báo');
    } catch {
      notify.error('Không thể xóa thông báo');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo không?')) {
      try {
        await deleteAllNotifications();
        notify.success('Đã xóa tất cả thông báo');
      } catch {
        notify.error('Không thể xóa tất cả thông báo');
      }
    }
  };

  const refreshType = () => {
    refetch();
    notify.success('Đã làm mới thông báo');
  };

  const getIcon = type => {
    switch (type) {
      case 'info':
        return <Info size={24} className="text-info" />;
      case 'success':
        return <CheckCircle size={24} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-warning" />;
      case 'alert':
        return <AlertCircle size={24} className="text-error" />;
      default:
        return <Sparkles size={24} className="text-muted-foreground" />;
    }
  };

  const getTypeLabel = type => {
    const labels = {
      all: 'Tất cả',
      info: 'Thông tin',
      success: 'Thành công',
      warning: 'Cảnh báo',
      alert: 'Lỗi',
    };
    return labels[type] || type;
  };

  return (
    <div className="admin-page">
      {/* Header Section */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Thông báo
          </p>
          <h2 className="text-2xl font-semibold text-content flex items-center gap-3">
            <Bell className="text-content" size={22} />
            Thông báo hệ thống
          </h2>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
            Bạn có{' '}
            <Badge variant="destructive">{unreadCount}</Badge>{' '}
            thông báo chưa đọc
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={refreshType}
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted"
            title="Làm mới"
            aria-label="Làm mới"
          >
            <RefreshCcw size={20} />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-full bg-muted text-muted-foreground"
          >
            <Check size={16} />
            <span className="hidden sm:inline">Đánh dấu tất cả</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            className="rounded-full bg-muted text-destructive"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Xóa tất cả</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card p-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'info', 'success', 'warning', 'alert'].map(type => (
            <Button
              key={type}
              type="button"
              onClick={() => {
                setFilterType(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted'
              }`}
            >
              {getTypeLabel(type)}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-card overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
            <Spinner className="size-8 text-muted-foreground" />
            <span className="font-medium">Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
            <div className="p-4 bg-muted rounded-full">
              <Bell size={32} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Không có thông báo nào
            </p>
            <p className="text-sm">Hiện tại bạn không có thông báo mới nào.</p>
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`p-4 flex gap-4 transition-all group ${
                  !notification.isRead ? 'bg-muted' : 'hover:bg-muted'
                }`}
              >
                <div className="mt-1 flex-shrink-0 p-2.5 rounded-2xl bg-muted">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-base leading-snug ${
                        !notification.isRead
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-muted-foreground'
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full">
                      <Clock size={12} />
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 rounded-xl bg-muted text-info hover:bg-muted"
                      title="Đánh dấu đã đọc"
                      aria-label="Đánh dấu đã đọc"
                    >
                      <CheckCircle size={18} />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-destructive hover:bg-muted"
                    title="Xóa"
                    aria-label="Xóa"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          label={`Trang ${currentPage} / ${pagination.pages}`}
          canPrev={currentPage > 1 && !isLoading}
          canNext={!isPreviousData && currentPage < pagination.pages && !isLoading}
          onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNext={() => {
            if (!isPreviousData && currentPage < pagination.pages) {
              setCurrentPage(p => p + 1);
            }
          }}
        />
      )}
    </div>
  );
};

export default Notifications;