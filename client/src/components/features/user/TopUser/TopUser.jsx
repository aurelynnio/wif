import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserPlus, Check, Loader2 } from 'lucide-react';
import { useFollowUser, useUnfollowUser } from '@/hooks/useUserQuery';
import { notify } from '@/utils/notify';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const TopUser = ({ users = [], loading = false }) => {
  const currentUser = useAuthStore(state => state.user);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loadingIds, setLoadingIds] = useState(new Set());

  const { mutateAsync: followUser } = useFollowUser();
  const { mutateAsync: unfollowUser } = useUnfollowUser();

  const handleFollow = async (e, userId, isFollowed) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingIds.has(userId)) return;

    setLoadingIds(prev => new Set(prev).add(userId));

    try {
      if (isFollowed) {
        await unfollowUser(userId);
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        notify.success('Đã bỏ theo dõi');
      } else {
        await followUser(userId);
        setFollowingIds(prev => new Set(prev).add(userId));
        notify.success('Đã theo dõi');
      }
    } catch {
      notify.error('Có lỗi xảy ra');
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <p className="text-center text-xs text-neutral-400 py-4">
        Không có gợi ý
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {users.map(user => {
        const isFollowed = followingIds.has(user._id) || user.isFollowing;
        const isLoading = loadingIds.has(user._id);
        const isSelf = currentUser?._id === user._id;

        return (
          <Link
            key={user._id}
            to={`/profile/${user._id}`}
            className="px-2 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-all flex items-center gap-3 group"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="size-10">
                <AvatarImage
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  alt={user.name || user.username}
                />
                <AvatarFallback>
                  {(user.name || user.username || 'U')[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(user.verified || user.isVerified) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <Check size={8} className="text-white dark:text-black" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-black dark:text-white truncate">
                  {user.name || user.username}
                </span>
              </div>
              <span className="text-xs text-neutral-500 truncate block">
                @{user.username}
              </span>
            </div>

            {/* Follow Button - Hide if self */}
            {!isSelf && (
              <Button
                size="xs"
                variant={isFollowed ? 'default' : 'outline'}
                onClick={e => handleFollow(e, user._id, isFollowed)}
                disabled={isLoading}
                className={
                  isFollowed
                    ? 'rounded-full flex-shrink-0 text-muted-foreground'
                    : 'rounded-full flex-shrink-0'
                }
              >
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isFollowed ? (
                  <>
                    <Check data-icon="inline-start" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus data-icon="inline-start" />
                    <span>Follow</span>
                  </>
                )}
              </Button>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default TopUser;

