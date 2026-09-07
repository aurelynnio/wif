import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, Check, Loader2, Users } from 'lucide-react';
import {
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useUserQuery';
import { notify } from '@/utils/notify';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

const FollowList = ({ userId, type = 'followers', isOpen, onClose }) => {
  const navigate = useNavigate();
  const authUser = useAuthStore(state => state.user);

  // React Query hooks
  const { data: followersData, isLoading: followersLoading } = useFollowers(
    type === 'followers' && isOpen ? userId : null
  );
  const { data: followingData, isLoading: followingLoading } = useFollowing(
    type === 'following' && isOpen ? userId : null
  );

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const users = useMemo(() => {
    if (type === 'followers') return followersData || [];
    return followingData || [];
  }, [type, followersData, followingData]);

  const loading = type === 'followers' ? followersLoading : followingLoading;

  const handleFollow = useCallback(
    async (targetUserId, isFollowing) => {
      try {
        if (isFollowing) {
          await unfollowMutation.mutateAsync(targetUserId);
          notify.success('Đã bỏ theo dõi');
        } else {
          await followMutation.mutateAsync(targetUserId);
          notify.success('Đã theo dõi');
        }
      } catch (error) {
        notify.error(error?.response?.data?.message || 'Thao tác thất bại');
      }
    },
    [followMutation, unfollowMutation]
  );

  const handleUserClick = user => {
    navigate(`/profile/${user._id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50">
          <h2 className="text-base font-semibold text-black dark:text-white">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-lg text-muted-foreground"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-neutral-400" />
            </div>
          ) : users.length === 0 ? (
            <Empty className="py-12">
              <EmptyMedia>
                <Users size={48} className="text-muted-foreground/40" />
              </EmptyMedia>
              <EmptyTitle>
                {type === 'followers'
                  ? 'No followers yet'
                  : 'Not following anyone'}
              </EmptyTitle>
            </Empty>
          ) : (
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {users.map(user => {
                const isFollowingUser =
                  user.isFollowing ||
                  (type === 'following' && userId === authUser?._id);
                const mutationLoading =
                  (followMutation.isPending || unfollowMutation.isPending) &&
                  (followMutation.variables === user._id ||
                    unfollowMutation.variables === user._id);

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <Avatar className="size-12">
                        <AvatarImage
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                          }
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {(user.username || 'U')[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {user.fullName || user.name || user.username}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {user._id !== authUser?._id && (
                      <Button
                        variant={isFollowingUser ? 'default' : 'outline'}
                        onClick={() => handleFollow(user._id, isFollowingUser)}
                        disabled={mutationLoading}
                        className={
                          isFollowingUser
                            ? 'rounded-full px-4 text-muted-foreground hover:text-red-500'
                            : 'rounded-full px-4'
                        }
                      >
                        {mutationLoading ? (
                          <Loader2 data-icon="inline-start" className="animate-spin" />
                        ) : isFollowingUser ? (
                          <>
                            <Check data-icon="inline-start" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus data-icon="inline-start" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowList;
