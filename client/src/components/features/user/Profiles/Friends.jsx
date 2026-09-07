import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Users, Check, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useFollowers, useUnfollowUser } from '@/hooks/useUserQuery';
import { notify } from '@/utils/notify';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

const Friends = () => {
  const authUser = useAuthStore(state => state.user);
  const userId = authUser?._id || authUser?.id;

  const { data: friendsData, isLoading, refetch } = useFollowers(userId);
  const friends = friendsData?.data || friendsData || [];

  const unfollowMutation = useUnfollowUser();

  const [showMenu, setShowMenu] = useState(null);

  const handleRemoveFriend = async friendId => {
    try {
      await unfollowMutation.mutateAsync(friendId);
      notify.success('Đã xóa bạn bè thành công');
      refetch();
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Không thể xóa bạn bè');
    } finally {
      setShowMenu(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-black dark:text-white" />
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">
                Friends
              </h1>
              <p className="text-sm text-neutral-500">
                {friends.length} friends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Friends Grid */}
      {friends.length === 0 ? (
        <Empty className="py-20">
          <EmptyMedia>
            <Users size={48} className="text-muted-foreground/40" />
          </EmptyMedia>
          <EmptyTitle>No friends yet</EmptyTitle>
          <EmptyDescription>Start connecting with people</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          {friends.map(friend => (
            <div
              key={friend._id}
              className="bg-white dark:bg-neutral-900 rounded-xl p-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link
                  to={`/profile/${friend.username || friend._id}`}
                  className="relative flex-shrink-0"
                >
                  <Avatar className="size-14">
                    <AvatarImage
                      src={
                        friend.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`
                      }
                      alt={friend.name || friend.fullName}
                    />
                    <AvatarFallback>
                      {(friend.name || friend.fullName || 'F')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {friend.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-background" />
                  )}
                  {(friend.verified || friend.isVerified) && !friend.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black dark:bg-white flex items-center justify-center">
                      <Check size={8} className="text-white dark:text-black" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${friend.username || friend._id}`}
                    className="font-medium text-black dark:text-white hover:underline truncate block"
                  >
                    {friend.name || friend.fullName}
                  </Link>
                  <p className="text-sm text-neutral-500 truncate">
                    @{friend.username}
                  </p>
                  {friend.bio && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-1">
                      {friend.bio}
                    </p>
                  )}
                </div>

                {/* Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Tùy chọn bạn bè"
                    onClick={() =>
                      setShowMenu(showMenu === friend._id ? null : friend._id)
                    }
                    className="rounded-full text-muted-foreground"
                  >
                    <MoreHorizontal size={18} />
                  </Button>

                  {showMenu === friend._id && (
                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-neutral-900 rounded-xl overflow-hidden z-10 shadow-lg">
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveFriend(friend._id)}
                        className="w-full justify-start px-4 py-2.5 h-auto text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remove friend
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Link
                  to={`/messages/${friend._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <MessageCircle size={16} />
                  Message
                </Link>
                <Link
                  to={`/profile/${friend.username || friend._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white text-sm font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;

