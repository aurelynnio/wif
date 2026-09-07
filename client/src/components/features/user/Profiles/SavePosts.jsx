import { useState, useMemo } from 'react';
import { Bookmark, Grid, List, X, Trash2, Loader2 } from 'lucide-react';
import Post from '@/components/features/feed/Posts/Post';
import { useSavedPosts, useToggleSave } from '@/hooks/usePostsQuery';
import { notify } from '@/utils/notify';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|m3u8|ogg)$/i;

const isVideoUrl = url => {
  if (!url) return false;
  if (VIDEO_EXTENSIONS.test(url)) return true;
  return /\/video\/upload\//i.test(url) || /resource_type=video/i.test(url);
};

const SavePosts = () => {
  const [viewMode, setViewMode] = useState('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { data: savedPostsData, isLoading, error } = useSavedPosts();
  const toggleSaveMutation = useToggleSave();

  const posts = useMemo(() => {
    return Array.isArray(savedPostsData)
      ? savedPostsData
      : savedPostsData?.posts || savedPostsData?.data || [];
  }, [savedPostsData]);

  const handleUnsave = postId => {
    setSelectedPostId(postId);
    setShowDeleteModal(true);
  };

  const confirmUnsave = async () => {
    if (!selectedPostId) return;
    try {
      // useToggleSave cần { postId, isSaved }; bài đang được lưu nên isSaved=true (=> DELETE)
      await toggleSaveMutation.mutateAsync({
        postId: selectedPostId,
        isSaved: true,
      });
      notify.success('Đã bỏ lưu bài viết');
      setShowDeleteModal(false);
      setSelectedPostId(null);
    } catch (error) {
      console.error('Failed to unsave post:', error);
      notify.error('Không thể bỏ lưu bài viết');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <p>Đã có lỗi xảy ra khi tải bài viết đã lưu.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-b-2xl mb-4 ">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Bookmark size={24} className="text-content dark:text-white" />
            <div>
              <h1 className="text-lg font-bold text-content dark:text-white">
                Saved Posts
              </h1>
              <p className="text-sm text-neutral-500">
                {posts.length} saved items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'text-muted-foreground hover:bg-muted'
              }
            >
              <List size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'text-muted-foreground hover:bg-muted'
              }
            >
              <Grid size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="md" />
        </div>
      ) : posts.length === 0 ? (
        <Empty className="py-20">
          <EmptyMedia>
            <Bookmark size={48} className="text-muted-foreground/40" />
          </EmptyMedia>
          <EmptyTitle>No saved posts</EmptyTitle>
          <EmptyDescription>Posts you save will appear here</EmptyDescription>
        </Empty>
      ) : viewMode === 'list' ? (
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
          {posts.map(post => {
            const actualPost = post.postId || post;
            return (
              <div key={actualPost._id} className="relative group">
                <Post data={actualPost} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUnsave(actualPost._id)}
                  aria-label="Bỏ lưu bài viết"
                  className="absolute top-4 right-4 rounded-full bg-white dark:bg-neutral-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.map(post => {
            const actualPost = post.postId || post;
            const mediaItem = actualPost.media?.[0];
            const mediaUrl =
              typeof mediaItem === 'string' ? mediaItem : mediaItem?.url;
            const isVideo =
              mediaItem?.type === 'video' || isVideoUrl(mediaUrl);
            return (
              <div
                key={actualPost._id}
                className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 group cursor-pointer overflow-hidden"
              >
                {mediaUrl ? (
                  isVideo ? (
                    <video
                      src={mediaUrl}
                      poster={mediaItem?.thumbnail || mediaItem?.poster || mediaItem?.preview}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <p className="text-xs text-neutral-500 line-clamp-3 text-center">
                      {actualPost.caption}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Bỏ lưu bài viết"
                    onClick={() => handleUnsave(actualPost._id)}
                    className="rounded-full bg-white/20 text-white hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-content dark:text-white">
                Remove from saved?
              </h3>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Đóng"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full text-muted-foreground"
              >
                <X size={20} />
              </Button>
            </div>
            <p className="text-neutral-500 mb-6">
              This post will be removed from your saved items.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-full px-4 py-2.5 h-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmUnsave}
                disabled={toggleSaveMutation.isPending}
                className="flex-1 rounded-full px-4 py-2.5 h-auto"
              >
                {toggleSaveMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavePosts;
