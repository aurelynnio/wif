import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Users, UserPlus, Check, Search, X, Loader2 } from 'lucide-react';
import {
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useUserQuery';
import { notify } from '@/utils/notify';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

const FollowingUser = () => {
  const authUser = useAuthStore(state => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('following');

  // React Query hooks
  const { data: followersData, isLoading: followersLoading } = useFollowers(
    authUser?._id
  );
  const { data: followingData, isLoading: followingLoading } = useFollowing(
    authUser?._id
  );

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const users = useMemo(() => {
    if (activeTab === 'followers') {
      return followersData || [];
    }
    return followingData || [];
  }, [activeTab, followersData, followingData]);

  const loading =
    activeTab === 'followers' ? followersLoading : followingLoading;

  // Handle follow/unfollow
  const handleToggleFollow = useCallback(
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

  // Filter users by search
  const filteredUsers = useMemo(() => {
    return users.filter(
      user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-4">
            <Users size={24} className="text-black dark:text-white" />
            <h1 className="text-lg font-bold text-black dark:text-white">
              {activeTab === 'following' ? 'Following' : 'Followers'}
            </h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Xóa tìm kiếm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={14} />
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            <Button
              variant={activeTab === 'following' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('following')}
              className={`flex-1 rounded-lg ${activeTab === 'following' ? '' : 'text-muted-foreground hover:bg-muted'}`}
            >
              Following
            </Button>
            <Button
              variant={activeTab === 'followers' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('followers')}
              className={`flex-1 rounded-lg ${activeTab === 'followers' ? '' : 'text-muted-foreground hover:bg-muted'}`}
            >
              Followers
            </Button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="md" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Empty className="py-20">
          <EmptyMedia>
            <Users size={48} className="text-muted-foreground/40" />
          </EmptyMedia>
          <EmptyTitle>
            {searchQuery
              ? 'No users found'
              : activeTab === 'following'
              ? 'Not following anyone'
              : 'No followers yet'}
          </EmptyTitle>
          <EmptyDescription>
            {searchQuery
              ? 'Try a different search'
              : 'Start connecting with people'}
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
          {filteredUsers.map(user => {
            const isFollowingUser =
              activeTab === 'following' ? true : user.isFollowing;
            const mutationLoading =
              (followMutation.isPending || unfollowMutation.isPending) &&
              (followMutation.variables === user._id ||
                unfollowMutation.variables === user._id);

            return (
              <div
                key={user._id}
                className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Link
                    to={`/profile/${user._id}`}
                    className="relative flex-shrink-0"
                  >
                    <Avatar className="size-12">
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
                        <Check
                          size={8}
                          className="text-white dark:text-black"
                        />
                      </div>
                    )}
                  </Link>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${user._id}`}
                      className="font-medium text-black dark:text-white hover:underline truncate block"
                    >
                      {user.fullName || user.name || user.username}
                    </Link>
                    <p className="text-sm text-neutral-500 truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Follow Button - Don't show for self */}
                  {user._id !== authUser?._id && (
                    <Button
                      variant={isFollowingUser ? 'default' : 'outline'}
                      onClick={() =>
                        handleToggleFollow(user._id, isFollowingUser)
                      }
                      disabled={mutationLoading}
                      className={
                        isFollowingUser
                          ? 'rounded-full px-4 flex-shrink-0 text-muted-foreground hover:text-red-500'
                          : 'rounded-full px-4 flex-shrink-0'
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowingUser;

