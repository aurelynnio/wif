import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/utils/notify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const Login = () => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const googleInitialized = useRef(false);
  const { login, googleAuth, loading, error, isAuthenticated, user } =
    useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  // Redirect if already authenticated AND user data is loaded
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!error?.errorCode || error.errorCode === '2FA_REQUIRED') {
      return;
    }
    setRequiresTwoFactor(false);
    setTwoFactorToken('');
  }, [error]);

  // Initialize Google Sign-In
  const renderGoogleButton = useCallback(() => {
    if (!googleButtonRef.current || !window.google?.accounts?.id) return;
    const width = Math.min(320, googleButtonRef.current.clientWidth || 320);
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width,
      text: 'continue_with',
      shape: 'pill',
    });
  }, []);

  const initGoogle = useCallback(() => {
    if (!window.google?.accounts?.id || !googleButtonRef.current) {
      return;
    }

    if (!googleInitialized.current) {
      googleInitialized.current = true;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async response => {
          if (response.credential) {
            const result = await googleAuth(response.credential);
            if (result.success) {
              notify.success('Đăng nhập Google thành công!');
            } else {
              notify.error('Đăng nhập Google thất bại');
            }
          }
        },
      });
    }

    renderGoogleButton();
  }, [googleAuth, renderGoogleButton]);

  // Setup Google button when ref is available
  useEffect(() => {
    if (!googleButtonRef.current) return;

    // Try immediately
    initGoogle();

    // If not available, poll for it
    if (!googleInitialized.current) {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        }
      }, 200);

      const timeout = setTimeout(() => clearInterval(interval), 10000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [initGoogle]);

  useEffect(() => {
    const onResize = () => renderGoogleButton();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [renderGoogleButton]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      notify.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const payload = {
      ...formData,
      twoFactorToken: requiresTwoFactor ? twoFactorToken : undefined,
    };

    const result = await login(payload);
    if (result.success) {
      notify.success('Đăng nhập thành công!');
      return;
    }

    const errorPayload = result.error || {};
    if (errorPayload?.errorCode === '2FA_REQUIRED') {
      setRequiresTwoFactor(true);
      notify('Vui lòng nhập mã 2FA');
      return;
    }

    if (errorPayload?.errorCode === '2FA_INVALID') {
      notify.error('Mã 2FA không hợp lệ');
      return;
    }
  };


  // No longer needed due to useEffect redirect above
  // if (isAuthenticated && user) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/3 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-8">
            <Sparkles size={28} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            YiBu
          </h1>
          <p className="text-white/60 text-lg max-w-sm mx-auto">
            Connect, share, and discover. Your social experience reimagined.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <Sparkles size={22} className="text-white dark:text-black" />
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">Sign in to continue to YiBu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            {requiresTwoFactor && (
              <div className="space-y-2">
                <Label htmlFor="2fa">Mã xác thực 2FA</Label>
                <Input
                  id="2fa"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorToken}
                  onChange={e => setTwoFactorToken(e.target.value)}
                  placeholder="Nhập mã 6 số"
                  className="text-center"
                />
              </div>
            )}

            {/* Error Message */}
            {error?.message && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>{error.message}</span>
              </div>
            )}


            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner /> : 'Sign In'}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center my-8">
              <div className="flex-1 border-t border-border" />
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              <div className="w-full max-w-[320px] mx-auto" ref={googleButtonRef} />
            </div>
          </form>

          {/* Footer */}
          <p className="mt-10 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;