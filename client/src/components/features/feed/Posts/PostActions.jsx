import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatCount } from '@/utils/numberUtils';

const PostActions = ({
  isLiked,
  isSaved,
  likeCount,
  commentCount,
  likeLoading,
  saveLoading,
  sharePending,
  onLike,
  onComment,
  onShare,
  onSave,
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Left Actions */}
      <div className="flex items-center gap-1">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={likeLoading}
          className={
            isLiked
              ? 'text-red-500 hover:text-red-500'
              : 'text-muted-foreground hover:text-red-500'
          }
        >
          {likeLoading ? (
            <Spinner />
          ) : (
            <Heart data-icon="inline-start" className={isLiked ? 'fill-current' : ''} />
          )}
          {likeCount > 0 && (
            <span className="text-sm font-medium">{formatCount(likeCount)}</span>
          )}
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="text-muted-foreground hover:text-blue-500"
        >
          <MessageCircle data-icon="inline-start" />
          {commentCount > 0 && (
            <span className="text-sm font-medium">
              {formatCount(commentCount)}
            </span>
          )}
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          disabled={sharePending}
          className="text-muted-foreground hover:text-green-500"
        >
          {sharePending ? <Spinner /> : <Send data-icon="inline-start" />}
        </Button>
      </div>

      {/* Right Actions */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onSave}
        disabled={saveLoading}
        aria-label={isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        className={
          isSaved
            ? 'text-amber-500 hover:text-amber-500'
            : 'text-muted-foreground hover:text-amber-500'
        }
      >
        {saveLoading ? (
          <Spinner />
        ) : (
          <Bookmark className={isSaved ? 'fill-current' : ''} />
        )}
      </Button>
    </div>
  );
};

export default PostActions;