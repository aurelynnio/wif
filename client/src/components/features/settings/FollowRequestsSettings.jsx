import { useState } from 'react';
import {
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Loader2,
  Clock,
} from 'lucide-react';
import { notify } from '@/utils/notify';
import {
  useFollowRequests,
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from '@/hooks/useUserQuery';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const FollowRequestsSettings = () => {
  const { data: followRequests, isLoading: loading } = useFollowRequests();
  const acceptMutation = useAcceptFollowRequest();
  const rejectMutation = useRejectFollowRequest();

  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async requestId => {
    setProcessingId(requestId);
    try {
      await acceptMutation.mutateAsync(requestId);
      notify.success('Đã chấp nhận yêu cầu theo dõi');
    } catch (error) {
      notify.error(
        error?.response?.data?.message || 'Không thể chấp nhận yêu cầu'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async requestId => {
    setProcessingId(requestId);
    try {
      await rejectMutation.mutateAsync(requestId);
      notify.success('Đã từ chối yêu cầu theo dõi');
    } catch (error) {
      notify.error(
        error?.response?.data?.message || 'Không thể từ chối yêu cầu'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests =
    (Array.isArray(followRequests) ? followRequests : [])?.filter(request => {
      const user = request.follower || request;
      return (
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  if (loading && !followRequests?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Yêu cầu theo dõi
        </h1>
        <p className="text-muted-foreground text-sm">
          Quản lý các yêu cầu theo dõi từ người dùng khác
        </p>
      </div>

      {/* Search */}
      {followRequests?.length > 0 && (
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm yêu cầu..."
            className="pl-10"
          />
        </div>
      )}

      {/* Request List */}
      <div className="space-y-2">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(request => {
            const user = request.follower || request;
            const requestId = request.id || request._id;
            const isProcessing = processingId === requestId;

            return (
              <div
                key={requestId}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || '/images/default-avatar.png'}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                    {request.createdAt && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(request.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={() => handleAccept(requestId)}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {isProcessing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <UserCheck size={14} />
                    )}
                    Chấp nhận
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleReject(requestId)}
                    disabled={isProcessing}
                    size="sm"
                  >
                    <UserX size={14} />
                    Từ chối
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <UserPlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Không có yêu cầu nào'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Khi có người yêu cầu theo dõi bạn, họ sẽ xuất hiện ở đây'}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      {followRequests?.length > 0 && (
        <Card className="p-4 bg-blue-50/50 dark:bg-blue-900/10">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Mẹo:</strong> Nếu bạn muốn tắt chế độ tài khoản riêng tư,
            hãy vào <strong>Cài đặt &gt; Quyền riêng tư</strong>.
          </p>
        </Card>
      )}
    </div>
  );
};

export default FollowRequestsSettings;

