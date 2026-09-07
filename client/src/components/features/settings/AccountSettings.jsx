import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Shield,
  Trash2,
  LogOut,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/utils/notify';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, logoutAll, updatePassword } = useAuthStore();

  // Use authUser or empty object
  const profile = authUser || {};

  const [account, setAccount] = useState({
    email: 'johndoe@example.com',
    username: 'johndoe',
    phone: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      notify.success('Đăng xuất thành công');
      navigate('/auth/login');
    }
  };

  const handleLogoutAll = async () => {
    const result = await logoutAll();
    if (result.success) {
      notify.success('Đã đăng xuất khỏi tất cả thiết bị');
      navigate('/auth/login');
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      notify.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      notify.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    const result = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setLoading(false);

    if (result.success) {
      notify.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      navigate('/auth/login');
    }
  };

  const InputField = ({
    icon: Icon,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Account</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account information and security
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            Account Information
          </CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          <InputField
            icon={User}
            label="Username"
            value={profile.username || ''}
            onChange={e => setAccount({ ...account, username: e.target.value })}
            placeholder="Enter username"
          />
          <InputField
            icon={Mail}
            label="Email"
            type="email"
            value={profile.email || ''}
            onChange={e => setAccount({ ...account, email: e.target.value })}
            placeholder="Enter email"
          />
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={16} className="text-muted-foreground" />
            Security
          </CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(true)}
            className="w-full h-auto justify-between"
          >
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  Change Password
                </p>
                <p className="text-xs text-muted-foreground">
                  Update your password regularly for security
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </Button>

          <div className="w-full flex items-center justify-between p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              Off
            </span>
          </div>
        </div>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor size={16} className="text-muted-foreground" />
            Sessions
          </CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="w-full h-auto justify-between"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Logout</p>
                <p className="text-xs text-muted-foreground">
                  Sign out from this device
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleLogoutAll}
            className="w-full h-auto justify-between"
          >
            <div className="flex items-center gap-3">
              <Monitor size={18} className="text-destructive" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  Logout from all devices
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign out from all your active sessions
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 size={16} />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="w-full"
          >
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
        </div>
      </Card>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-background rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-2">
              Delete Account?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-md mx-4 bg-background rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-4">
              Đổi mật khẩu
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mật khẩu hiện tại</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                />
              </div>
              <div className="space-y-2">
                <Label>Xác nhận mật khẩu mới</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  'Xác nhận'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;

