import { lazy, Suspense, useCallback, useMemo, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import { X, Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatPostTime as formatTime } from '@/utils/postUtils';
import { formatCount } from '@/utils/numberUtils';
import { normalizeMediaItem } from '@/utils/postMedia';
import { usePostInteractions } from './usePostInteractions';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostActions from './PostActions';

// Lazy load modals
const CommentModal = lazy(() =>
  import('../Comment/CommentModal').then(module => ({
    default: module.default,
  }))
);
const ReportModal = lazy(() =>
  import('../../report/ReportModal').then(module => ({
    default: module.default,
  }))
);
const ModelPost = lazy(() => import('./ModelPost'));
const VideoModal = lazy(() => import('@/components/Common/VideoModal'));

const DEFAULT_USER = {
  name: 'Unknown User',
  username: 'unknown',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
};

const arePostPropsEqual = (prev, next) => {
  if (prev.onDelete !== next.onDelete) return false;
  if (prev.onOpenComments !== next.onOpenComments) return false;
  if (prev.onOptionsToggle !== next.onOptionsToggle) return false;
  if (prev.data === next.data) return true;

  const prevData = prev.data;
  const nextData = next.data;

  if (!prevData || !nextData) return prevData === nextData;
  if (prevData._id !== nextData._id) return false;
  if (prevData.updatedAt !== nextData.updatedAt) return false;
  if (prevData.caption !== nextData.caption) return false;

  const prevLikeCount = prevData.likeCount ?? prevData.likesCount;
  const nextLikeCount = nextData.likeCount ?? nextData.likesCount;
  if (prevLikeCount !== nextLikeCount) return false;

  const prevCommentCount = prevData.commentCount ?? prevData.commentsCount;
  const nextCommentCount = nextData.commentCount ?? nextData.commentsCount;
  if (prevCommentCount !== nextCommentCount) return false;

  if (prevData.isLiked !== nextData.isLiked) return false;
  if (prevData.isSaved !== nextData.isSaved) return false;
  if (prevData.viewCount !== nextData.viewCount) return false;

  const prevMediaCount = Array.isArray(prevData.media) ? prevData.media.length : 0;
  const nextMediaCount = Array.isArray(nextData.media) ? nextData.media.length : 0;
  if (prevMediaCount !== nextMediaCount) return false;

  const prevUser = prevData.user;
  const nextUser = nextData.user;
  if (prevUser || nextUser) {
    const prevUserId = prevUser?._id || prevUser?.id;
    const nextUserId = nextUser?._id || nextUser?.id;
    if (prevUserId !== nextUserId) return false;
    if (prevUser?.name !== nextUser?.name) return false;
    if (prevUser?.username !== nextUser?.username) return false;
    if (prevUser?.avatar !== nextUser?.avatar) return false;
    if (prevUser?.verified !== nextUser?.verified) return false;
  }

  return true;
};

const Post = ({ data, onDelete, onOpenComments, onOptionsToggle }) => {
  const authUser = useAuthStore(state => state.user);

  const [showImage, setShowImage] = useState(null);
  const [showVideo, setShowVideo] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    isLiked,
    isSaved,
    likeCount,
    likeLoading,
    saveLoading,
    deletePending,
    sharePending,
    showOptions,
    handleLike,
    handleSave,
    handleDelete,
    handleShare,
    handleCopyLink,
    handleOptionsChange,
    closeOptions,
  } = usePostInteractions({ data, onDelete, onOptionsToggle });

  const isOwner = authUser?._id === data?.user?._id;

  const user = useMemo(() => data?.user || DEFAULT_USER, [data?.user]);

  const normalizedMedia = useMemo(() => {
    const rawMedia = Array.isArray(data?.media) ? data.media : [];
    return rawMedia.map(normalizeMediaItem).filter(Boolean);
  }, [data?.media]);

  const mediaCount = useMemo(() => normalizedMedia.length, [normalizedMedia]);

  const mediaItems = useMemo(
    () => normalizedMedia.slice(0, 4),
    [normalizedMedia]
  );

  const commentCount = data?.commentCount || data?.commentsCount || 0;

  const handleOpenComments = useCallback(() => {
    if (!data?._id) return;
    if (onOpenComments) {
      onOpenComments(data._id);
      return;
    }
    setShowComments(true);
  }, [data?._id, onOpenComments]);

  if (!data)
    return (
      <div className="p-4 text-center text-neutral-500">
        No post data available
      </div>
    );

  return (
    <article className="rounded-2xl p-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      {/* Header */}
      <PostHeader
        user={user}
        isOwner={isOwner}
        formattedTime={formatTime(data.createdAt)}
        sharePending={sharePending}
        showOptions={showOptions}
        onOptionsChange={handleOptionsChange}
        handleShare={handleShare}
        handleCopyLink={handleCopyLink}
        closeOptions={closeOptions}
        onEdit={() => {
          setShowEditModal(true);
          closeOptions();
        }}
        onDelete={() => {
          setShowDeleteConfirm(true);
          closeOptions();
        }}
        onReport={() => {
          setShowReportModal(true);
          closeOptions();
        }}
      />

      {/* Content */}
      {data.caption && (
        <p className="text-content dark:text-white leading-relaxed mb-3 whitespace-pre-wrap break-words">
          {data.caption}
        </p>
      )}

      {/* Media */}
      <PostMedia
        mediaItems={mediaItems}
        mediaCount={mediaCount}
        onImageClick={setShowImage}
        onVideoExpand={setShowVideo}
      />

      {/* Stats Row */}
      <div className="flex items-center gap-4 py-2 mb-2 text-sm text-neutral-400">
        <span className="flex items-center gap-1">
          <Eye size={14} />
          {formatCount(data.viewCount || 0)} views
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100 dark:bg-neutral-800/50 mb-3" />

      {/* Action Buttons */}
      <PostActions
        isLiked={isLiked}
        isSaved={isSaved}
        likeCount={likeCount}
        commentCount={commentCount}
        likeLoading={likeLoading}
        saveLoading={saveLoading}
        sharePending={sharePending}
        onLike={handleLike}
        onComment={handleOpenComments}
        onShare={handleShare}
        onSave={handleSave}
      />

      {/* Image Modal */}
      {showImage &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setShowImage(null)}
          >
            <img
              src={showImage}
              alt="Full view"
              className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-2.5 rounded-xl hover:bg-white/20 transition-colors"
              onClick={() => setShowImage(null)}
            >
              <X size={20} />
            </button>
          </div>,
          document.body
        )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletePending}
              onClick={async () => {
                if (await handleDelete()) setShowDeleteConfirm(false);
              }}
            >
              {deletePending ? (
                <Spinner />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Modal */}
      {showReportModal && (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            targetId={data?._id}
            targetType="post"
          />
        </Suspense>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <ModelPost
            closeModal={() => setShowEditModal(false)}
            editPost={data}
          />
        </Suspense>
      )}

      {/* Comments Modal Placeholder */}
      {showComments && (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <CommentModal
            onClose={() => setShowComments(false)}
            postId={data?._id}
          />
        </Suspense>
      )}

      {/* Video Modal */}
      {showVideo && (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <VideoModal videoUrl={showVideo} onClose={() => setShowVideo(null)} />
        </Suspense>
      )}
    </article>
  );
};

export default memo(Post, arePostPropsEqual);