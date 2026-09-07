import { Trash2, Calendar, MessageCircle, Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getStatusStyle, getStatusText } from './CommentsUtils.jsx';

export const DeleteCommentModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  comment,
}) => {
  if (!isOpen || !comment) return null;

  return (
    <AlertDialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <AlertDialogContent>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <Trash2 />
        </AlertDialogMedia>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="admin-card-muted p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={comment.user?.avatar || '/images/default-avatar.png'}
              className="w-5 h-5 yb-avatar"
              alt={`${comment.user?.username || 'User'} avatar`}
            />
            <span className="text-xs font-bold text-foreground">
              {comment.user?.username}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 italic">
            "{comment.content}"
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Spinner /> : <Trash2 data-icon="inline-start" />}
            Xóa ngay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const CommentDetailModal = ({ isOpen, onClose, comment }) => {
  if (!isOpen || !comment) return null;

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-muted flex items-center justify-between shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
            Chi tiết bình luận
          </DialogTitle>
        </div>

        <div className="p-4 space-y-5 overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <img
              src={comment.user?.avatar || '/images/default-avatar.png'}
              alt={`${comment.user?.username || 'User'} avatar`}
              className="w-14 h-12 rounded-full object-cover bg-muted"
            />
            <div>
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                {comment.user?.username || 'Người dùng'}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {comment.user?.email}
              </p>
            </div>
          </div>

          {/* Comment Content */}
          <div className="bg-muted p-4 rounded-2xl relative group overflow-hidden">
            <MessageCircle
              size={120}
              className="absolute -right-4 -bottom-4 text-muted-foreground/20 opacity-30 rotate-12 transition-transform group-hover:scale-110"
            />
            <p className="text-base text-foreground leading-relaxed relative z-10 font-medium">
              "{comment.content}"
            </p>
            <div className="flex items-center gap-2 mt-4 pt-4 relative z-10">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Đăng vào:
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Calendar size={12} />
                {new Date(comment.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Stats & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted flex flex-col items-center justify-center gap-1">
              <Heart size={20} className="text-destructive mb-1 fill-destructive" />
              <span className="text-xl font-black text-foreground tracking-tight">
                {comment.likes?.length || 0}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Lượt thích
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-muted flex flex-col items-center justify-center gap-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-1 ${getStatusStyle(
                  comment.status || 'active'
                )}`}
              >
                {getStatusText(comment.status || 'active')}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-auto">
                Trạng thái
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};