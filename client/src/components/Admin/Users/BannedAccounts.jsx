import { useId, useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Search,
  UserX,
  Check,
  RefreshCcw,
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
import { useBannedUsers, useUnbanUser } from '@/hooks/useAdminQuery';
import AdminPagination from '@/components/Admin/Shared/AdminPagination.jsx';

const BannedAccounts = () => {
  const bannedSearchId = useId();

  /* State */
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!showUnbanModal) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setShowUnbanModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUnbanModal]);

  // Queries
  const {
    data: bannedData,
    isLoading: loading,
    refetch: refetchBanned,
  } = useBannedUsers({
    page: currentPage,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const bannedUsersList = bannedData?.users || bannedData || []; // Adjust based on API structure
  const bannedUsers = Array.isArray(bannedUsersList) ? bannedUsersList : [];
  const pagination = {
    totalPages: bannedData?.totalPages || 1,
    total: bannedData?.totalUsers || 0,
  };

  // Mutations
  const unbanMutation = useUnbanUser();

  const handleUnban = user => {
    setSelectedUser(user);
    setShowUnbanModal(true);
  };

  const confirmUnban = async () => {
    if (!selectedUser) return;
    try {
      await unbanMutation.mutateAsync({ userId: selectedUser._id });
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
    setShowUnbanModal(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    refetchBanned();
  };

  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Bị chặn
          </p>
          <h2 className="text-2xl font-semibold text-content">
            Tài khoản bị chặn
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Quản lý danh sách người dùng bị khóa truy cập (
            {pagination?.total || bannedUsers.length} người)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                event.currentTarget.blur();
              }
            }}
            className="bg-surface-secondary text-text-secondary hover:bg-surface-hover disabled:opacity-50"
            aria-label="Làm mới danh sách bị chặn"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card p-4">
        <div className="relative max-w-md w-full">
          <label htmlFor={bannedSearchId} className="sr-only">
            Tìm kiếm tài khoản bị chặn
          </label>
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            id={bannedSearchId}
            type="text"
            placeholder="Tìm kiếm tài khoản bị chặn..."
            value={searchQuery}
            aria-label="Search banned accounts"
            onChange={e => setSearchQuery(e.target.value)}
            className="admin-input w-full pl-11"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="admin-card overflow-hidden">

        {loading && bannedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
            <Spinner className="size-8 mb-4" />
            <p className="font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : bannedUsers.length === 0 ? (
          <Empty className="border-none py-24 h-full">
            <EmptyMedia variant="icon" className="!size-16 !bg-surface-secondary">
              <UserX className="opacity-20 !size-8" />
            </EmptyMedia>
            <EmptyTitle className="font-medium text-text-secondary">
              Không có tài khoản nào bị chặn
            </EmptyTitle>
          </Empty>
        ) : (

          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-surface-secondary hover:bg-surface-secondary">
                    <TableHead className="text-left px-5 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                      Người dùng
                    </TableHead>
                    <TableHead className="text-left px-5 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                      Lý do
                    </TableHead>
                    <TableHead className="text-left px-5 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                      Thời hạn
                    </TableHead>
                    <TableHead className="text-left px-5 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                      Ngày chặn
                    </TableHead>
                    <TableHead className="text-left px-5 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                      Người thực thi
                    </TableHead>
                    <TableHead className="text-right px-5 py-3 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                      Thao tác
                    </TableHead>
                  </TableRow>

                </TableHeader>
                <TableBody>
                  {bannedUsers.map(user => (
                    <TableRow
                      key={user._id}
                      className="hover:bg-surface-hover transition-colors"
                    >

                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || '/images/default-avatar.png'}
                            alt={user.fullName || user.name}
                            loading="lazy"
                            decoding="async"
                            className="w-10 h-10 rounded-full object-cover grayscale opacity-70"
                          />
                          <div>
                            <div className="font-bold text-sm text-content">
                              {user.fullName || user.name}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[200px] block truncate text-ellipsis">
                          {user.banReason ||
                            user.moderationHistory?.[0]?.reason ||
                            'Không có lý do'}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <Badge
                          className={
                            user.banDuration === 'Permanent' ||
                            !user.banDuration
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                          }
                        >
                          {user.banDuration === 'Permanent' || !user.banDuration
                            ? 'Vĩnh viễn'
                            : user.banDuration}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-sm font-medium text-neutral-500">
                        {user.bannedAt
                          ? new Date(user.bannedAt).toLocaleDateString('vi-VN')
                          : user.moderationHistory?.[0]?.actionDate
                          ? new Date(
                              user.moderationHistory[0].actionDate
                            ).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {user.bannedBy?.fullName ||
                            user.moderationHistory?.[0]?.adminId?.fullName ||
                            'Hệ thống'}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnban(user)}
                          disabled={loading}
                          className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold gap-1.5 ml-auto disabled:opacity-50"
                          aria-label="Mở chặn người dùng"
                        >
                          <Check size={14} />
                          Mở chặn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </>
        )}
      </div>

      {bannedUsers.length > 0 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          canPrev={currentPage > 1 && !loading}
          canNext={currentPage < pagination.totalPages && !loading}
          onPrev={() => handlePageChange(currentPage - 1)}
          onNext={() => handlePageChange(currentPage + 1)}
        />
      )}

      {/* Unban Modal */}
      {showUnbanModal && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              setShowUnbanModal(false);
            }
          }}
        >
          <div className="admin-card w-full max-w-md rounded-2xl p-4 transform animate-in scale-95 duration-200 overflow-hidden">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Check size={32} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Mở chặn người dùng
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed px-4">
                Bạn có chắc chắn muốn khôi phục quyền truy cập cho{' '}
                <span className="text-neutral-900 dark:text-white font-bold">
                  {selectedUser.name}
                </span>
                ? Người dùng sẽ có thể đăng nhập lại ngay lập tức.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 px-4 py-3 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                onClick={() => setShowUnbanModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                onClick={confirmUnban}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannedAccounts;
