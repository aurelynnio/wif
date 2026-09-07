import { useState, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Check,
  MessageCircle,
  Grid3X3,
  Heart,
  Bookmark,
  Share2,
  Loader2,
} from 'lucide-react';
import Post from '@/components/features/feed/Posts/Post';
import { useAuthStore } from '@/store/authStore';
import {
  useSharedPosts,
  useUserPosts,
  useLikedPosts,
  useSavedPosts,
} from '@/hooks/usePostsQuery';
import {
  useProfile,
  useCheckFollow,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useUserQuery';
import { useCreateConversation } from '@/hooks/useMessageQuery';
import { notify } from '@/utils/notify';
import { formatNumber } from '@/utils/numberUtils';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
const FollowList = lazy(() => import('../FollowList/FollowList'));

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowList, setShowFollowList] = useState(null); // 'followers' | 'following' | null
  const authUser = useAuthStore(state => state.user);
  const profileId = userId || authUser?._id;
  const isOwnProfile =
    !userId || userId === authUser?._id || userId === authUser?.username;

  // React Query Hooks
  const { data: profileData, isLoading: profileLoading, isFetching: profileFetching } =
    useProfile(profileId);
  const currentProfile = profileData;

  const { data: followStatusData } = useCheckFollow(profileId, !isOwnProfile);
  const followStatus = followStatusData?.status; // 'active' | 'pending' | 'none'
  const isFollowing = followStatus === 'active';
  const isFollowPending = followStatus === 'pending';

  // Posts Query
  const { data: userPostsData, isLoading: isPostsLoading } = useUserPosts(
    activeTab === 'posts' ? profileId : null
  );

  const userPosts =
    userPostsData?.pages?.flatMap(page => page.posts || []) || [];

  // Liked Posts Query (Only for own profile)
  const { data: likedPostsData, isLoading: isLikesLoading } = useLikedPosts(
    activeTab === 'likes' && isOwnProfile
  );

  const likedPosts = likedPostsData?.posts || likedPostsData || [];

  // Saved Posts Query (Only for own profile)
  const { data: savedPostsData, isLoading: isSavedLoading } = useSavedPosts(
    activeTab === 'saved' && isOwnProfile
  );

  const savedPosts = savedPostsData?.posts || savedPostsData || [];

  // React Query for Shared Posts
  const { data: sharedPostsData, isLoading: isSharedLoading } = useSharedPosts(
    activeTab === 'shared' ? profileId : null
  );

  const sharedPosts =
    sharedPostsData?.pages?.flatMap(page => page.posts || []) || [];

  // Mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const createConversationMutation = useCreateConversation();

  const handleFollow = useCallback(async () => {
    if (isOwnProfile) return;

    try {
      // Dùng profileId (cùng giá trị với query key useCheckFollow/useProfile)
      // để cache được invalidate đúng (tránh nút Follow không refresh khi mở bằng username)
      const targetUserId = profileId;
      if (isFollowing || isFollowPending) {
        await unfollowMutation.mutateAsync(targetUserId);
        notify.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã hủy yêu cầu theo dõi');
        return;
      }

      const result = await followMutation.mutateAsync(targetUserId);
      const status = result?.status || followStatus;
      notify.success(status === 'pending' ? 'Đã gửi yêu cầu theo dõi' : 'Đã theo dõi');
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Thao tác thất bại');
    }
  }, [
    isFollowing,
    isFollowPending,
    profileId,
    isOwnProfile,
    followMutation,
    unfollowMutation,
    followStatus,
  ]);

  const handleMessage = useCallback(async () => {
    try {
      const targetUserId = currentProfile?._id || profileId;
      const result = await createConversationMutation.mutateAsync(targetUserId);
      const conversationId = result?._id || result?.id;

      if (conversationId) {
        navigate(`/messages/${conversationId}`, {
          state: { selectedUser: currentProfile },
        });
      } else {
        navigate(`/messages`, {
          state: { selectedUser: currentProfile, targetUserId },
        });
      }
    } catch (error) {
      if (error?.response?.data?.message?.includes('already exists')) {
        // Find existing conversation ID if possible or just navigate to messages
        navigate(`/messages`, {
          state: {
            selectedUser: currentProfile,
            targetUserId: currentProfile?._id || profileId,
          },
        });
      } else {
        notify.error(
          error?.response?.data?.message || 'Không thể tạo cuộc trò chuyện'
        );
      }
    }
  }, [profileId, navigate, currentProfile, createConversationMutation]);

  // Show loading state
  if (profileLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center py-20">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const isRefreshingProfile = profileFetching && !!currentProfile;
  const avatarSrc = currentProfile?.avatar?.trim() || '';
  const coverSrc = currentProfile?.cover?.trim() || '';
  const joinedLabel = currentProfile?.createdAt?.slice
    ? currentProfile.createdAt.slice(0, 7)
    : null;

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid3X3 },
    { id: 'shared', label: 'Shared', icon: Share2 },
    ...(isOwnProfile
      ? [
          { id: 'likes', label: 'Likes', icon: Heart },
          { id: 'saved', label: 'Saved', icon: Bookmark },
        ]
      : []),
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'posts':
        if (isPostsLoading) {
          return (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="md" />
            </div>
          );
        }
        if (!userPosts || userPosts.length === 0) {
          return (
            <Empty className="py-16 min-h-[300px]">
              <EmptyMedia>
                <Grid3X3 size={48} className="text-muted-foreground/40" />
              </EmptyMedia>
              <EmptyTitle>No posts yet</EmptyTitle>
              <EmptyDescription>Posts will appear here</EmptyDescription>
            </Empty>
          );
        }
        return userPosts.map((post, index) => (
          <Post key={post._id || index} data={post} />
        ));

      case 'shared':
        if (isSharedLoading) {
          return (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-neutral-400" />
            </div>
          );
        }
        if (!sharedPosts || sharedPosts.length === 0) {
          return (
            <Empty className="py-16 min-h-[300px]">
              <EmptyMedia>
                <Share2 size={48} className="text-muted-foreground/40" />
              </EmptyMedia>
              <EmptyTitle>No shared posts</EmptyTitle>
              <EmptyDescription>Posts you share will appear here</EmptyDescription>
            </Empty>
          );
        }
        return sharedPosts.map((post, index) => (
          <Post key={post._id || index} data={post} />
        ));

      case 'likes':
        if (isLikesLoading) {
          return (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-neutral-400" />
            </div>
          );
        }
        if (!likedPosts || likedPosts.length === 0) {
          return (
            <Empty className="py-16 min-h-[300px]">
              <EmptyMedia>
                <Heart size={48} className="text-muted-foreground/40" />
              </EmptyMedia>
              <EmptyTitle>No liked posts yet</EmptyTitle>
              <EmptyDescription>Posts you like will appear here</EmptyDescription>
            </Empty>
          );
        }
        return Array.isArray(likedPosts)
          ? likedPosts.map((post, index) => (
              <Post key={post._id || index} data={post} />
            ))
          : null;

      case 'saved':
        if (isSavedLoading) {
          return (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-neutral-400" />
            </div>
          );
        }
        if (!savedPosts || savedPosts.length === 0) {
          return (
            <Empty className="py-16 min-h-[300px]">
              <EmptyMedia>
                <Bookmark size={48} className="text-muted-foreground/40" />
              </EmptyMedia>
              <EmptyTitle>No saved posts yet</EmptyTitle>
              <EmptyDescription>Save posts to view them later</EmptyDescription>
            </Empty>
          );
        }
        return savedPosts.map((post, index) => (
          <Post key={post._id || index} data={post} />
        ));

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isRefreshingProfile && (
        <div className="sticky top-0 z-20 flex justify-end py-2">
          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white/80 dark:bg-neutral-900/70 backdrop-blur px-3 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800 shadow-sm">
            <Loader2 size={14} className="animate-spin" />
            Updating profile
          </div>
        </div>
      )}
      {/* Cover Image / Modern Gradient Banner */}
      <div className="h-44 sm:h-52 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 relative overflow-hidden rounded-b-2xl sm:rounded-2xl shadow-sm">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Avatar - positioned at bottom of cover */}
        <div className="absolute -bottom-12 sm:-bottom-16 left-6 z-10">
          <Avatar className="size-24 sm:size-32 rounded-full ring-4 ring-white dark:ring-neutral-900 shadow-2xl bg-white dark:bg-neutral-900">
            <AvatarImage
              src={avatarSrc || undefined}
              alt={currentProfile?.name || currentProfile?.username || 'Avatar'}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-3xl sm:text-4xl select-none">
              {(currentProfile?.name || currentProfile?.username || 'U')[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-6 pb-5 pt-16 sm:pt-20">
        {/* Actions */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center flex-wrap gap-2">
            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={() => navigate('/settings/profile')}
                className="rounded-full px-5 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full size-9 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <MoreHorizontal size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMessage}
                  className="rounded-full size-9 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  title="Nhắn tin"
                >
                  <MessageCircle size={18} />
                </Button>
                <Button
                  variant={isFollowing || isFollowPending ? 'secondary' : 'default'}
                  onClick={handleFollow}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className={`rounded-full px-5 font-semibold transition-all shadow-sm ${
                    isFollowing || isFollowPending
                      ? 'hover:text-red-600 dark:hover:text-red-400'
                      : ''
                  }`}
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <Check data-icon="inline-start" size={16} />
                      Following
                    </>
                  ) : isFollowPending ? (
                    <>
                      <UserMinus data-icon="inline-start" size={16} />
                      Requested
                    </>
                  ) : (
                    <>
                      <UserPlus data-icon="inline-start" size={16} />
                      Follow
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {currentProfile?.name || 'User'}
              </h1>
              {(currentProfile?.verified || currentProfile?.isVerified) && (
                <div className="size-4 rounded-full bg-blue-500 flex items-center justify-center text-white" title="Verified">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              @{currentProfile?.username || 'username'}
            </p>
          </div>

          {currentProfile?.bio && currentProfile?.bio.trim() !== '' ? (
            <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-line text-sm leading-relaxed max-w-xl">
              {currentProfile?.bio}
            </p>
          ) : (
            <p className="text-neutral-400 dark:text-neutral-500 italic text-sm">
              Chưa có tiểu sử.
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-neutral-500 dark:text-neutral-400 pt-0.5">
            {currentProfile?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-neutral-400" />
                {currentProfile?.location}
              </span>
            )}
            {currentProfile?.website && (
              <a
                href={
                  currentProfile.website.startsWith('http')
                    ? currentProfile.website
                    : `https://${currentProfile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                <LinkIcon size={15} />
                {currentProfile?.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-neutral-400" />
              Joined {joinedLabel || '—'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center flex-wrap gap-6 pt-1">
            <button
              type="button"
              onClick={() => setShowFollowList('following')}
              className="flex items-center gap-1.5 hover:underline focus:outline-none group text-sm"
            >
              <span className="font-bold text-neutral-900 dark:text-white">
                {formatNumber(currentProfile?.followingCount)}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                Following
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowFollowList('followers')}
              className="flex items-center gap-1.5 hover:underline focus:outline-none group text-sm"
            >
              <span className="font-bold text-neutral-900 dark:text-white">
                {formatNumber(currentProfile?.followersCount)}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                Followers
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-t-xl overflow-hidden mt-4">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-4 h-auto text-sm font-medium transition-colors rounded-none ${
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={16} className="relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="profileTabIndicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 min-h-[400px]">{getTabContent()}</div>

      {/* Follow List Modal */}
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        {showFollowList && (
          <FollowList
            userId={profileId}
            type={showFollowList}
            isOpen={!!showFollowList}
            onClose={() => setShowFollowList(null)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Profile;

