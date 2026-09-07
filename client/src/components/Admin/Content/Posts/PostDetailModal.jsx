import { useState } from 'react';
import {
  Info,
  Flag,
  Video,
  AlertTriangle,
  CheckCircle,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  reports,
  onToggleStatus,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState('content');

  if (!isOpen || !post) return null;

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-muted flex items-center justify-between shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
            Chi tiết bài viết
          </DialogTitle>
        </div>

        {/* Tabs */}
        <div className="flex px-5 shrink-0">
          {[
            { id: 'content', label: 'Nội dung', icon: Info },
            { id: 'reports', label: 'Báo cáo', icon: Flag },
          ].map(tab => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 my-2 text-sm font-semibold rounded-xl transition-colors justify-start ${
                activeTab === tab.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'content' && (
            <div className="space-y-5">
              {(() => {
                const author = post.author || post.user || {};
                const rawMediaItems = post.media || post.images || [];
                const mediaItems = rawMediaItems
                  .map(normalizeMediaItem)
                  .filter(Boolean);
                return (
                  <>
                    <div className="flex items-center gap-4">
                      <img
                        src={author.avatar || '/images/default-avatar.png'}
                        alt={author.name || author.username || 'Author avatar'}
                        className="w-12 h-12 rounded-full object-cover bg-muted"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-foreground tracking-tight">
                          {author.name || author.username}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          @{author.username} •{' '}
                          <span className="text-muted-foreground">
                            {new Date(post.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="admin-card-muted p-4">
                      <p className="text-foreground font-medium text-base leading-relaxed whitespace-pre-wrap">
                        {post.content || post.caption || 'Không có nội dung'}
                      </p>
                    </div>

                    {mediaItems.length > 0 && (
                      <div
                        className={`grid gap-3 ${
                          mediaItems.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                        }`}
                      >
                        {mediaItems.map((media, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-2xl overflow-hidden bg-muted"
                          >
                            {media.type === 'video' ? (
                              <video
                                src={media.url}
                                poster={media.thumbnail || media.poster || media.preview}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-64 object-cover"
                              />
                            ) : (
                              <img
                                src={media.url}
                                alt={`Post media ${idx + 1}`}
                                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            )}
                            {media.type === 'video' && (
                              <div className="absolute top-3 left-3 yb-badge bg-surface/90 text-foreground">
                                <Video size={12} />
                                Video
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="admin-card-muted flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Heart size={12} /> Thích
                        </span>
                        <span className="text-xl font-black text-foreground">
                          {post.likesCount || 0}
                        </span>
                      </div>
                      <div className="admin-card-muted flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <MessageCircle size={12} /> Bình luận
                        </span>
                        <span className="text-xl font-black text-foreground">
                          {post.commentsCount || 0}
                        </span>
                      </div>
                      <div className="admin-card-muted flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Share2 size={12} /> Chia sẻ
                        </span>
                        <span className="text-xl font-black text-foreground">
                          {post.sharesCount || 0}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports?.length > 0 ? (
                reports.map(report => (
                  <div key={report._id} className="admin-card-muted p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="yb-badge bg-warning/15 text-warning font-bold">
                          <AlertTriangle size={12} className="mr-1.5" />
                          {report.reason}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-4 italic p-3 bg-muted rounded-xl">
                      "{report.description || 'Không có chi tiết bổ sung.'}"
                    </p>
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          report.reporter?.avatar ||
                          '/images/default-avatar.png'
                        }
                        alt={`${
                          report.reporter?.username || 'Reporter'
                        } avatar`}
                        className="w-5 h-5 yb-avatar object-cover"
                      />
                      <span className="text-xs font-bold text-muted-foreground">
                        Báo cáo bởi{' '}
                        <span className="text-foreground">
                          @{report.reporter?.username || 'unknown'}
                        </span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-muted rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4 text-success">
                    <CheckCircle size={32} />
                  </div>
                  <p className="font-bold text-foreground mb-1">
                    Nội dung sạch
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Không có báo cáo nào cho bài viết này.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-muted flex gap-3 shrink-0">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              onToggleStatus(post);
            }}
            className={`flex-1 py-3 text-sm ${
              post.status === 'active'
                ? 'bg-warning text-white hover:bg-warning/80'
                : 'bg-success text-white hover:bg-success/80'
            }`}
          >
            {post.status === 'active' ? 'Ẩn bài viết' : 'Hiện bài viết'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDelete(post);
            }}
            className="flex-1 py-3 text-sm"
          >
            Xóa bài viết
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-8 py-3 text-sm"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}