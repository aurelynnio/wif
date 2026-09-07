import { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Mail,
  Loader2,
} from 'lucide-react';
import { notify } from '@/utils/notify';
import { useSettings, useUpdateSettings } from '@/hooks/useUserQuery';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const NotificationSettings = () => {
  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    messages: true,
    email: false,
    push: true,
  });

  // Sync local state with server settings
  useEffect(() => {
    if (settingsData?.notifications) {
      const apiSettings = { ...settingsData.notifications };

      // Handle legacy/nested structure where email/push might be objects
      if (typeof apiSettings.email === 'object' && apiSettings.email !== null) {
        apiSettings.email = apiSettings.email.enabled;
      }
      if (typeof apiSettings.push === 'object' && apiSettings.push !== null) {
        apiSettings.push = apiSettings.push.enabled;
      }

      setNotifications(prev => ({
        ...prev,
        ...apiSettings,
      }));
    }
  }, [settingsData]);

  const handleToggle = async settingKey => {
    const newNotifications = {
      ...notifications,
      [settingKey]: !notifications[settingKey],
    };

    setNotifications(newNotifications);

    try {
      await updateSettingsMutation.mutateAsync({
        type: 'notifications',
        settings: newNotifications,
      });
      notify.success('Đã lưu cài đặt thông báo');
    } catch (error) {
      // Revert on failure
      setNotifications(notifications);
      notify.error(error?.response?.data?.message || 'Lưu cài đặt thất bại');
    }
  };

  const ToggleSwitch = ({ enabled, onChange, disabled, id }) => (
    <Switch
      id={id}
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );

  const NotificationItem = (
    { icon: Icon, label, description, settingKey }
  ) => (
    <div className="flex items-center justify-between py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Icon size={18} className="text-muted-foreground" />
        </div>
        <div>
          <Label
            htmlFor={`notif-${settingKey}`}
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            {label}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ToggleSwitch
        id={`notif-${settingKey}`}
        enabled={notifications[settingKey]}
        onChange={() => handleToggle(settingKey)}
        disabled={updateSettingsMutation.isPending}
      />
    </div>
  );

  if (settingsLoading && !settingsData) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Choose what notifications you want to receive
        </p>
      </div>

      {/* Activity Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={16} className="text-muted-foreground" />
            Activity
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <NotificationItem
            icon={Heart}
            label="Likes"
            description="When someone likes your post"
            settingKey="likes"
          />
          <NotificationItem
            icon={MessageCircle}
            label="Comments"
            description="When someone comments on your post"
            settingKey="comments"
          />
          <NotificationItem
            icon={UserPlus}
            label="New Followers"
            description="When someone follows you"
            settingKey="follows"
          />
          <NotificationItem
            icon={AtSign}
            label="Mentions"
            description="When someone mentions you"
            settingKey="mentions"
          />
          <NotificationItem
            icon={MessageCircle}
            label="Messages"
            description="When you receive a new message"
            settingKey="messages"
          />
        </div>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={16} className="text-muted-foreground" />
            Delivery Methods
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <Label
                htmlFor="notif-push"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications on your device
              </p>
            </div>
            <ToggleSwitch
              id="notif-push"
              enabled={notifications.push}
              onChange={() => handleToggle('push')}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <Label
                htmlFor="notif-email"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <ToggleSwitch
              id="notif-email"
              enabled={notifications.email}
              onChange={() => handleToggle('email')}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </div>
      </Card>

      {/* Saving indicator */}
      {updateSettingsMutation.isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang lưu...</span>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;

