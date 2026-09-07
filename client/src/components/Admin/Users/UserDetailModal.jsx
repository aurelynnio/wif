import { useState } from 'react';
import {
  Mail,
  Calendar,
  Info,
  FileText,
  Flag,
  ShieldOff,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|m3u8|ogg)$/i;

const isVideoUrl = url => {
  if (!url) return false;
  if (VIDEO_EXTENSIONS.test(url)) return true;
  return /\/video\/upload\//i.test(url) || /resource_type=video/i.test(url);
};

const getMediaUrl = media => {
  if (!media) return '';
  if (typeof media === 'string') return media;
  return (
    media.url ||
    media.secure_url ||
    media.secureUrl ||
    media.path ||
    media.src ||
    media.location ||
    media.preview ||
    media.thumbnail ||
    ''
  );
};

const getMediaType = (media, url) => {
  const rawType =
    media?.type ||
    media?.mediaType ||
    media?.resource_type ||
    media?.resourceType ||
    media?.format;
  if (typeof rawType === 'string') {
    const type = rawType.toLowerCase();
    if (type.startsWith('video')) return 'video';
    if (type === 'image') return 'image';
  }
  const mime = media?.mimetype || media?.mimeType || media?.mime_type;
  if (typeof mime === 'string' && mime.startsWith('video/')) return 'video';
  if (typeof media?.duration === 'number' && media.duration > 0) return 'video';
  if (media?.thumbnail || media?.poster) return 'video';
  if (isVideoUrl(url)) return 'video';
  return 'image';
};

const normalizeMediaItem = media => {
  const url = getMediaUrl(media);
  if (!url) return null;
  return {
    ...media,
    url,
    type: getMediaType(media, url),
  };
};

const UserDetailModal = ({ user, onClose, posts, reports }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return null;

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 shrink-0 bg-muted">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar || '/images/default-avatar.png'}
                alt={user.name}
                className="w-20 h-20 yb-avatar"
              />
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-3 tracking-tight">
                  {user.name}
                  <StatusBadge status={user.status || 'active'} />
                </DialogTitle>
                <p className="text-muted-foreground font-medium mt-1">
                  @{user.username}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} /> {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> Tham gia{' '}
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex px-5 bg-popover shrink-0">
          {[
            { id: 'overview', label: 'Tổng quan', icon: Info },
            { id: 'posts', label: 'Bài viết', icon: FileText },
            { id: 'reports', label: 'Báo cáo', icon: Flag },
          ].map(tab => (
            <Button
              type="button"
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 my-2 text-sm font-semibold rounded-xl transition-colors justify-start ${
                activeTab === tab.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </Button>
          ))}
        </div>
        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="yb-card p-4 bg-muted">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Vai trò
                  </p>
                  <p className="text-base font-semibold text-foreground capitalize">
                    {user.role || 'Thành viên'}
                  </p>
                </div>
                <div className="yb-card p-4 bg-muted">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Bài viết
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {user.postsCount || 0}
                  </p>
                </div>
                <div className="yb-card p-4 bg-muted">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Theo dõi
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {(user.followersCount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="yb-card p-4 bg-muted">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Giới thiệu
                </p>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {user.bio || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts?.length > 0 ? (
                posts.map(post => (
                  <div
                    key={post._id}
                    className="yb-card flex gap-4 p-4 hover:bg-muted transition-all bg-muted"
                  >
                    {post.media?.[0] &&
                      (() => {
                        const media = normalizeMediaItem(post.media[0]);
                        if (!media) return null;
                        return media.type === 'video' ? (
                          <video
                            src={media.url}
                            poster={media.thumbnail || media.poster || media.preview}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-20 h-20 rounded-xl object-cover bg-muted"
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt="Post"
                            className="w-20 h-20 rounded-xl object-cover bg-muted"
                          />
                        );
                      })()}
                    <div className="flex-1">
                      <p className="text-foreground font-medium line-clamp-2 mb-3">
                        {post.content || post.caption || 'Không có nội dung'}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <span className="bg-muted px-2.5 py-1 rounded-lg text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span>{post.likesCount} Thích</span>
                        <span>{post.commentsCount} Bình luận</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-muted rounded-2xl">
                  <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">
                    Không có bài viết nào.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports?.length > 0 ? (
                reports.map(report => (
                  <div key={report._id} className="admin-card-muted p-4 bg-destructive/10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="yb-badge inline-flex items-center gap-2 bg-destructive/15 text-destructive text-[10px] font-bold uppercase tracking-wider">
                        <Flag size={12} />
                        {report.reason}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-muted-foreground">
                        Người báo cáo:
                      </span>
                      <span className="font-bold text-foreground">
                        {report.reporter?.username || 'Ẩn danh'}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Trạng thái
                      </span>
                      <span className="text-xs font-bold text-destructive uppercase">
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-muted rounded-2xl">
                  <ShieldOff size={40} className="mx-auto text-success mb-3" />
                  <p className="text-success font-bold">
                    Hồ sơ sạch. Không có báo cáo nào.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 bg-muted flex justify-end shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;