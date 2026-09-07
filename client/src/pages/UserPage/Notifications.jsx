import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, Loader2 } from 'lucide-react';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/useNotificationQuery';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { notify } from '@/utils/notify';
import {
  getNotificationIcon,
  getNotificationContent,
} from '@/utils/notificationUtils';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // React Query Hooks
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useNotifications(activeFilter);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  // Combine pages
  const notifications =
    data?.pages?.flatMap(page => page.notifications || page) || [];

  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: 'Chưa đọc' },
    { id: 'like', label: 'Lượt thích' },
    { id: 'comment', label: 'Bình luận' },
    { id: 'follow', label: 'Theo dõi' },
  ];

  const handleFilterChange = filterId => {
    setActiveFilter(filterId);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.isRead;
    return notif.type === activeFilter;
  });

  const handleMarkAllRead = () => {
    markAllAsRead(undefined, {
      onError: () => notify.error('Không thể đánh dấu tất cả là đã đọc'),
    });
  };

  const handleMarkRead = id => {
    markAsRead(id);
  };

  return (
    <div className="max-w-2xl mx-auto min-h-[100dvh] bg-white dark:bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-content dark:text-white" />
              <div>
                <h1 className="text-xl font-bold text-content dark:text-white">
                  Thông báo
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-neutral-500">
                    {unreadCount} chưa đọc
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-content dark:text-white font-medium hover:bg-muted"
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              <Link
                to="/settings/notification"
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Cài đặt thông báo"
              >
                <Settings size={18} className="text-neutral-500" />
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {filters.map(filter => (
              <Button
                key={filter.id}
                size="sm"
                variant={activeFilter === filter.id ? 'default' : 'ghost'}
                onClick={() => handleFilterChange(filter.id)}
                className={
                  activeFilter === filter.id
                    ? 'rounded-full px-4 whitespace-nowrap'
                    : 'rounded-full px-4 whitespace-nowrap text-muted-foreground hover:bg-muted'
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="md" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Empty className="py-20">
          <EmptyMedia>
            <Bell size={48} className="text-muted-foreground/40" />
          </EmptyMedia>
          <EmptyTitle>Không có thông báo nào</EmptyTitle>
          <EmptyDescription>Bạn đã cập nhật tất cả!</EmptyDescription>
        </Empty>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredNotifications.map(notif => {
            const sender = notif.sender || notif.user;
            if (!sender) return null;

            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                className={`flex items-start gap-3 px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                  !notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                {/* Avatar with Icon */}
                <div className="relative flex-shrink-0">
                  <Link
                    to={`/profile/${sender.username}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <Avatar className="size-12 ring-2 ring-border">
                      <AvatarImage
                        src={sender.avatar || 'https://via.placeholder.com/40'}
                        alt={sender.name}
                      />
                      <AvatarFallback>
                        {(sender.name || 'U')[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-content dark:text-white">
                    <Link
                      to={`/profile/${sender.username}`}
                      className="font-bold hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      {sender.name}
                    </Link>{' '}
                    {getNotificationContent(notif)}
                  </p>

                  {/* Additional Content depending on type */}
                  {(notif.postId || notif.post) && (
                    <Link
                      to={`/post/${
                        notif.postId || notif.post?._id || notif.post
                      }`}
                      className="block mt-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-sm text-neutral-500 truncate hover:underline">
                        "{notif.post?.caption || notif.preview || 'Bài viết'}"
                      </p>
                    </Link>
                  )}
                  {notif.comment && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
                      {notif.comment.content || notif.comment}
                    </p>
                  )}

                  <p className="text-xs text-neutral-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>

                {/* Unread Indicator */}
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}

          {/* Load More Trigger */}
          {hasNextPage && (
            <div className="flex justify-center p-4">
              <Button
                variant="link"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm text-blue-500"
              >
                {isFetchingNextPage ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Xem thêm'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;

