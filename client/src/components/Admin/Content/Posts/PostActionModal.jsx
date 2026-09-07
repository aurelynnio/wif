import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';

export function DeletePostModal({ isOpen, onClose, onConfirm, loading, post }) {
  if (!isOpen || !post) return null;

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
          <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="admin-card-muted p-4 rounded-xl">
          <p className="text-sm text-muted-foreground line-clamp-3 italic">
            "
            {post.content ||
              post.caption ||
              'Bài viết không có nội dung văn bản'}
            "
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
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ModeratePostModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  action,
  reason,
  setReason,
}) {
  const isHide = action === 'hide';

  if (!isOpen) return null;

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="items-center text-center sm:items-center sm:text-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isHide
                ? 'bg-warning/10 text-warning'
                : 'bg-success/10 text-success'
            }`}
          >
            {isHide ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div className="grid gap-1.5">
            <DialogTitle className="text-lg">
              {isHide ? 'Ẩn bài viết' : 'Hiện bài viết'}
            </DialogTitle>
            <DialogDescription>
              {isHide
                ? 'Vui lòng nhập lý do (bắt buộc)'
                : 'Xác nhận để hiển thị lại bài viết.'}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={
              isHide ? 'Nhập lý do ẩn bài viết...' : 'Ghi chú (tuỳ chọn)'
            }
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading || (isHide && !reason.trim())}
            className={`${
              isHide
                ? 'bg-warning text-white hover:bg-warning/80'
                : 'bg-success text-white hover:bg-success/80'
            }`}
          >
            {loading && <Spinner />}
            {isHide ? 'Xác nhận ẩn' : 'Xác nhận hiện'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PostReportsModal({ isOpen, onClose, reports }) {
  if (!isOpen) return null;

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden max-h-[80vh]">
        <div className="p-4 bg-muted flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
            Danh sách báo cáo
          </DialogTitle>
        </div>
        <div className="p-4 overflow-y-auto space-y-4">
          {reports?.length > 0 ? (
            reports.map(report => (
              <div key={report._id} className="admin-card-muted p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="admin-pill admin-pill-danger text-xs font-semibold">
                    <Shield size={12} className="mr-1.5" />
                    {report.reason}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-3">
                  "{report.description || 'Không có mô tả'}"
                </p>
                <div className="flex items-center gap-2 pt-3 bg-muted rounded-xl px-2 py-1 mt-2">
                  <img
                    src={report.reporter?.avatar || '/images/default-avatar.png'}
                    className="w-6 h-6 rounded-full object-cover"
                    alt={
                      report.reporter?.username
                        ? `${report.reporter.username} avatar`
                        : 'Reporter avatar'
                    }
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Báo cáo bởi:{' '}
                    <span className="text-foreground">
                      @{report.reporter?.username}
                    </span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <CheckCircle size={32} />
              </div>
              <p className="font-semibold text-muted-foreground">
                Không có báo cáo nào.
              </p>
            </div>
          )}
        </div>
        <div className="p-4 bg-muted">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Đóng danh sách
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}