import { Check, AlertTriangle, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

const AdminActionModal = ({
  isOpen,
  actionType,
  targetName,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  loading,
}) => {
  const getConfig = () => {
    switch (actionType) {
      case 'ban':
      case 'delete':
        return {
          icon: Ban,
          chip: 'bg-destructive/10 text-destructive',
          buttonVariant: 'destructive',
          buttonClass: '',
          title: actionType === 'ban' ? 'Chặn tài khoản' : 'Xóa tài khoản',
        };
      case 'unban':
        return {
          icon: Check,
          chip: 'bg-success/10 text-success',
          buttonVariant: 'default',
          buttonClass: '',
          title: 'Gỡ chặn',
        };
      case 'warn':
        return {
          icon: AlertTriangle,
          chip: 'bg-warning/10 text-warning',
          buttonVariant: 'default',
          buttonClass: 'bg-warning text-white hover:bg-warning/80',
          title: 'Cảnh báo',
        };
      case 'suspend':
        return {
          icon: AlertTriangle,
          chip: 'bg-warning/10 text-warning',
          buttonVariant: 'default',
          buttonClass: 'bg-warning text-white hover:bg-warning/80',
          title: 'Tạm ngưng',
        };
      default:
        return {
          icon: AlertTriangle,
          chip: 'bg-muted text-muted-foreground',
          buttonVariant: 'default',
          buttonClass: '',
          title: 'Xác nhận',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel?.();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center sm:items-center sm:text-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.chip}`}
          >
            <Icon className="size-7" strokeWidth={2.5} />
          </div>
          <div className="grid gap-1.5">
            <DialogTitle className="text-lg">{config.title}</DialogTitle>
            <DialogDescription>
              {actionType === 'ban' &&
                `Bạn có chắc chắn muốn chặn ${targetName}? Quyền truy cập sẽ bị thu hồi ngay lập tức.`}
              {actionType === 'unban' &&
                `Khôi phục quyền truy cập cho ${targetName}?`}
              {actionType === 'warn' &&
                `Gửi cảnh báo chính thức cho ${targetName}?`}
              {actionType === 'delete' &&
                `Xóa vĩnh viễn ${targetName}? Hành động này không thể hoàn tác.`}
              {actionType === 'suspend' &&
                `Tạm ngưng tài khoản ${targetName} trong 7 ngày?`}
            </DialogDescription>
          </div>
        </DialogHeader>

        {['ban', 'suspend', 'warn'].includes(actionType) && (
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2.5">
              {actionType === 'warn' ? 'Nội dung cảnh báo' : 'Lý do thực hiện'}
            </label>
            <Textarea
              value={reason}
              onChange={e => onReasonChange(e.target.value)}
              aria-label="Ly do thuc hien"
              placeholder="Nhập chi tiết tại đây..."
              rows={6}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Hủy bỏ
          </Button>
          <Button
            variant={config.buttonVariant}
            className={config.buttonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Spinner />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminActionModal;