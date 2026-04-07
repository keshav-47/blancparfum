import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateProfile, addAddress } from "@/store/slices/userSlice";
import { updateAuthUser } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import { usePincodeLookup } from "@/hooks/use-pincode";
import type { Address } from "@/types";
import logo from "@/assets/blanc-logo.png";

const emptyAddr: Omit<Address, "id"> = {
  label: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  isDefault: true,
};

const CompleteProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState<"name" | "address">("name");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>(emptyAddr);

  // Auto-fill city/state from PIN code
  const pinLookup = usePincodeLookup(addrForm.zip);
  useEffect(() => {
    if (pinLookup.city && pinLookup.state) {
      setAddrForm((f) => ({ ...f, city: pinLookup.city, state: pinLookup.state }));
    }
  }, [pinLookup.city, pinLookup.state]);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const updated = await dispatch(updateProfile({ name: name.trim(), email: user?.email || null })).unwrap();
      dispatch(updateAuthUser({ name: updated.name }));
      setStep("address");
    } catch {
      toast({ title: "Failed to save name", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addrForm.label || !addrForm.street || !addrForm.city || !addrForm.state || !addrForm.zip) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await dispatch(addAddress(addrForm)).unwrap();
      toast({ title: "Address saved" });
      navigate("/");
    } catch {
      toast({ title: "Failed to save address", variant: "destructive" });
    } finally {
      setSaving(false);
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
            <h1 className="font-display text-2xl tracking-wider">
              {step === "name" ? "Welcome to Blanc" : "Add Your Address"}
            </h1>
            <p className="text-sm font-body text-muted-foreground tracking-wide">
              {step === "name"
                ? "Let's set up your profile"
                : "Where should we deliver your fragrances?"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-1 w-12 rounded-full ${step === "name" ? "bg-foreground" : "bg-foreground"}`} />
            <div className={`h-1 w-12 rounded-full ${step === "address" ? "bg-foreground" : "bg-border"}`} />
          </div>

          {step === "name" ? (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-body h-12"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && name.trim() && handleSaveName()}
                />
              </div>
              <Button
                onClick={handleSaveName}
                disabled={!name.trim() || saving}
                className="w-full font-body uppercase tracking-widest text-xs h-12 gap-2"
              >
                {saving ? "Saving..." : "Continue"}
                {!saving && <ArrowRight size={14} />}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">
                    Label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Home, Office..."
                    value={addrForm.label}
                    onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">
                    Street <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="123 Main St, Apt 4"
                    value={addrForm.street}
                    onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={addrForm.city}
                      onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={addrForm.state}
                      onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider">
                      PIN Code <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        value={addrForm.zip}
                        onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                        placeholder="110001"
                        maxLength={6}
                      />
                      {pinLookup.loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={addrForm.country}
                      onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    checked={addrForm.isDefault}
                    onCheckedChange={(v) => setAddrForm((f) => ({ ...f, isDefault: v }))}
                  />
                  <Label className="text-xs uppercase tracking-wider cursor-pointer">
                    Set as default address
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className="w-full font-body uppercase tracking-widest text-xs h-12"
                >
                  {saving ? "Saving..." : "Save Address & Continue"}
                </Button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-body py-2"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
