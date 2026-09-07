import { useId, useState } from 'react';
import { Search, RefreshCcw, Filter, ChevronDown } from 'lucide-react';
import {
  useAdminUsers,
  useDeleteUser,
  useBanUser,
  useUnbanUser,
  useSuspendUser,
  useWarnUser,
  useAdminUserPosts,
  useAdminUserReports,
} from '@/hooks/useAdminQuery';
import { useAdminTable } from '@/hooks/useAdminTable';

import UsersTable from './UsersTable';
import UserDetailModal from './UserDetailModal';
import AdminActionModal from './AdminActionModal';
import AdminPagination from '@/components/Admin/Shared/AdminPagination.jsx';

const Users = () => {
  const usersSearchId = useId();
  const statusFilterId = useId();

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const {
    list: users,
    isLoading: usersLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    handlePageChange,
    handleRefresh,
  } = useAdminTable({
    queryHook: useAdminUsers,
    listKey: 'users',
    params: { status: filterStatus !== 'all' ? filterStatus : undefined },
  });

  const { data: postsData } = useAdminUserPosts({
    userId: selectedUser?._id,
    enabled: !!selectedUser,
  });
  const currentUserPosts = postsData?.posts || [];

  const { data: reportsData } = useAdminUserReports({
    userId: selectedUser?._id,
    enabled: !!selectedUser,
  });
  const currentUserReports = reportsData?.reports || [];

  const deleteMutation = useDeleteUser();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const suspendMutation = useSuspendUser();
  const warnMutation = useWarnUser();

  const handleViewUser = user => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleBanUser = user => {
    setSelectedUser(user);
    setActionType('ban');
    setShowActionModal(true);
  };

  const handleUnbanUser = user => {
    setSelectedUser(user);
    setActionType('unban');
    setShowActionModal(true);
  };

  const handleWarnUser = user => {
    setSelectedUser(user);
    setActionType('warn');
    setShowActionModal(true);
  };

  const handleDeleteUser = user => {
    setSelectedUser(user);
    setActionType('delete');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      switch (actionType) {
        case 'ban':
          await banMutation.mutateAsync({
            userId: selectedUser._id,
            reason: actionReason,
          });
          break;
        case 'unban':
          await unbanMutation.mutateAsync({ userId: selectedUser._id });
          break;
        case 'suspend':
          await suspendMutation.mutateAsync({
            userId: selectedUser._id,
            days: 7,
            reason: actionReason,
          });
          break;
        case 'warn':
          await warnMutation.mutateAsync({
            userId: selectedUser._id,
            reason: actionReason,
          });
          break;
        case 'delete':
          await deleteMutation.mutateAsync(selectedUser._id);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${actionType} user:`, error);
    }

    setShowActionModal(false);
    setActionReason('');
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Người dùng
          </p>
          <h2 className="text-2xl font-semibold text-content">
            Quản lý người dùng
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Quản lý tài khoản và phân quyền
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.currentTarget.blur();
            }
          }}
          className="p-2 rounded-lg bg-surface-secondary text-text-secondary hover:bg-surface-hover transition-colors"
          aria-label="Làm mới danh sách người dùng"
        >
          <RefreshCcw
            size={18}
            strokeWidth={1.5}
            className={usersLoading ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 w-full">
          <label htmlFor={usersSearchId} className="sr-only">
            Tìm theo tên, email
          </label>
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            id={usersSearchId}
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            aria-label="Search users"
            onChange={e => setSearchTerm(e.target.value)}
            className="admin-input w-full pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[160px]">
            <label htmlFor={statusFilterId} className="sr-only">
              Lọc trạng thái người dùng
            </label>
            <Filter
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <select
              id={statusFilterId}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="admin-select w-full pl-9 pr-9 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="suspended">Tạm ngưng</option>
              <option value="banned">Bị chặn</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="admin-card overflow-hidden">
        <UsersTable
          users={users}
          loading={usersLoading}
          onViewUser={handleViewUser}
          onBanUser={handleBanUser}
          onUnbanUser={handleUnbanUser}
          onWarnUser={handleWarnUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        canPrev={currentPage > 1 && !usersLoading}
        canNext={currentPage < totalPages && !usersLoading}
        onPrev={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
      />


      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          posts={currentUserPosts}
          reports={currentUserReports}
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <AdminActionModal
          isOpen={showActionModal}
          actionType={actionType}
          targetName={selectedUser.name}
          reason={actionReason}
          onReasonChange={setActionReason}
          onConfirm={confirmAction}
          onCancel={() => {
            setShowActionModal(false);
            setActionReason('');
          }}
          loading={usersLoading}
        />
      )}
    </div>
  );
};

export default Users;
