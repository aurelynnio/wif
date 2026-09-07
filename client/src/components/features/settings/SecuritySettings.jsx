import { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Key,
  Trash2,
  Monitor,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { notify } from '@/utils/notify';
import { useAuthStore } from '@/store/authStore';
import { useSettings, useUpdateSettings } from '@/hooks/useUserQuery';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SecuritySettings = () => {
  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const {
    sessions,
    enable2FA,
    verify2FA,
    disable2FA,
    getSessions,
    revokeSession,
  } = useAuthStore();

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    trustedDevicesOnly: false,
  });

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    getSessions();
  }, [getSessions]);

  // Sync local state with server settings
  useEffect(() => {
    if (settingsData?.security) {
      setSecurity(prev => ({
        ...prev,
        ...settingsData.security,
      }));
    }
  }, [settingsData]);

  const handleSecurityChange = async (key, value) => {
    const newSecurity = { ...security, [key]: value };
    setSecurity(newSecurity);

    try {
      await updateSettingsMutation.mutateAsync({
        type: 'security',
        settings: newSecurity,
      });
      notify.success('Đã lưu cài đặt bảo mật');
    } catch (error) {
      setSecurity(security); // Revert on failure
      notify.error(error?.response?.data?.message || 'Lưu cài đặt thất bại');
    }
  };

  const handleEnable2FA = async () => {
    const result = await enable2FA();
    if (result.success) {
      const qrCodeData = result.data?.qrCode || result.data;
      setQrCode(qrCodeData);
      setShow2FAModal(true);
    } else {
      notify.error(result.error || 'Không thể bật 2FA');
    }
  };

  const handleVerify2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      notify.error('Vui lòng nhập mã 6 số');
      return;
    }

    setVerifying(true);
    const result = await verify2FA({ token: verifyCode });
    setVerifying(false);
    if (result.success) {
      notify.success('Đã bật xác thực hai yếu tố');
      setSecurity(prev => ({ ...prev, twoFactorEnabled: true }));
      setShow2FAModal(false);
      setVerifyCode('');
    } else {
      notify.error(result.error || 'Mã xác thực không hợp lệ');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Bạn có chắc muốn tắt xác thực hai yếu tố?')) return;

    const password = window.prompt('Nhập mật khẩu để tắt 2FA');
    if (!password) {
      notify.error('Mật khẩu là bắt buộc');
      return;
    }

    const result = await disable2FA({ password });
    if (result.success) {
      notify.success('Đã tắt xác thực hai yếu tố');
      setSecurity(prev => ({ ...prev, twoFactorEnabled: false }));
    } else {
      notify.error(result.error || 'Không thể tắt 2FA');
    }
  };

  const handleRevokeSession = async sessionId => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất phiên này?')) return;

    const result = await revokeSession({ sessionId });
    if (result.success) {
      notify.success('Đã đăng xuất phiên');
    } else {
      notify.error(result.error || 'Không thể đăng xuất phiên');
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

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Bảo mật</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý bảo mật tài khoản và thiết bị tin cậy
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={16} className="text-muted-foreground" />
            Xác thực hai yếu tố (2FA)
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  security.twoFactorEnabled
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-muted'
                }`}
              >
                {security.twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {security.twoFactorEnabled ? 'Đã bật 2FA' : 'Chưa bật 2FA'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {security.twoFactorEnabled
                    ? 'Tài khoản của bạn được bảo vệ'
                    : 'Bật để tăng cường bảo mật'}
                </p>
              </div>
            </div>
            <Button
              variant={security.twoFactorEnabled ? 'destructive' : 'default'}
              onClick={
                security.twoFactorEnabled ? handleDisable2FA : handleEnable2FA
              }
            >
              {security.twoFactorEnabled ? 'Tắt 2FA' : 'Bật 2FA'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Security Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={16} className="text-muted-foreground" />
            Tùy chọn bảo mật
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <ToggleSwitch
            id="security-alerts"
            enabled={security.loginAlerts}
            onChange={() =>
              handleSecurityChange('loginAlerts', !security.loginAlerts)
            }
            label="Cảnh báo đăng nhập"
            description="Nhận thông báo khi có đăng nhập từ thiết bị mới"
            disabled={updateSettingsMutation.isPending}
          />
          <ToggleSwitch
            id="security-trusted"
            enabled={security.trustedDevicesOnly}
            onChange={() =>
              handleSecurityChange(
                'trustedDevicesOnly',
                !security.trustedDevicesOnly
              )
            }
            label="Chỉ thiết bị tin cậy"
            description="Chỉ cho phép đăng nhập từ thiết bị đã xác minh"
            disabled={updateSettingsMutation.isPending}
          />
        </div>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor size={16} className="text-muted-foreground" />
            Phiên đăng nhập
          </CardTitle>
        </CardHeader>
        <div className="p-4 space-y-3">
          {sessions && sessions.length > 0 ? (
            sessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background dark:bg-neutral-700">
                    {session.deviceType === 'mobile' ? (
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {session.browser} trên {session.os}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.ip} •{' '}
                      {session.isCurrent ? 'Thiết bị này' : session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevokeSession(session.id)}
                    title="Đăng xuất phiên này"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Không có phiên đăng nhập nào
            </p>
          )}
        </div>
      </Card>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-background rounded-2xl overflow-hidden">
            <div className="p-4 bg-muted">
              <h3 className="text-lg font-semibold text-foreground">
                Thiết lập xác thực hai yếu tố
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Quét mã QR bằng ứng dụng xác thực (Google Authenticator, Authy,
                ...) rồi nhập mã xác nhận.
              </p>
              {qrCode && (
                <div className="flex justify-center p-4 bg-background rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <div>
                <Label className="block mb-2">Mã xác nhận</Label>
                <Input
                  type="text"
                  value={verifyCode}
                  onChange={e =>
                    setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="Nhập mã 6 số"
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShow2FAModal(false);
                  setVerifyCode('');
                }}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleVerify2FA}
                disabled={verifying || verifyCode.length !== 6}
                className="flex-1"
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
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

export default SecuritySettings;

