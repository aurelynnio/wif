import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/utils/notify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleAuth, clearError, loading, error, isAuthenticated, user } =
    useAuthStore();
  const googleButtonRef = useRef(null);
  const googleInitialized = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  // Only redirect if BOTH authenticated AND user data is loaded
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Initialize Google Sign-In
  const renderGoogleButton = useCallback(() => {
    if (!googleButtonRef.current || !window.google?.accounts?.id) return;
    const width = Math.min(320, googleButtonRef.current.clientWidth || 320);
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width,
      text: 'signup_with',
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
              notify.success('Đăng ký với Google thành công!');
            } else {
              notify.error('Đăng ký với Google thất bại');
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

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      notify.error('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    if (formData.password.length < 6) {
      notify.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      notify.error('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await register(formData);
    if (result.success) {
      notify.success('Đăng ký thành công!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

        {/* Decorative circles */}
        <div className="absolute top-40 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-white/3 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-8">
            <Sparkles size={28} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Join YiBu
          </h1>
          <p className="text-white/60 text-lg max-w-sm mx-auto">
            Create your account and start connecting with people around the
            world.
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
              Create account
            </h2>
            <p className="text-muted-foreground">
              Free forever. No credit card needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name & Username row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <AtSign
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  size={18}
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link
                to="#"
                className="text-foreground hover:underline"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                to="#"
                className="text-foreground hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            {/* Error Message */}
            {error?.message && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {error.message}
              </div>
            )}


            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner /> : 'Create Account'}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-1 border-t border-border" />
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Social Login */}
            <div className="flex justify-center">
              <div className="w-full max-w-[320px] mx-auto" ref={googleButtonRef} />
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;