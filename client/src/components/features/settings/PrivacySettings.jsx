import { useState, useEffect } from 'react';
import { Eye, MessageCircle, Loader2 } from 'lucide-react';
import { notify } from '@/utils/notify';
import { useSettings, useUpdateSettings } from '@/hooks/useUserQuery';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PrivacySettings = () => {
  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    postVisibility: 'public',
    messagePermission: 'everyone',
    searchVisibility: true,
    activityStatus: true,
  });

  // Sync local state with server settings
  useEffect(() => {
    if (settingsData?.privacy) {
      setPrivacy(settingsData.privacy);
    }
  }, [settingsData]);

  const handlePrivacyChange = async (key, value) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);

    try {
      await updateSettingsMutation.mutateAsync({
        type: 'privacy',
        settings: newPrivacy,
      });
      notify.success('Đã lưu cài đặt quyền riêng tư');
    } catch (error) {
      setPrivacy(privacy); // Revert on failure
      notify.error(error?.response?.data?.message || 'Lưu cài đặt thất bại');
    }
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
    disabled,
    id,
  }) => (
    <div className="flex items-center justify-between py-4 last:border-0">
      <div>
        <Label
          htmlFor={id}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );

  const SelectOption = ({
    value,
    onChange,
    label,
    description,
    options,
    disabled,
  }) => (
    <div className="py-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {options.map(option => (
          <Button
            key={option.value}
            variant={value === option.value ? 'default' : 'secondary'}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className="flex-1 text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>
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
        <h1 className="text-2xl font-bold text-foreground mb-2">Privacy</h1>
        <p className="text-muted-foreground text-sm">
          Control who can see your content and interact with you
        </p>
      </div>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={16} className="text-muted-foreground" />
            Visibility
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <SelectOption
            label="Profile visibility"
            description="Who can view your profile"
            value={privacy.profileVisibility}
            onChange={value => handlePrivacyChange('profileVisibility', value)}
            disabled={updateSettingsMutation.isPending}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'followers', label: 'Followers' },
              { value: 'private', label: 'Private' },
            ]}
          />
          <SelectOption
            label="Post visibility"
            description="Default visibility for new posts"
            value={privacy.postVisibility}
            onChange={value => handlePrivacyChange('postVisibility', value)}
            disabled={updateSettingsMutation.isPending}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'followers', label: 'Followers' },
              { value: 'private', label: 'Only me' },
            ]}
          />
        </div>
      </Card>

      {/* Interaction Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={16} className="text-muted-foreground" />
            Interactions
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <SelectOption
            label="Message permissions"
            description="Who can send you messages"
            value={privacy.messagePermission}
            onChange={value => handlePrivacyChange('messagePermission', value)}
            disabled={updateSettingsMutation.isPending}
            options={[
              { value: 'everyone', label: 'Everyone' },
              { value: 'followers', label: 'Followers' },
              { value: 'nobody', label: 'Nobody' },
            ]}
          />
          <ToggleSwitch
            id="privacy-search"
            label="Show in search results"
            description="Allow others to find you through search"
            enabled={privacy.searchVisibility}
            onChange={() =>
              handlePrivacyChange('searchVisibility', !privacy.searchVisibility)
            }
            disabled={updateSettingsMutation.isPending}
          />
          <ToggleSwitch
            id="privacy-activity"
            label="Show activity status"
            description="Let others see when you're online"
            enabled={privacy.activityStatus}
            onChange={() =>
              handlePrivacyChange('activityStatus', !privacy.activityStatus)
            }
            disabled={updateSettingsMutation.isPending}
          />
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

export default PrivacySettings;

