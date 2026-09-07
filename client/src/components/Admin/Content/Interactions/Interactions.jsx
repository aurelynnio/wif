import { useId, useState } from 'react';
import {
  Search,
  ChevronDown,
  Activity,
  RefreshCcw,
  Filter,
} from 'lucide-react';
import { useAdminInteractions } from '@/hooks/useAdminQuery';
import { useAdminTable } from '@/hooks/useAdminTable';
import AdminPagination from '@/components/Admin/Shared/AdminPagination.jsx';

import InteractionStats from './InteractionStats';
import InteractionsList from './InteractionsList';

export default function Interactions() {
  const interactionsSearchId = useId();
  const interactionsTypeId = useId();

  const [filterType, setFilterType] = useState('all');

  const {
    list: interactionsList,
    isLoading: loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    handleRefresh,
    handlePageChange,
    data: interactionsData,
  } = useAdminTable({
    queryHook: useAdminInteractions,
    listKey: 'interactions',
    limit: 20,
    params: { type: filterType !== 'all' ? filterType : undefined },
  });

  const interactionStats = interactionsData?.interactionStats || {};
  const pagination = interactionsData?.pagination || {};

  return (
    <div className="admin-page pb-10">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Tương tác
          </p>
          <h1 className="text-2xl font-semibold text-content flex items-center gap-3">
            <Activity className="text-content" size={22} />
            Hoạt động tương tác
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Quản lý và theo dõi các hoạt động tương tác trong hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.currentTarget.blur();
            }
          }}
          className="p-2 rounded-lg bg-surface-secondary text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50"
          aria-label="Làm mới tương tác"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <InteractionStats stats={interactionStats} />

      {/* Filters */}
      <div className="admin-card p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1 w-full">
          <label htmlFor={interactionsSearchId} className="sr-only">
            Tìm kiếm tương tác
          </label>
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            id={interactionsSearchId}
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            aria-label="Search interactions"
            onChange={e => setSearchTerm(e.target.value)}
            className="admin-input w-full pl-10"
          />
        </div>

        <div className="relative min-w-[220px]">
          <label htmlFor={interactionsTypeId} className="sr-only">
            Lọc loại tương tác
          </label>
          <Filter
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <select
            id={interactionsTypeId}
            value={filterType}
            onChange={e => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-select w-full pl-9 pr-9 appearance-none cursor-pointer"
          >
            <option value="all">Tất cả tương tác</option>
            <option value="like">Lượt thích</option>
            <option value="comment">Bình luận</option>
            <option value="share">Chia sẻ</option>
            <option value="follow">Theo dõi</option>
            <option value="save">Lưu bài</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="admin-card p-5 min-h-[400px]">
        <InteractionsList interactions={interactionsList} loading={loading} />
      </div>

      {/* Pagination */}
      {interactionsList.length > 0 && (
        <AdminPagination
          currentPage={currentPage}
          label={
            <span className="text-sm text-text-secondary">
              Hiển thị{' '}
              <span className="font-semibold text-content">
                {interactionsList.length}
              </span>{' '}
              /{' '}
              <span className="font-semibold text-content">
                {pagination?.total || 0}
              </span>{' '}
              tương tác
            </span>
          }
          canPrev={currentPage > 1 && !loading}
          canNext={!!pagination?.hasMore && !loading}
          onPrev={() => handlePageChange(currentPage - 1)}
          onNext={() => handlePageChange(currentPage + 1)}
        />
      )}
    </div>

  );
}
