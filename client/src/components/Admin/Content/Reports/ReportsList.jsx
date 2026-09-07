import React from 'react';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  getTargetIcon,
  getStatusText,
  getTargetTypeText,
} from './ReportsUtils.jsx';

const statusBadgeClass = status => {
  switch (status) {
    case 'pending':
      return 'bg-warning/10 text-warning';
    case 'resolved':
      return 'bg-success/10 text-success';
    case 'rejected':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
};

export default function ReportsList({
  loading,
  reports,
  activeDropdown,
  setActiveDropdown,
  onViewDetails,
  onStartReview,
  onOpenStatusModal,
}) {
  if (loading && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size={40} className="animate-spin text-text-tertiary mb-4" />
        <p className="text-text-secondary font-medium">
          Đang tải báo cáo...
        </p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Empty className="border-none py-24 h-full">
        <EmptyMedia variant="icon" className="!size-20 !bg-surface-secondary">
          <CheckCircle className="!size-10 !text-text-tertiary" />
        </EmptyMedia>
        <EmptyTitle className="font-bold text-lg text-content">
          Không tìm thấy báo cáo nào
        </EmptyTitle>
        <EmptyDescription>Hệ thống an toàn.</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map(report => {
        const reporter = report.reporter || report.reportedBy || {};
        const targetType = report.targetType || report.target?.type || 'post';
        const targetContent =
          report.targetContent ||
          report.target?.content ||
          report.content ||
          '';
        const targetAuthor = report.targetAuthor || report.target?.author || '';

        return (
          <div
            key={report._id || report.id}
            className="admin-card p-4 hover:bg-surface-hover transition-colors duration-200"
          >

            <div className="flex items-start gap-4">
              {/* Reporter Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={reporter.avatar || '/images/default-avatar.png'}
                  alt={reporter.name || reporter.username || 'Reporter'}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-secondary flex items-center justify-center text-text-tertiary">
                  {getTargetIcon(targetType)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-content text-sm">
                        {reporter.name || reporter.username || 'Ẩn danh'}
                      </h3>
                      <span className="text-text-secondary text-sm">
                        báo cáo
                      </span>
                      <span className="admin-chip">
                        {getTargetTypeText(targetType)}
                      </span>

                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString(
                              'vi-VN'
                            )
                          : 'N/A'}
                      </span>
                      <span className="text-text-tertiary opacity-60">
                        •
                      </span>
                      <span>ID: {report._id?.slice(-6) || '...'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={statusBadgeClass(
                        report.status || 'pending'
                      )}
                    >
                      {getStatusText(report.status || 'pending')}
                    </Badge>


                    {/* Actions Dropdown */}
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === (report._id || report.id)
                              ? null
                              : report._id || report.id
                          )
                        }
                        onKeyDown={event => {
                          if (event.key === 'Escape') {
                            setActiveDropdown(null);
                          }
                        }}
                        aria-haspopup="menu"
                        aria-expanded={
                          activeDropdown === (report._id || report.id)
                        }
                        aria-label="Tùy chọn"
                        className="text-text-tertiary hover:bg-surface-hover"
                      >
                        <MoreHorizontal size={18} strokeWidth={1.6} />
                      </Button>

                      {activeDropdown === (report._id || report.id) && (
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl py-1.5 z-20 overflow-hidden animate-scale-in"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onViewDetails(report);
                              setActiveDropdown(null);
                            }}
                            role="menuitem"
                            className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-surface-hover flex items-center gap-2.5 text-text-secondary transition-colors"
                          >
                            <Eye size={16} />
                            Xem chi tiết
                          </button>
                          {(report.status === 'pending' || !report.status) && (
                            <>
                              <div className="my-1 mx-2" />
                              <button
                                type="button"
                                onClick={() => {
                                  onStartReview(report);
                                  setActiveDropdown(null);
                                }}
                                role="menuitem"
                                className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-surface-hover flex items-center gap-2.5 text-warning transition-colors"
                              >
                                <RefreshCcw size={16} />
                                Xem xét
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenStatusModal(report, 'resolved');
                                  setActiveDropdown(null);
                                }}
                                role="menuitem"
                                className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-surface-hover flex items-center gap-2.5 text-success transition-colors"
                              >
                                <CheckCircle size={16} />
                                Chấp nhận
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenStatusModal(report, 'rejected');
                                  setActiveDropdown(null);
                                }}
                                role="menuitem"
                                className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-surface-hover flex items-center gap-2.5 text-error transition-colors"
                              >
                                <XCircle size={16} />
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Reason Badge */}
                <div className="mb-2">
                  <Badge className="bg-surface-secondary text-text-secondary text-xs font-semibold">
                    <span className="font-semibold">Lý do:</span>{' '}
                    {report.reason || report.type || 'Vi phạm'}
                  </Badge>
                </div>


                {/* Description */}
                {report.description && (
                  <p className="text-text-secondary text-sm mb-3 pl-3 bg-surface-secondary py-2 rounded-lg italic">
                    "{report.description}"
                  </p>
                )}

                {/* Target Content Preview */}
                <div className="flex items-center gap-3 pt-3 bg-surface-secondary rounded-xl px-3 py-2 mt-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">
                      Nội dung bị báo cáo
                    </p>
                    <p className="text-sm font-medium text-content truncate">
                      {targetContent || (
                        <span className="text-text-tertiary italic">
                          Nội dung không khả dụng
                        </span>
                      )}
                    </p>
                  </div>
                  {targetAuthor && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">
                        Tác giả
                      </p>
                      <p className="text-sm font-medium text-content">
                        {targetAuthor}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}