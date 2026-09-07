import { useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

const getInitials = name =>
  (name || '?')
    .split(' ')
    .map(w => w?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const CreateGroupModal = ({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  searchQuery,
  onSearchChange,
  searchResults,
  selectedUsers,
  onToggleUser,
  isSearching,
  onSubmit,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleUserKeyDown = (event, user) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleUser(user);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="flex flex-col max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="flex-row items-center justify-between border-b px-5 py-4">
          <DialogTitle className="text-lg font-bold">
            Tạo nhóm mới
          </DialogTitle>
          <DialogDescription className="sr-only">
            Biểu mẫu tạo nhóm mới
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-sm font-semibold">
              Tên nhóm
            </Label>
            <Input
              id="group-name"
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm của bạn..."
              aria-label="Group name"
            />
          </div>

          {/* User Search */}
          <div className="flex min-h-0 flex-1 flex-col space-y-2">
            <Label htmlFor="group-search" className="text-sm font-semibold">
              Thêm thành viên
            </Label>
            <div className="relative mb-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="group-search"
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Tìm kiếm bạn bè..."
                aria-label="Search users"
                className="pl-10"
              />
            </div>

            {/* Selected Users Chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-y-auto py-1">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    <span>{user.name}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onToggleUser(user)}
                      aria-label={`Remove ${user.name || 'user'}`}
                      className="hover:text-foreground"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Results Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl bg-muted/30">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-2">
                  <Spinner className="size-6 text-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Đang tìm kiếm...
                  </span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchResults.map(user => {
                    const isSelected = selectedUsers.some(
                      u => u._id === user._id
                    );
                    return (
                      <div
                        key={user._id}
                        onClick={() => onToggleUser(user)}
                        onKeyDown={event => handleUserKeyDown(event, user)}
                        role="button"
                        tabIndex={0}
                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted transition-colors ${
                          isSelected ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={
                                user.avatar ||
                                'https://via.placeholder.com/150'
                              }
                              alt={user.name || 'User avatar'}
                            />
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="bg-foreground text-background rounded-full p-1">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                searchQuery && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy người dùng nào phù hợp
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="m-0 rounded-none border-t border-border px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!groupName.trim() || selectedUsers.length < 2}
          >
            Tạo nhóm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;