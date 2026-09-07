import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Flag,
  Share2,
  Link2,
  EyeOff,
} from 'lucide-react';
import UserProfilePreview from '@/components/Common/UserProfilePreview';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const PostHeader = ({
  user,
  isOwner,
  formattedTime,
  sharePending,
  showOptions,
  onOptionsChange,
  handleShare,
  handleCopyLink,
  closeOptions,
  onEdit,
  onDelete,
  onReport,
}) => {
  return (
    <div className="flex items-start justify-between mb-3">
      <UserProfilePreview
        userId={user._id || user.id}
        triggerSelector="[data-profile-preview-trigger]"
      >
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <img
              className="w-11 h-11 rounded-full object-cover"
              src={user.avatar}
              alt={user.name}
              loading="lazy"
              decoding="async"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                data-profile-preview-trigger
                className="font-semibold text-foreground hover:underline cursor-pointer"
              >
                {user.name}
              </span>
              {user.verified && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary-foreground"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span data-profile-preview-trigger>@{user.username}</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
      </UserProfilePreview>

      <DropdownMenu open={showOptions} onOpenChange={onOptionsChange}>
        <DropdownMenuTrigger
          aria-label="Tùy chọn bài viết"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Owner actions */}
          {isOwner && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 data-icon="inline-start" />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem data-variant="destructive" onClick={onDelete}>
                <Trash2 data-icon="inline-start" />
                Delete post
              </DropdownMenuItem>
            </>
          )}

          {/* Report - only for non-owners */}
          {!isOwner && (
            <DropdownMenuItem data-variant="destructive" onClick={onReport}>
              <Flag data-icon="inline-start" />
              Report post
            </DropdownMenuItem>
          )}

          <DropdownMenuItem disabled={sharePending} onClick={handleShare}>
            <Share2 data-icon="inline-start" />
            {sharePending ? 'Sharing...' : 'Share post'}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 data-icon="inline-start" />
            Copy link
          </DropdownMenuItem>

          {!isOwner && (
            <DropdownMenuItem onClick={closeOptions}>
              <EyeOff data-icon="inline-start" />
              Hide post
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={closeOptions}>Cancel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostHeader;