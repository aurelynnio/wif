import { useState } from 'react';
import { AlertTriangle, User, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getTargetIcon, getTargetTypeText } from './ReportsUtils.jsx';

export default function ReportDetailModal({
  report,
  isOpen,
  onClose,
  onResolve,
  onReject,
}) {
  const [resolutionNote, setResolutionNote] = useState('');

  if (!isOpen || !report) return null;

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
            Chi tiết báo cáo
          </DialogTitle>
        </div>

        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {/* Reporter Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-2xl">
            <img
              src={report.reporter?.avatar || '/images/default-avatar.png'}
              alt={
                report.reporter?.name || report.reporter?.username || 'Reporter'
              }
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-0.5">
                Người báo cáo
              </p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-base">
                  {report.reporter?.name || 'Ẩn danh'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  @{report.reporter?.username || 'unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Report Reason */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-foreground mb-2.5">
              Lý do báo cáo
            </p>
            <div className="admin-pill admin-pill-warning text-sm">
              <AlertTriangle size={16} />
              {report.reason}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-foreground mb-2.5">
              Mô tả chi tiết
            </p>
            <p className="text-muted-foreground leading-relaxed bg-muted p-4 rounded-2xl italic text-sm">
              "{report.description || 'Không có mô tả bổ sung.'}"
            </p>
          </div>

          {/* Target Content */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="p-1 rounded-md bg-muted text-muted-foreground">
                {getTargetIcon(report.target?.type)}
              </div>
              <p className="text-xs font-semibold text-foreground">
                Nội dung bị báo cáo
              </p>
            </div>
            <div className="p-4 bg-muted rounded-2xl relative group">
              <div className="absolute top-4 right-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] bg-popover px-2 py-1 rounded-md">
                {getTargetTypeText(report.target?.type)}
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <User size={12} />
                Tác giả:{' '}
                <span className="text-foreground">
                  {report.target?.author}
                </span>
              </p>
              <p className="text-foreground font-medium leading-relaxed pr-16 text-sm">
                "{report.target?.content}"
              </p>
            </div>
          </div>

          {/* Resolution Note Input */}
          {report.status === 'pending' && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-foreground mb-2.5">
                Ghi chú giải quyết
              </p>
              <Textarea
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Nhập ghi chú cho quyết định của bạn..."
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {(report.status === 'pending' || !report.status) && (
          <div className="p-4 pt-2 bg-muted flex gap-3 rounded-b-3xl shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onReject(report, resolutionNote)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              Từ chối báo cáo
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => onResolve(report, resolutionNote)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Chấp nhận báo cáo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}