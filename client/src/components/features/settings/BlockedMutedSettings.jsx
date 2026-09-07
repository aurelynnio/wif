import { useState } from 'react';
import { UserX, VolumeX, Search, Ban } from 'lucide-react';
import { notify } from '@/utils/notify';
import {
  useBlockedUsers,
  useMutedUsers,
  useUnblockUser,
  useUnmuteUser,
} from '@/hooks/useUserQuery';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BlockedMutedSettings = () => {
  const { data: blockedUsers, isLoading: blockedLoading } = useBlockedUsers();
  const { data: mutedUsers, isLoading: mutedLoading } = useMutedUsers();
  const unblockMutation = useUnblockUser();
  const unmuteMutation = useUnmuteUser();

  const loading = blockedLoading || mutedLoading;

  const [activeTab, setActiveTab] = useState('blocked');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUnblock = async userId => {
    if (!window.confirm('Bạn có chắc muốn bỏ chặn người dùng này?')) return;

    try {
      await unblockMutation.mutateAsync(userId);
      notify.success('Đã bỏ chặn người dùng');
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Không thể bỏ chặn');
    }
  };

  const handleUnmute = async userId => {
    if (!window.confirm('Bạn có chắc muốn bỏ ẩn người dùng này?')) return;

    try {
      await unmuteMutation.mutateAsync(userId);
      notify.success('Đã bỏ ẩn người dùng');
    } catch (error) {
      notify.error(error?.response?.data?.message || 'Không thể bỏ ẩn');
    }
  };

  const filteredBlockedUsers =
    (Array.isArray(blockedUsers) ? blockedUsers : [])?.filter(
      user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredMutedUsers =
    (Array.isArray(mutedUsers) ? mutedUsers : [])?.filter(
      user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const UserItem = ({ user, type }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/70 transition-colors">
      <div className="flex items-center gap-3">
        <img
          src={user.avatar || '/images/default-avatar.png'}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            {user.fullName || user.username}
          </p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      <Button
        variant={type === 'blocked' ? 'destructive' : 'secondary'}
        onClick={() =>
          type === 'blocked'
            ? handleUnblock(user.id || user._id)
            : handleUnmute(user.id || user._id)
        }
        size="sm"
      >
        {type === 'blocked' ? 'Bỏ chặn' : 'Bỏ ẩn'}
      </Button>
    </div>
  );

  if (loading) {
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
          Người dùng bị chặn & ẩn
        </h1>
        <p className="text-muted-foreground text-sm">
          Quản lý danh sách người dùng bạn đã chặn hoặc ẩn
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="blocked" className="w-full">
            <Ban size={16} />
            <span>Đã chặn ({blockedUsers?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="muted" className="w-full">
            <VolumeX size={16} />
            <span>Đã ẩn ({mutedUsers?.length || 0})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
          className="pl-10"
        />
      </div>

      {/* User List */}
      <div className="space-y-2">
        {activeTab === 'blocked' ? (
          filteredBlockedUsers.length > 0 ? (
            filteredBlockedUsers.map(user => (
              <UserItem key={user.id || user._id} user={user} type="blocked" />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <UserX className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa chặn ai'}
              </p>
            </div>
          )
        ) : filteredMutedUsers.length > 0 ? (
          filteredMutedUsers.map(user => (
            <UserItem key={user.id || user._id} user={user} type="muted" />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <VolumeX className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa ẩn ai'}
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <Card className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          Sự khác biệt giữa Chặn và Ẩn
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Ban size={14} className="mt-0.5 text-destructive" />
            <p>
              <span className="font-medium text-foreground">Chặn:</span>{' '}
              Người dùng không thể xem profile, gửi tin nhắn hoặc tương tác với
              bạn.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <VolumeX size={14} className="mt-0.5 text-amber-500" />
            <p>
              <span className="font-medium text-foreground">Ẩn:</span>{' '}
              Bài viết của người dùng sẽ không hiển thị trong feed của bạn,
              nhưng họ vẫn có thể tương tác.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BlockedMutedSettings;

