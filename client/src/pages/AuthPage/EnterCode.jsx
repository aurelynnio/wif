import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const EnterCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    // Fake verification
    setTimeout(() => {
      setIsLoading(false);
      setVerified(true);
    }, 1500);
  };

  const handleResend = () => {
    // Logic to resend code
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-8">
            <Sparkles size={28} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Verify
          </h1>
          <p className="text-white/60 text-lg max-w-sm mx-auto">
            Enter the code we sent to your email to verify your identity.
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

          {!verified ? (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Enter code
                </h2>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to your email
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Code inputs */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={el => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      aria-label={`Verification code digit ${index + 1}`}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || code.some(d => !d)}
                  className="w-full"
                >
                  {isLoading ? <Spinner /> : 'Verify Code'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Didn't receive the code?{' '}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    className="text-foreground font-medium hover:underline"
                  >
                    Resend
                  </Button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <Check
                  size={28}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Verified!
              </h2>
              <p className="text-muted-foreground mb-8">
                Your email has been verified successfully.
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Continue to Sign In
              </Link>
            </div>
          )}

          {/* Back to login */}
          {!verified && (
            <div className="mt-10 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterCode;