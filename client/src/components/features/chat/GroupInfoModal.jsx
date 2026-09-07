import { useState, useEffect } from 'react';
import {
  Edit,
  Search,
  UserPlus,
  UserMinus,
  Check,
  LogOut,
  X,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { useSearchUsers } from '@/hooks/useSearchQuery';
import { useDebounce } from '@/hooks/useDebounce';

const getInitials = name =>
  (name || '?')
    .split(' ')
    .map(w => w?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const GroupInfoModal = ({
  isOpen,
  onClose,
  conversation,
  currentUserId,
  onRename,
  onAddMember,
  onRemoveMember,
  onLeaveGroup,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(conversation?.name || '');
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 500);

  // React Query Hook
  const { data: searchData, isFetching: isSearching } = useSearchUsers({
    query: debouncedQuery,
    limit: 5,
  });

  const searchResults = searchData?.users || [];

  useEffect(() => {
    if (conversation) {
      setNewName(conversation.name || '');
    }
  }, [conversation]);

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

  if (!conversation) return null;

  const isAdmin =
    conversation.admin === currentUserId ||
    conversation.members?.[0]?._id === currentUserId;

  const handleRename = () => {
    if (newName.trim() && newName !== conversation.name) {
      onRename(newName);
      setIsEditingName(false);
    }
  };

  const handleUserKeyDown = (event, user) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onAddMember(user._id);
      setSearchQuery('');
      setShowAddMember(false);
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
            Thông tin nhóm
          </DialogTitle>
          <DialogDescription className="sr-only">
            Thông tin nhóm chat
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 px-5 py-4">
          {/* Group Branding */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-3xl bg-foreground text-background flex items-center justify-center text-4xl font-bold shadow-lg">
              {conversation.name
                ? conversation.name.charAt(0).toUpperCase()
                : 'G'}
            </div>
            <div className="w-full flex items-center justify-center gap-2">
              {isEditingName ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    id="group-name-edit"
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    aria-label="Group name"
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    onClick={handleRename}
                    size="icon"
                    aria-label="Đổi tên"
                  >
                    <Check size={18} />
                  </Button>
                  <Button
                    onClick={() => setIsEditingName(false)}
                    size="icon"
                    variant="secondary"
                    aria-label="Hủy đổi tên"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-foreground truncate">
                    {conversation.name || 'Nhóm chưa đặt tên'}
                  </h3>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setIsEditingName(true);
                        setNewName(conversation.name || '');
                      }}
                      aria-label="Đổi tên nhóm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit size={18} />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Members Listing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Thành viên ({conversation.members?.length || 0})
              </h4>
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  <UserPlus size={16} data-icon="inline-start" /> Thêm mới
                </Button>
              )}
            </div>

            {/* Add Member Search Area */}
            {showAddMember && (
              <div className="bg-muted/40 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <div className="relative mb-3">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="group-member-search"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Search members"
                    placeholder="Tìm tên bạn bè..."
                    className="pl-10"
                  />
                </div>
                {isSearching ? (
                  <div className="flex justify-center p-4">
                    <Spinner size={20} className="text-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-52 overflow-y-auto space-y-2 custom-scrollbar">
                    {searchResults.map(user => {
                      const isMember = conversation.members?.some(
                        m => m._id === user._id
                      );
                      return (
                        <div
                          key={user._id}
                          onClick={() => {
                            onAddMember(user._id);
                            setSearchQuery('');
                            setShowAddMember(false);
                          }}
                          onKeyDown={event => handleUserKeyDown(event, user)}
                          role="button"
                          tabIndex={0}
                          className="flex items-center justify-between p-2.5 hover:bg-foreground/5 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
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
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {user.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          {isMember ? (
                            <Badge variant="secondary">Đã có mặt</Badge>
                          ) : (
                            <Button
                              onClick={() => {
                                onAddMember(user._id);
                                setSearchQuery('');
                                setShowAddMember(false);
                              }}
                              className="px-3 h-8 text-xs font-bold"
                            >
                              Thêm
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  searchQuery && (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      Không tìm thấy ai
                    </p>
                  )
                )}
              </div>
            )}

            <div className="space-y-4">
              {conversation.members?.map(member => (
                <div
                  key={member._id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-11 flex-shrink-0">
                      <AvatarImage
                        src={member.avatar || 'https://via.placeholder.com/150'}
                        alt={member.name}
                      />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{member.username}
                        {conversation.admin === member._id && (
                          <Badge variant="secondary" className="ml-2">
                            Trưởng nhóm
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  {isAdmin && member._id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemoveMember(member._id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Mời ra khỏi nhóm"
                      aria-label="Mời ra khỏi nhóm"
                    >
                      <UserMinus size={18} />
                    </Button>
                  )}
                  {member._id === currentUserId && (
                    <Badge variant="secondary">Bạn</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="m-0 rounded-none border-t border-border px-5 py-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onLeaveGroup}
          >
            <LogOut data-icon="inline-start" />
            Rời khỏi nhóm này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupInfoModal;