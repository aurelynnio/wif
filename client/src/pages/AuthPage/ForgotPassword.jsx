import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mail, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { notify } from '@/utils/notify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const ForgotPassword = () => {
  const { requestPasswordReset, clearError, loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notify.error("Vui lòng nhập email");
      return;
    }
    const result = await requestPasswordReset({ email });
    if (result.success) {
      setSent(true);
      notify.success("Đã gửi link đặt lại mật khẩu!");
    }
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

        <div className="absolute bottom-32 left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-32 right-32 w-80 h-80 bg-white/3 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-8">
            <Sparkles size={28} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Reset
          </h1>
          <p className="text-white/60 text-lg max-w-sm mx-auto">
            Don't worry, we'll help you get back into your account.
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

          {!sent ? (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Forgot password?
                </h2>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Spinner /> : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                <Mail size={28} className="text-black dark:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-muted-foreground mb-8">
                We've sent a password reset link to <br />
                <span className="text-foreground font-medium">
                  {email}
                </span>
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSent(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Didn't receive it? Try again
              </Button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-10 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;