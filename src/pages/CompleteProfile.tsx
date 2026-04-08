import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { completeRegistration, clearRegistration } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/blanc-logo.png";

const CompleteProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registration, loading } = useAppSelector((s) => s.auth);

  // Pre-fill from provider data
  const [name, setName] = useState(registration?.providerName || "");
  const [email, setEmail] = useState(registration?.providerEmail || "");
  const [phone, setPhone] = useState(registration?.providerPhone?.replace("+91", "") || "");

  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  // If there's no registration in progress, redirect
  if (!registration) {
    navigate("/login");
    return null;
  }

  // Determine which fields the user needs to fill
  const hasProviderName = !!registration.providerName;
  const hasProviderEmail = !!registration.providerEmail;
  const hasProviderPhone = !!registration.providerPhone;

  const validate = () => {
    const errs = { name: "", email: "", phone: "" };
    let valid = true;
    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters"; valid = false;
    }
    if (!email.trim()) {
      errs.email = "Email is required"; valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email"; valid = false;
    }
    if (!phone.trim()) {
      errs.phone = "Phone number is required"; valid = false;
    } else if (phone.replace(/\D/g, "").length < 10) {
      errs.phone = "Phone must be 10 digits"; valid = false;
    }
    setErrors(errs);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await dispatch(completeRegistration({
        registrationToken: registration.registrationToken,
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ""),
      })).unwrap();
      toast({ title: "Welcome to Blanc!" });
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as string) || "Registration failed";
      // Show inline errors for specific field issues
      if (msg.toLowerCase().includes("phone")) {
        setErrors((e) => ({ ...e, phone: msg }));
      } else if (msg.toLowerCase().includes("email")) {
        setErrors((e) => ({ ...e, email: msg }));
      } else {
        toast({ title: msg, variant: "destructive" });
      }
    }
  };

  return (
    <Layout>
      <SEO title="Complete Your Profile" noindex />
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <img src={logo} alt="BLANC" className="h-16 mx-auto" />
            <h1 className="font-display text-2xl tracking-wider">Welcome to Blanc</h1>
            <p className="text-sm font-body text-muted-foreground tracking-wide">
              Complete your profile to get started
            </p>
          </div>

          {/* Form — all fields on one page */}
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                <UserIcon size={12} className="inline mr-1.5" />
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
                className={`font-body h-12 ${errors.name ? "border-destructive" : ""}`}
                autoFocus={!hasProviderName}
              />
              {errors.name && <p className="text-[11px] text-destructive font-body">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                <Mail size={12} className="inline mr-1.5" />
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); }}
                className={`font-body h-12 ${errors.email ? "border-destructive" : ""}`}
                autoFocus={hasProviderName && !hasProviderEmail}
              />
              {errors.email
                ? <p className="text-[11px] text-destructive font-body">{errors.email}</p>
                : <p className="text-[11px] text-muted-foreground font-body">Used for order confirmations</p>
              }
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                <Phone size={12} className="inline mr-1.5" />
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-border rounded-md text-sm text-muted-foreground bg-muted font-body">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors((er) => ({ ...er, phone: "" })); }}
                  maxLength={10}
                  className={`font-body h-12 ${errors.phone ? "border-destructive" : ""}`}
                  autoFocus={hasProviderName && hasProviderEmail && !hasProviderPhone}
                />
              </div>
              {errors.phone
                ? <p className="text-[11px] text-destructive font-body">{errors.phone}</p>
                : <p className="text-[11px] text-muted-foreground font-body">Used for delivery updates</p>
              }
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full font-body uppercase tracking-widest text-xs h-12 gap-2"
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={14} />}
          </Button>

          <button
            onClick={() => { dispatch(clearRegistration()); navigate("/login"); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-body py-2"
          >
            Back to sign in
          </button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
