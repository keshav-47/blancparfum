import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { firebaseAuth } from "@/config/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginWithGoogle, loginWithFirebase, clearAuthError } from "@/store/slices/authSlice";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import logo from "@/assets/blanc-logo.png";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const navigateAfterLogin = (nav: ReturnType<typeof useNavigate>, u: { name?: string; role?: string }, returnTo?: string | null) => {
  if (u.role === "ADMIN") nav("/admin");
  else if (!u.name || u.name === "Parfum Lover") nav("/complete-profile");
  else nav(returnTo || "/");
};

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const { isAuthenticated, loading, error, user } = useAppSelector((s) => s.auth);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Redirect already-logged-in users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      navigateAfterLogin(navigate, user, returnTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup invisible reCAPTCHA — pre-render for speed
  useEffect(() => {
    if (!recaptchaContainerRef.current) return;
    try {
      const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerRef.current, {
        size: "invisible",
      });
      verifier.render(); // pre-render so Send OTP is instant
      window.recaptchaVerifier = verifier;
    } catch {
      // already initialized
    }
    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  // Google Sign-In — use a ref so the callback is always current
  // without re-initializing the Google SDK (which cancels in-flight requests)
  const googleCallbackRef = useRef<(response: { credential: string }) => void>();
  googleCallbackRef.current = async (response: { credential: string }) => {
    try {
      const result = await dispatch(loginWithGoogle(response.credential)).unwrap();
      navigateAfterLogin(navigate, result.user, returnTo);
    } catch { /* error shown via Redux */ }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        const clientId =
          import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          "785552510309-hj18cn3tf1820ncd22a4usou7q7qrjmn.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp: { credential: string }) => googleCallbackRef.current?.(resp),
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
        });
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Send OTP via Firebase
  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setFirebaseError(null);
    setSending(true);
    try {
      const verifier = window.recaptchaVerifier;
      if (!verifier) throw new Error("reCAPTCHA not ready");
      const result = await signInWithPhoneNumber(firebaseAuth, `+91${phone}`, verifier);
      confirmationRef.current = result;
      setOtpSent(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Failed to send OTP";
      setFirebaseError(msg);
      // Reset reCAPTCHA on failure
      window.recaptchaVerifier?.clear();
      if (recaptchaContainerRef.current) {
        window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerRef.current, {
          size: "invisible",
        });
      }
    } finally {
      setSending(false);
    }
  };

  // Verify OTP via Firebase, then send ID token to our backend
  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 6 || !confirmationRef.current || verifying) return;
    setFirebaseError(null);
    setVerifying(true);
    try {
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();
      const result = await dispatch(loginWithFirebase(idToken)).unwrap();
      navigateAfterLogin(navigate, result.user, returnTo);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-verification-code") {
        setFirebaseError("Invalid OTP. Please try again.");
      } else {
        setFirebaseError((err as { message?: string })?.message ?? "Verification failed");
      }
    } finally {
      setVerifying(false);
    }
  }, [otp, verifying, dispatch, navigate]);

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && confirmationRef.current && !verifying) {
      handleVerifyOtp();
    }
  }, [otp, verifying, handleVerifyOtp]);

  const displayError = firebaseError || error;
  const isLoading = loading || verifying;

  return (
    <Layout>
      <SEO title="Login" canonical="/login" noindex />

      {/* Loading overlay — renders on top without unmounting the form */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-6" />
          <h2 className="font-display text-2xl mb-2">Signing you in</h2>
          <p className="text-muted-foreground font-body text-sm">Please wait...</p>
        </div>
      )}

      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <img src={logo} alt="BLANC" className="h-16 mx-auto" />
            <p className="text-sm font-body text-muted-foreground tracking-wide">
              Sign in to your account
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <div ref={googleBtnRef} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-body text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Phone OTP */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                Phone Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-border rounded-md text-sm text-muted-foreground bg-muted">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  disabled={otpSent}
                  className="font-body"
                />
              </div>
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10 || sending || isLoading}
                className="w-full font-body uppercase tracking-widest text-xs"
              >
                <Phone size={14} />
                {sending ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <label className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                  Enter OTP
                </label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6 || isLoading}
                  className="w-full font-body uppercase tracking-widest text-xs"
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    confirmationRef.current = null;
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                >
                  Change Number
                </button>
              </motion.div>
            )}
          </div>

          {/* Error */}
          {displayError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-destructive font-body"
            >
              {displayError}
            </motion.p>
          )}

          {/* Invisible reCAPTCHA container */}
          <div ref={recaptchaContainerRef} />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
