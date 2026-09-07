import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Search,
  TrendingUp,
  Hash,
  UserPlus,
  Check,
  X,
  Flame,
  Users,
  Image,
  Loader2,
} from 'lucide-react';
import { notify } from '@/utils/notify';
import { useTrendingHashtags, useExploreFeed } from '@/hooks/usePostsQuery';
import {
  useSuggestions,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useUserQuery';
import { useSearchUsers, useSearchPosts } from '@/hooks/useSearchQuery';
import { useDebounce } from '@/hooks/useDebounce';
import { formatNumber } from '@/utils/numberUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|m3u8|ogg)$/i;

const isVideoUrl = url => {
  if (!url) return false;
  if (VIDEO_EXTENSIONS.test(url)) return true;
  return /\/video\/upload\//i.test(url) || /resource_type=video/i.test(url);
};

const Explore = () => {
  const currentUser = useAuthStore(state => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Queries
  const { data: trendingHashtags, isLoading: trendingLoading } =
    useTrendingHashtags(10);
  const { data: suggestions, isLoading: suggestionsLoading } =
    useSuggestions(10);
  const { data: exploreFeed, isLoading: exploreLoading } = useExploreFeed({
    page: 1,
    limit: 18,
  });

  const isSearching = !!debouncedSearch.trim();
  const { data: userSearchResults, isLoading: userSearchLoading } =
    useSearchUsers({
      query: debouncedSearch,
      page: 1,
      limit: 20,
    });
  const { data: postSearchResults, isLoading: postSearchLoading } =
    useSearchPosts({
      query: debouncedSearch,
      page: 1,
      limit: 20,
    });

  // Mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = async user => {
    const isFollowed = user.isFollowing;
    try {
      if (isFollowed) {
        await unfollowMutation.mutateAsync(user._id);
        notify.success('Đã bỏ theo dõi');
      } else {
        await followMutation.mutateAsync(user._id);
        notify.success('Đã theo dõi');
      }
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Thao tác thất bại');
    }
  };

  // Get people list - search results or suggestions (ensure array)
  const peopleList = isSearching
    ? userSearchResults?.users || userSearchResults || []
    : suggestions?.users || suggestions || [];

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'people', label: 'People', icon: Users },
    { id: 'photos', label: 'Photos', icon: Image },
  ];

  const hashtagsArray = Array.isArray(trendingHashtags)
    ? trendingHashtags
    : trendingHashtags?.data || [];

  const getHashtagName = item =>
    String(item?.name || item?.tag || item?.hashtag || '')
      .replace(/^#/, '')
      .trim();

  const getHashtagPostCount = item => {
    const n =
      item?.totalUsage ??
      item?.recentUsage?.last24Hours ??
      item?.postsCount ??
      item?.count ??
      item?.posts;
    return Number.isFinite(Number(n)) ? Number(n) : 0;
  };

  const explorePosts = isSearching
    ? postSearchResults?.posts || postSearchResults || []
    : exploreFeed?.posts || exploreFeed || [];

  const postsLoading = trendingLoading || exploreLoading || postSearchLoading;
  const usersLoading = suggestionsLoading || userSearchLoading;

  return (
    <div className="max-w-2xl mx-auto min-h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-content dark:text-white mb-4">
            Explore
          </h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search topics, people, posts..."
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
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 rounded-lg overflow-hidden ${
                  activeTab === tab.id
                    ? ''
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="exploreTabIndicator"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <tab.icon size={16} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="space-y-2">
            {postsLoading && !hashtagsArray?.length ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
              </div>
            ) : hashtagsArray?.length === 0 ? (
              <Empty className="py-8">
                <EmptyMedia>
                  <TrendingUp size={32} className="text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle>Không có hashtag nổi bật</EmptyTitle>
              </Empty>
            ) : (
              hashtagsArray.map((item, index) => {
                const tagName = getHashtagName(item);
                const postsCount = getHashtagPostCount(item);
                return (
                <Link
                  key={item._id || tagName || index}
                  to={`/explore/tag/${encodeURIComponent(tagName)}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-lg font-bold text-neutral-300 dark:text-neutral-600 w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-neutral-400" />
                      <span className="font-semibold text-content dark:text-white">
                        {tagName || '#'}
                      </span>
                      {index < 3 && (
                        <Flame size={14} className="text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">
                      {formatNumber(postsCount)} posts
                    </p>
                  </div>
                </Link>
                );
              })
            )}
          </div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <div className="space-y-2">
            {usersLoading && !peopleList?.length ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
              </div>
            ) : peopleList?.length === 0 ? (
              <Empty className="py-8">
                <EmptyMedia>
                  <Users size={32} className="text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle>
                  {debouncedSearch
                    ? 'Không tìm thấy người dùng'
                    : 'Không có gợi ý'}
                </EmptyTitle>
              </Empty>
            ) : (
              peopleList.map(user => {
                const isFollowed = user.isFollowing;
                const isMutationLoading =
                  (followMutation.isPending &&
                    followMutation.variables === user._id) ||
                  (unfollowMutation.isPending &&
                    unfollowMutation.variables === user._id);
                const isSelf = user._id === currentUser?._id;
                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      className="relative flex-shrink-0"
                    >
                      <Avatar className="size-12 ring-2 ring-border">
                        <AvatarImage
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                          }
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {(user.name || user.username || 'U')[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {(user.verified || user.isVerified) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-white dark:border-neutral-900">
                          <Check
                            size={8}
                            className="text-primary-foreground"
                          />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${user.username}`}
                        className="font-medium text-content dark:text-white hover:underline truncate block"
                      >
                        {user.name || user.username}
                      </Link>
                      <p className="text-sm text-neutral-500 truncate">
                        @{user.username}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {formatNumber(user.followersCount || user.followers)}{' '}
                        followers
                      </p>
                    </div>
                    {!isSelf && (
                      <Button
                        variant={isFollowed ? 'default' : 'outline'}
                        onClick={() => handleFollow(user)}
                        disabled={isMutationLoading}
                        className={
                          isFollowed
                            ? 'rounded-full px-4 flex-shrink-0 text-muted-foreground hover:text-red-500'
                            : 'rounded-full px-4 flex-shrink-0'
                        }
                      >
                        {isMutationLoading ? (
                          <Loader2 data-icon="inline-start" className="animate-spin" />
                        ) : isFollowed ? (
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
              })
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {postsLoading && !explorePosts?.length ? (
              <div className="col-span-3 flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
              </div>
            ) : explorePosts?.length === 0 ? (
              <Empty className="col-span-3 py-8">
                <EmptyMedia>
                  <Image size={32} className="text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle>Không có bài viết</EmptyTitle>
              </Empty>
            ) : (
              (explorePosts || []).map(post => (
                (() => {
                  const mediaItem = post?.media?.[0];
                  const raw =
                    mediaItem ||
                    post?.images?.[0] ||
                    post?.image ||
                    post?.thumbnail ||
                    post?.cover;
                  const mediaUrl =
                    typeof raw === 'string' ? raw : raw?.url || raw?.thumbnail;
                  const isVideo =
                    mediaItem?.type === 'video' || isVideoUrl(mediaUrl);

                  return (
                <Link
                  key={post._id}
                  to={`/post/${post._id}`}
                  className="relative aspect-square group overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
                >
                  {mediaUrl ? (
                    isVideo ? (
                      <video
                        src={mediaUrl}
                        poster={mediaItem?.thumbnail}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={post.caption ? `Post: ${post.caption}` : 'Post'}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => {
                          e.currentTarget.src = 'https://via.placeholder.com/400';
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p className="text-xs text-neutral-500 line-clamp-4 text-center">
                        {post.caption || 'No media'}
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">
                      ♥ {formatNumber(post.likesCount || post.likes || 0)}
                    </span>
                  </div>
                </Link>
                  );
                })()
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;

