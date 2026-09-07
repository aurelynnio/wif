import { useState, memo, useCallback } from 'react';
import { MoreHorizontal, Edit2, Trash2, Send, X } from 'lucide-react';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';

/**
 * CommentInput - Input để thêm comment/reply
 */
const CommentInput = memo(
  ({ onSubmit, placeholder = 'Viết bình luận...', autoFocus = false }) => {
    const [value, setValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!value.trim() || isSubmitting) return;
      setIsSubmitting(true);
      try {
        // Chỉ xoá input khi submit thành công, tránh mất nội dung khi thất bại
        const success = await onSubmit(value);
        if (success) setValue('');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleKeyDown = e => {
      if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          className="flex-1 rounded-full bg-muted"
        />
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting}
          variant={value.trim() && !isSubmitting ? 'default' : 'ghost'}
          size="icon"
          className="rounded-full"
          aria-label="Gửi bình luận"
        >
          <Send />
        </Button>
      </div>
    );
  }
);

CommentInput.displayName = 'CommentInput';

/**
 * CommentItem - Component hiển thị một comment
 */
const CommentItem = memo(
  ({
    comment,
    currentUserId,
    onEdit,
    onDelete,
    onReply,
    onLike,
    replyingTo,
    onAddReply,
    onCancelReply,
    depth = 0,
  }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(comment.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isOwner = currentUserId === comment.user?._id;
    const isLiked = comment.likes?.includes?.(currentUserId) || comment.isLiked;
    const likeCount = comment.likeCount || comment.likes?.length || 0;
    const isReplying = replyingTo?.commentId === comment._id;

    const timeAgo = comment.createdAt
      ? formatDistanceToNow(new Date(comment.createdAt))
      : 'Vừa xong';

    const handleEdit = useCallback(async () => {
      if (!editValue.trim()) return;
      const success = await onEdit(comment._id, editValue);
      if (success) setIsEditing(false);
    }, [comment._id, editValue, onEdit]);

    const handleDelete = useCallback(async () => {
      await onDelete(comment._id, depth > 0);
      setShowDeleteConfirm(false);
    }, [comment._id, onDelete, depth]);

    const handleReply = useCallback(() => {
      onReply(comment._id, comment.user?.name || 'người dùng');
    }, [comment._id, comment.user?.name, onReply]);

    const handleLike = useCallback(() => {
      onLike(comment._id, isLiked);
    }, [comment._id, isLiked, onLike]);

    const avatarSeed =
      comment.user?._id ||
      comment.user?.id ||
      comment.user?.username ||
      'user';
    const avatarSrc =
      comment.user?.profile?.avatar ||
      comment.user?.avatar ||
      comment.user?.photo ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

    return (
      <div
        className={`relative group/comment ${depth > 0 ? 'ml-12 mt-3' : ''}`}
      >
        {/* Soft Thread Guide - Only visible on hover */}
        {depth > 0 && (
          <div className="absolute -left-6 top-0 bottom-0 w-px bg-transparent group-hover/comment:bg-neutral-200 dark:group-hover/comment:bg-neutral-800 transition-colors" />
        )}

        {/* Main Comment */}
        <div className="flex gap-3 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar
              size={depth > 0 ? 'default' : 'lg'}
              className="bg-muted"
            >
              <AvatarImage
                src={avatarSrc}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <AvatarFallback>
                {(comment.user?.name || '?').charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Content */}
            {isEditing ? (
              <div className="bg-muted rounded-2xl p-3 animate-scale-in">
                <Textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="w-full border-0 bg-transparent px-0 py-0 text-sm resize-none shadow-none focus-visible:ring-0 focus-visible:border-0"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditValue(comment.content);
                    }}
                    className="rounded-lg text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editValue.trim()}
                    className="rounded-lg text-xs"
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group/content">
                <div className="bg-muted rounded-[1.25rem] px-4 py-3 inline-block max-w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-foreground">
                      {comment.user?.name || 'Người dùng'}
                    </span>
                    {comment.user?.verified && (
                      <span className="text-blue-500">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground ml-1">
                      {timeAgo}
                    </span>
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed break-words font-normal">
                    {comment.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-1.5 px-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={
                      isLiked
                        ? 'text-red-500 hover:text-red-500'
                        : 'text-muted-foreground hover:text-red-500'
                    }
                  >
                    {isLiked ? 'Đã thích' : 'Thích'}
                    {likeCount > 0 && (
                      <span className="text-[11px]">{likeCount}</span>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReply}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Trả lời
                  </Button>

                  <div className="relative opacity-0 group-hover/content:opacity-100 transition-opacity">
                    <DropdownMenu
                      open={showOptions}
                      onOpenChange={setShowOptions}
                    >
                      <DropdownMenuTrigger
                        aria-label="Tùy chọn bình luận"
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <MoreHorizontal
                          size={14}
                          className="text-muted-foreground"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        {isOwner ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setIsEditing(true);
                                setShowOptions(false);
                              }}
                            >
                              <Edit2 data-icon="inline-start" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-variant="destructive"
                              onClick={() => {
                                setShowDeleteConfirm(true);
                                setShowOptions(false);
                              }}
                            >
                              <Trash2 data-icon="inline-start" />
                              Xóa
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setShowOptions(false)}
                          >
                            Báo cáo
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )}

            {/* Reply Input */}
            {isReplying && (
              <div className="mt-3 flex items-start gap-3 animate-fade-in pl-1">
                <div className="flex-1">
                  <CommentInput
                    onSubmit={content => onAddReply(content, comment._id)}
                    placeholder={`Trả lời ${replyingTo.username}...`}
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onCancelReply}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Hủy trả lời"
                >
                  <X />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Replies Container - Pure whitespace, no borders */}
        {comment.replies?.length > 0 && (
          <div className="relative">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                onLike={onLike}
                replyingTo={replyingTo}
                onAddReply={onAddReply}
                onCancelReply={onCancelReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}

        {/* Delete Modal - Keeps original style as it's functional */}
        {showDeleteConfirm && (
          /* ... existing modal code ... */
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="yb-card p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-foreground">
                Xóa bình luận?
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Bạn có chắc muốn xóa bình luận này không?
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CommentItem.displayName = 'CommentItem';

export { CommentItem, CommentInput };
export default CommentItem;
