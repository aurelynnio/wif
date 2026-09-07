import { useId, useState } from 'react';
import {
  Search,
  RefreshCcw,
  Filter,
  ChevronDown,
} from 'lucide-react';
import {
  useAdminComments,
  useModerateComment,
  useDeleteCommentAdmin,
} from '@/hooks/useAdminQuery';
import { useAdminTable } from '@/hooks/useAdminTable';
import { notify } from '@/utils/notify';

import CommentsTable from './CommentsTable';
import { DeleteCommentModal, CommentDetailModal } from './CommentActionModal';
import AdminPagination from '@/components/Admin/Shared/AdminPagination.jsx';

export default function Comments() {
  const commentsSearchId = useId();
  const commentsStatusId = useId();

  const [filterStatus, setFilterStatus] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const {
    list: comments,
    isLoading: loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    handlePageChange,
    handleRefresh,
  } = useAdminTable({
    queryHook: useAdminComments,
    listKey: 'comments',
    params: { status: filterStatus || undefined },
  });

  const { mutate: moderateComment } = useModerateComment();
  const { mutate: deleteComment, isLoading: isDeleting } =
    useDeleteCommentAdmin();

  const handleDelete = () => {
    if (!commentToDelete) return;
    deleteComment(
      {
        commentId: commentToDelete._id || commentToDelete.id,
        reason: 'Xóa bởi quản trị viên qua bảng điều khiển',
      },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
          notify.success('Đã xóa bình luận thành công');
        },
        onError: () => {
          notify.error('Có lỗi xảy ra khi xóa bình luận');
        },
      }
    );
  };

  const handleModerate = (comment, status) => {
    moderateComment({
      commentId: comment._id || comment.id,
      action: status === 'active' ? 'restore' : 'hide',
      reason: 'Kiểm duyệt bởi quản trị viên',
    });
  };

  const handleViewDetails = comment => {
    setSelectedComment(comment);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Bình luận
          </p>
          <h2 className="text-2xl font-semibold text-content">
            Quản lý bình luận
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Kiểm duyệt và quản lý tương tác người dùng
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
          className="p-2 rounded-lg bg-surface-secondary text-text-secondary hover:bg-surface-hover transition-colors"
          aria-label="Làm mới bình luận"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 group">
          <label htmlFor={commentsSearchId} className="sr-only">
            Tìm kiếm bình luận
          </label>
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-text-secondary transition-colors"
          />
          <input
            id={commentsSearchId}
            type="text"
            placeholder="Tìm kiếm nội dung, tác giả..."
            value={searchTerm}
            aria-label="Search comments"
            onChange={e => setSearchTerm(e.target.value)}
            className="admin-input w-full pl-10"
          />
        </div>

        <div className="relative min-w-[180px]">
          <label htmlFor={commentsStatusId} className="sr-only">
            Lọc trạng thái bình luận
          </label>
          <Filter
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <select
            id={commentsStatusId}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="admin-select w-full pl-9 pr-9 appearance-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="hidden">Đã ẩn</option>
            <option value="flagged">Bị báo cáo</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
        </div>
      </div>

      {/* Comments Table */}
      <div className="admin-card overflow-hidden">
        <CommentsTable
          comments={comments}
          loading={loading}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          onViewDetails={handleViewDetails}
          onModerate={handleModerate}
          onDelete={comment => {
            setCommentToDelete(comment);
            setShowDeleteModal(true);
          }}
        />
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        canPrev={currentPage > 1 && !loading}
        canNext={currentPage < totalPages && !loading}
        onPrev={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
      />


      {/* Modals */}
      <CommentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        comment={selectedComment}
      />

      <DeleteCommentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        comment={commentToDelete}
      />
    </div>
  );
}

