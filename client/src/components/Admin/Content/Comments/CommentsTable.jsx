import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Flag,
  Calendar,
  MessageCircle,
  Heart,
  Reply,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { getStatusText } from './CommentsUtils.jsx';

const statusBadgeClass = status => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success';
    case 'hidden':
    case 'removed':
      return 'bg-destructive/10 text-destructive';
    case 'flagged':
      return 'bg-warning/10 text-warning';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
};

export default function CommentsTable({
  comments,
  loading,
  activeDropdown,
  setActiveDropdown,
  onViewDetails,
  onModerate,
  onDelete,
}) {
  if (loading && comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner className="size-8 text-text-tertiary mb-4" />
        <p className="text-text-secondary font-medium text-sm">
          Đang tải bình luận...
        </p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <Empty className="border-none py-32 h-full">
        <EmptyMedia variant="icon" className="!size-16 !bg-surface-secondary">
          <MessageCircle className="!size-8" />
        </EmptyMedia>
        <EmptyTitle className="font-semibold text-lg text-text-secondary">
          Không tìm thấy bình luận nào
        </EmptyTitle>
      </Empty>
    );
  }


  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-surface-secondary hover:bg-surface-secondary">
            <TableHead className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
              Tác giả
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em] w-[40%]">
              Nội dung
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
              Trạng thái
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
              Tương tác
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
              Thời gian
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>

          {comments.map(comment => {
            const UserAvatar = comment.user?.avatar;
            const UserName = comment.user?.username || 'Người dùng';
            const UserEmail = comment.user?.email || '';

            return (
              <TableRow
                key={comment._id || comment.id}
                className="hover:bg-surface-hover transition-colors group"
              >

                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={UserAvatar || '/images/default-avatar.png'}
                      alt={`${UserName} avatar`}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded-full object-cover bg-surface-secondary"
                    />
                    <div>
                      <div className="font-semibold text-sm text-content">
                        {UserName}
                      </div>
                      <div className="text-xs text-text-secondary font-medium">
                        {UserEmail}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm text-text-secondary font-medium line-clamp-2 leading-relaxed">
                      {comment.content}
                    </p>
                    {comment.postId && (
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-tertiary">
                        <Reply size={10} />
                        <span>
                          trong bài viết{' '}
                          <span className="text-content hover:underline cursor-pointer font-semibold">
                            #{comment.postId._id?.slice(-6) || '...'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    className={statusBadgeClass(comment.status || 'active')}
                  >
                    {getStatusText(comment.status || 'active')}
                  </Badge>

                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                    <div className="flex items-center gap-1.5" title="Likes">
                      <Heart
                        size={14}
                        className="text-text-tertiary group-hover:text-like transition-colors"
                      />
                      {comment.likes?.length || 0}
                    </div>
                    <div className="flex items-center gap-1.5" title="Replies">
                      <MessageCircle
                        size={14}
                        className="text-text-tertiary group-hover:text-warning transition-colors"
                      />
                      {comment.replies?.length || 0}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <Calendar size={12} />
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === (comment._id || comment.id)
                            ? null
                            : comment._id || comment.id
                        )
                      }
                      onKeyDown={event => {
                        if (event.key === 'Escape') {
                          setActiveDropdown(null);
                        }
                      }}
                      aria-haspopup="menu"
                      aria-expanded={
                        activeDropdown === (comment._id || comment.id)
                      }
                      aria-label="Tùy chọn"
                      className="text-text-secondary hover:bg-surface-hover"
                    >
                      <MoreHorizontal size={18} strokeWidth={1.6} />
                    </Button>

                      {activeDropdown === (comment._id || comment.id) && (
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl py-1.5 z-10 animate-scale-in"
                        >
                        <button
                          type="button"
                          onClick={() => {
                            onViewDetails(comment);
                            setActiveDropdown(null);
                          }}
                          role="menuitem"
                          className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-surface-hover flex items-center gap-2.5 text-text-secondary transition-colors"
                        >
                          <Eye size={16} />
                          Xem chi tiết
                        </button>
                        {(comment.status === 'hidden' ||
                          comment.status === 'flagged') && (
                          <button
                            type="button"
                            onClick={() => {
                              onModerate(comment, 'active');
                              setActiveDropdown(null);
                            }}
                            role="menuitem"
                          className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-surface-hover flex items-center gap-2.5 text-success transition-colors"
                        >
                          <CheckCircle size={16} />
                          Khôi phục
                        </button>
                        )}
                        {comment.status !== 'hidden' && (
                          <button
                            type="button"
                            onClick={() => {
                              onModerate(comment, 'hidden');
                              setActiveDropdown(null);
                            }}
                            role="menuitem"
                            className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-surface-hover flex items-center gap-2.5 text-warning transition-colors"
                          >
                            <Flag size={16} />
                            Ẩn bình luận
                          </button>
                        )}
                        <div className="my-1 mx-2" />
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(comment);
                            setActiveDropdown(null);
                          }}
                          role="menuitem"
                          className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-surface-hover flex items-center gap-2.5 text-error transition-colors"
                        >
                          <Trash2 size={16} />
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    )}
                  </div>

                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}