import { memo, useCallback } from 'react';
import { X, MessageCircle } from 'lucide-react';
import useComments from '@/hooks/useComments';
import { CommentItem, CommentInput } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';

/**
 * CommentModal - Modal hiển thị danh sách comment của một post
 *
 * @param {string} postId - ID của post
 * @param {function} onClose - Callback đóng modal
 */
const CommentModal = memo(({ postId, onClose, variant = 'modal' }) => {
  const {
    comments,
    loading,
    error,
    totalCount,
    currentUser,
    replyingTo,
    addComment,
    editComment,
    removeComment,
    toggleLike,
    startReply,
    cancelReply,
    refresh,
  } = useComments(postId);
  const isPanel = variant === 'panel';

  // Thêm comment mới
  const handleAddComment = useCallback(
    async (content, parentId = null) => {
      const success = await addComment(content, parentId);
      // Chỉ huỷ trạng thái reply khi comment thực sự được tạo
      if (success) cancelReply();
      return success;
    },
    [addComment, cancelReply]
  );

  // Đóng modal khi click backdrop
  const handleBackdropClick = useCallback(
    e => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const content = (
    <div
      className={
        isPanel
          ? 'flex w-full flex-1 min-h-0 flex-col rounded-2xl border border-border bg-background text-foreground overflow-hidden'
          : 'w-full max-w-lg rounded-2xl flex flex-col max-h-[80vh] overflow-hidden shadow-2xl border border-border bg-background text-foreground'
      }
      onClick={isPanel ? undefined : e => e.stopPropagation()}
    >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageCircle size={18} />
            Bình luận
            <span className="text-muted-foreground font-normal text-sm">
              ({totalCount})
            </span>
          </h3>
          {(isPanel ? !!onClose : true) && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Đóng"
              onClick={onClose}
              className="text-muted-foreground"
            >
              <X />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-destructive text-sm">{error}</p>
              <Button
                variant="link"
                size="sm"
                onClick={refresh}
                className="mt-2"
              >
                Thử lại
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && comments.length === 0 && (
            <Empty className="py-8">
              <EmptyMedia variant="icon">
                <MessageCircle />
              </EmptyMedia>
              <EmptyTitle>Chưa có bình luận nào</EmptyTitle>
              <EmptyDescription>
                Hãy là người đầu tiên bình luận!
              </EmptyDescription>
            </Empty>
          )}

          {/* Comments List */}
          {!loading && !error && comments.length > 0 && (
            <div className="space-y-4">
              {comments.map(comment => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUserId={currentUser?._id}
                  onEdit={editComment}
                  onDelete={removeComment}
                  onReply={startReply}
                  onLike={toggleLike}
                  replyingTo={replyingTo}
                  onAddReply={handleAddComment}
                  onCancelReply={cancelReply}
                />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar size="default" className="flex-shrink-0 bg-muted">
              <AvatarImage
                src={
                  currentUser?.profile?.avatar ||
                  currentUser?.avatar ||
                  currentUser?.photo ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    currentUser?._id || currentUser?.id || currentUser?.username || 'user'
                  }`
                }
                alt=""
                loading="lazy"
                decoding="async"
              />
              <AvatarFallback>
                {(currentUser?.fullName || currentUser?.username || '?').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CommentInput
                onSubmit={content => handleAddComment(content)}
                placeholder="Viết bình luận..."
              />
            </div>
          </div>
        </div>
    </div>
  );

  if (isPanel) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      {content}
    </div>
  );
});

CommentModal.displayName = 'CommentModal';

export default CommentModal;
