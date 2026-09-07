import { useState } from 'react';
import { Send, Bell, Users, Megaphone, Sparkles } from 'lucide-react';
import { useBroadcastNotification } from '@/hooks/useAdminQuery';
import { NOTIFICATION_TYPES, TARGET_AUDIENCES } from '@/constants/broadcast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

const Broadcast = () => {
  const broadcastMutation = useBroadcastNotification();
  const loading = broadcastMutation.isLoading;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all',
    priority: 'normal',
    link: '',
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = typeId => {
    setFormData(prev => ({ ...prev, type: typeId }));
  };

  const handleAudienceSelect = audienceId => {
    setFormData(prev => ({ ...prev, targetAudience: audienceId }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      // Show toast error here if implemented, otherwise just return
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    try {
      await broadcastMutation.mutateAsync({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetAudience: formData.targetAudience,
        priority: formData.priority,
        link: formData.link || undefined,
      });

      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all',
        priority: 'normal',
        link: '',
      });
    } catch (error) {
      console.error('Broadcast error:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const selectedType = NOTIFICATION_TYPES.find(t => t.id === formData.type);

  return (
    <div className="admin-page pb-10">
      {/* Header */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Thông báo
          </p>
          <h2 className="text-2xl font-semibold text-content flex items-center gap-3">
            <Megaphone className="text-content" size={22} />
            Phát sóng thông báo
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Gửi thông báo đến người dùng hệ thống
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="admin-card p-4 space-y-6">
            {/* Notification Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-content ml-1">
                Loại thông báo
              </Label>
              <div className="flex flex-wrap gap-2">
                {NOTIFICATION_TYPES.map(type => (
                  <Button
                    type="button"
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors duration-200 ${
                      formData.type === type.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <type.icon
                      size={16}
                      className={
                        formData.type === type.id
                          ? 'current-color'
                          : 'text-text-tertiary'
                      }
                      strokeWidth={2.5}
                    />
                    <span className="text-sm font-semibold">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-content ml-1">
                Đối tượng nhận
              </Label>
              <div className="relative">
                <Users
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                />
                <Select
                  value={formData.targetAudience}
                  onValueChange={handleAudienceSelect}
                >
                  <SelectTrigger className="w-full pl-11 pr-10">
                    <SelectValue placeholder="Chọn đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENCES.map(audience => (
                      <SelectItem key={audience.id} value={audience.id}>
                        {audience.label} - {audience.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="broadcast-title"
                  className="text-sm font-semibold text-content ml-1"
                >
                  Tiêu đề thông báo
                </Label>
                <Input
                  id="broadcast-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề..."
                  aria-label="Notification title"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="broadcast-message"
                  className="text-sm font-semibold text-content ml-1"
                >
                  Nội dung chi tiết
                </Label>
                <Textarea
                  id="broadcast-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  aria-label="Notification message"
                  className="min-h-[140px]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="broadcast-link"
                  className="text-sm font-semibold text-content ml-1"
                >
                  Đường dẫn đính kèm (Tùy chọn)
                </Label>
                <Input
                  id="broadcast-link"
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/..."
                  aria-label="Notification link"
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-5">
          <div className="admin-card p-4 sticky top-4">
            <h3 className="text-base font-semibold text-content mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" />
              Xem trước
            </h3>

            <div className={`p-4 rounded-2xl transition-colors ${selectedType?.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl bg-popover ${selectedType?.text}`}>
                  {selectedType && <selectedType.icon size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-base mb-1 ${selectedType?.text}`}>
                    {formData.title || 'Tiêu đề thông báo'}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed mb-2">
                    {formData.message ||
                      'Nội dung thông báo sẽ hiển thị ở đây...'}
                  </p>
                  <span className="text-xs font-medium text-text-tertiary flex items-center gap-1">
                    <Users size={12} />
                    Gửi đến:{' '}
                    {TARGET_AUDIENCES.find(
                      a => a.id === formData.targetAudience
                    )?.label}
                  </span>
                  {formData.link && (
                    <div className="mt-3 pt-3">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full block w-fit truncate max-w-full">
                        🔗 {formData.link}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading || !formData.title.trim() || !formData.message.trim()
                }
                className="w-full bg-primary text-primary-foreground"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <Send size={20} />
                )}
                Gửi thông báo ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmModal}
        onOpenChange={open => {
          if (!open) setShowConfirmModal(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <Bell size={24} className="text-warning" />
              </div>
              <DialogTitle className="text-base">
                Xác nhận gửi thông báo
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-muted-foreground">
            Bạn sắp gửi thông báo đến{' '}
            <span className="font-medium text-foreground">
              {TARGET_AUDIENCES.find(a => a.id === formData.targetAudience)
                ?.label || 'tất cả người dùng'}
            </span>
            . Hành động này không thể hoàn tác.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <p className="font-medium text-foreground">{formData.title}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {formData.message}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={confirmSend}
              disabled={loading}
            >
              {loading && <Spinner />}
              Tiến hành gửi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Broadcast;