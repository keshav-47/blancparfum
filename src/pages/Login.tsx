import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useAppSelector((s) => s.auth);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Redirect on login
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/");
    }
  }, [isAuthenticated, user, navigate]);

  // Setup invisible reCAPTCHA
  useEffect(() => {
    if (!recaptchaContainerRef.current) return;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerRef.current, {
        size: "invisible",
      });
    } catch {
      // already initialized
    }
    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  // Google Sign-In
  const handleGoogleCallback = useCallback(
    (response: { credential: string }) => {
      dispatch(loginWithGoogle(response.credential));
    },
    [dispatch]
  );

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        const clientId =
          import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          "785552510309-hj18cn3tf1820ncd22a4usou7q7qrjmn.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
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
  }, [handleGoogleCallback]);

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
  const handleVerifyOtp = async () => {
    if (otp.length < 6 || !confirmationRef.current) return;
    setFirebaseError(null);
    try {
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();
      dispatch(loginWithFirebase(idToken));
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-verification-code") {
        setFirebaseError("Invalid OTP. Please try again.");
      } else {
        setFirebaseError((err as { message?: string })?.message ?? "Verification failed");
      }
    }
  };

  const displayError = firebaseError || error;

  return (
    <Layout>
      <SEO title="Login" canonical="/login" />
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
                disabled={phone.length < 10 || sending || loading}
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
                  disabled={otp.length < 6 || loading}
                  className="w-full font-body uppercase tracking-widest text-xs"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
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
