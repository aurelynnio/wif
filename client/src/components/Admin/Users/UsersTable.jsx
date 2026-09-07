import {
  Eye,
  ShieldOff,
  AlertTriangle,
  Ban,
  Trash2,
  Check,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import StatusBadge from './StatusBadge';

const UsersTable = ({
  users,
  loading,
  onViewUser,
  onBanUser,
  onUnbanUser,
  onWarnUser,
  onDeleteUser,
}) => {
  return (
    <div className="flex flex-col h-full">

      {loading && users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Spinner className="size-10 text-text-secondary mb-4" />
                  <p className="text-text-secondary font-medium">
                    Đang tải danh sách người dùng...
                  </p>
                </div>
              ) : users.length === 0 ? (
                <Empty className="border-none py-24 h-full">
                  <EmptyMedia variant="icon" className="!size-16 !bg-surface-secondary">
                    <UserPlus className="opacity-50 !size-8" />
                  </EmptyMedia>
                  <EmptyTitle className="font-medium text-text-secondary">
                    Không tìm thấy người dùng phù hợp
                  </EmptyTitle>
                </Empty>
              ) : (

        <>
          <div className="overflow-x-auto custom-scrollbar">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-surface-secondary hover:bg-surface-secondary">
                  <TableHead className="text-left px-4 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                    Người dùng
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                    Vai trò
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                    Hoạt động
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                    Tham gia
                  </TableHead>
                  <TableHead className="text-right px-4 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                    Thao tác
                  </TableHead>
                </TableRow>

              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow
                    key={user._id}
                    className="group hover:bg-surface-hover transition-colors"
                  >

                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatar || '/images/default-avatar.png'}
                            alt={
                              user.name || user.username
                                ? `${user.name || user.username} avatar`
                                : 'User avatar'
                            }
                            loading="lazy"
                            decoding="async"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {(user.verified || user.isVerified) && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-info text-white p-0.5 rounded-full">
                              <Check size={8} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-content text-sm">
                            {user.name || 'Người dùng YiBu'}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            @{user.username || 'username'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center h-5 px-2 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-surface-secondary text-text-secondary'
                          }`}
                        >
                          {user.role || 'thành viên'}
                        </span>

                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={user.status || 'active'} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-text-secondary">
                          {user.postsCount || 0} bài viết
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {(user.followersCount || 0).toLocaleString()}{' '}
                          followers
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onViewUser(user)}
                          onKeyDown={event => {
                            if (event.key === 'Escape') {
                              event.currentTarget.blur();
                            }
                          }}
                          className="text-text-secondary hover:text-content"
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết người dùng"
                        >
                          <Eye size={18} strokeWidth={1.6} />
                        </Button>

                        {user.status === 'banned' ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onUnbanUser(user)}
                            className="text-success"
                            title="Gỡ chặn"
                            aria-label="Gỡ chặn người dùng"
                          >
                            <ShieldOff size={18} strokeWidth={1.6} />
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onWarnUser(user)}
                              className="text-warning"
                              title="Cảnh báo"
                              aria-label="Cảnh báo người dùng"
                            >
                              <AlertTriangle size={18} strokeWidth={1.6} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onBanUser(user)}
                              className="text-destructive"
                              title="Chặn người dùng"
                              aria-label="Chặn người dùng"
                            >
                              <Ban size={18} strokeWidth={1.6} />
                            </Button>
                          </>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDeleteUser(user)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Xóa người dùng"
                          aria-label="Xóa người dùng"
                        >
                          <Trash2 size={18} strokeWidth={1.6} />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </>
      )}
    </div>
  );
};

export default UsersTable;
