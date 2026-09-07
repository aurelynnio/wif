import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { getStatusText } from './ReportsUtils.jsx';

export default function ReportStatusModal({
  isOpen,
  onClose,
  report,
  newStatus,
  onUpdateStatus,
  loading,
}) {
  const [resolutionNote, setResolutionNote] = useState('');

  // Reset note when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setResolutionNote('');
    }
  }, [isOpen]);

  if (!isOpen || !report) return null;

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Cập nhật trạng thái</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Bạn đang thay đổi trạng thái của báo cáo này thành:{' '}
                <span className="font-semibold text-foreground inline-block px-2 py-0.5 rounded-md bg-muted ml-1">
                  {getStatusText(newStatus)}
                </span>
              </p>

              <div className="mb-2">
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Ghi chú cập nhật
                </label>
                <Textarea
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  aria-label="Ghi chú cập nhật"
                  placeholder="Nhập lý do thay đổi trạng thái..."
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => onUpdateStatus(report, newStatus, resolutionNote)}
            disabled={loading}
          >
            {loading && <Spinner />}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}