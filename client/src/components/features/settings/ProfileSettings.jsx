import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  User,
  FileText,
  Link2,
  MapPin,
  Loader2,
  Map as MapIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProfile, useUpdateProfile } from '@/hooks/useUserQuery';
import { notify } from '@/utils/notify';
import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const LocationPickerModal = lazy(() =>
  import('@/components/Common/LocationPickerModal')
);

const InputField = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rightElement = null,
}) => {
  const Icon = icon;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {!multiline && Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        )}
        {multiline ? (
          <Textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="resize-none"
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`pl-10 ${rightElement ? 'pr-12' : 'pr-4'}`}
          />
        )}
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const user = useAuthStore(state => state.user);

  // React Query hooks
  const { data: currentProfile, isLoading: profileLoading } = useProfile(
    user?._id
  );
  const { mutate: updateProfileMutation } = useUpdateProfile();

  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Location Picker State
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    location: '',
  });

  // Update form when profile loads
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        name: currentProfile.name || '',
        username: currentProfile.username || '',
        bio: currentProfile.bio || '',
        website: currentProfile.website || '',
        location: currentProfile.location || '',
      });
    }
  }, [currentProfile]);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = e => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('username', formData.username);
      data.append('bio', formData.bio);
      data.append('website', formData.website);
      data.append('location', formData.location);

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }
      if (coverFile) {
        data.append('cover', coverFile);
      }

      updateProfileMutation(data, {
        onSuccess: () => {
          notify.success('Cập nhật thành công!');
          setAvatarFile(null);
          setCoverFile(null);
          setAvatarPreview(null);
          setCoverPreview(null);
          setIsSaving(false);
        },
        onError: err => {
          notify.error(err?.message || 'Cập nhật thất bại');
          setIsSaving(false);
        },
      });
    } catch (error) {
      console.error(error);
      notify.error('Có lỗi xảy ra');
      setIsSaving(false);
    }
  };

  const handleChange = field => e => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleLocationSelect = address => {
    setFormData(prev => ({ ...prev, location: address }));
  };

  if (profileLoading && !currentProfile) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Edit Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Update your profile information
        </p>
      </div>

      {/* Cover & Avatar */}
      <div className="space-y-4">
        {/* Cover */}
        <div className="relative h-32 rounded-2xl overflow-hidden bg-muted">
          <img
            src={
              coverPreview ||
              currentProfile?.cover ||
              'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
          >
            <Camera size={24} className="text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-end gap-4 -mt-12 ml-4">
          <div className="relative">
            <img
              src={avatarPreview || currentProfile?.avatar}
              alt={currentProfile?.username}
              className="w-24 h-24 rounded-full object-cover"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full"
          >
            Change Photo
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <InputField
          icon={User}
          label="Name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Your name"
        />
        <InputField
          icon={User}
          label="Username"
          value={formData.username}
          onChange={handleChange('username')}
          placeholder="Your username"
        />
        <InputField
          icon={FileText}
          label="Bio"
          value={formData.bio}
          onChange={handleChange('bio')}
          placeholder="Tell us about yourself"
          multiline
        />
        <InputField
          icon={Link2}
          label="Website"
          value={formData.website}
          onChange={handleChange('website')}
          placeholder="https://yourwebsite.com"
        />
        <InputField
          icon={MapPin}
          label="Location"
          value={formData.location}
          onChange={handleChange('location')}
          placeholder="Where are you based?"
          rightElement={
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="Pick from map"
            >
              <MapIcon size={18} />
            </button>
          }
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full px-6"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Modals */}
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        {isLocationPickerOpen && (
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            onSelect={handleLocationSelect}
            initialLocation={formData.location}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ProfileSettings;

