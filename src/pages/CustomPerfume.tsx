import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitCustomRequest, resetSubmitted } from "@/store/slices/customRequestsSlice";
import { useToast } from "@/hooks/use-toast";

const scentFamilies = ["Floral", "Woody", "Oriental", "Fresh", "Citrus", "Gourmand", "Aquatic", "Spicy"];
const occasions = ["Everyday", "Evening", "Special Occasion", "Office", "Date Night", "Summer", "Winter"];
const intensities: Array<{ key: "light" | "moderate" | "strong"; label: string; desc: string }> = [
  { key: "light", label: "Light", desc: "A whisper on the skin" },
  { key: "moderate", label: "Moderate", desc: "Present but refined" },
  { key: "strong", label: "Strong", desc: "Bold and unforgettable" },
];

const CustomPerfume = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading, submitted } = useAppSelector((state) => state.customRequests);

  // Restore saved form state after login redirect
  const saved = (() => {
    try {
      const raw = localStorage.getItem("bp_custom_draft");
      if (raw) { localStorage.removeItem("bp_custom_draft"); return JSON.parse(raw); }
    } catch { /* ignore */ }
    return null;
  })();

  const [step, setStep] = useState(saved ? 3 : 0);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>(saved?.scentFamilies || []);
  const [occasion, setOccasion] = useState(saved?.occasion || "");
  const [intensity, setIntensity] = useState<"light" | "moderate" | "strong">(saved?.intensity || "moderate");
  const [message, setMessage] = useState(saved?.message || "");

  const toggleFamily = (f: string) => {
    setSelectedFamilies((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : prev.length < 3 ? [...prev, f] : prev
    );
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      // Save selections so they persist across login
      localStorage.setItem("bp_custom_draft", JSON.stringify({
        scentFamilies: selectedFamilies,
        occasion,
        intensity,
        message,
      }));
      toast({ title: "Please sign in to submit your request" });
      navigate("/login?returnTo=/custom");
      return;
    }
    dispatch(submitCustomRequest({
      scentFamilies: selectedFamilies,
      occasion,
      intensity,
      message: message || undefined,
    }));
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-accent" size={28} />
            </div>
            <h2 className="font-display text-3xl mb-4">Request Submitted</h2>
            <p className="text-muted-foreground mb-8">Our master perfumer will review your preferences and craft a unique fragrance just for you. We'll be in touch soon.</p>
            <Button onClick={() => dispatch(resetSubmitted())} variant="outline" className="rounded-none uppercase tracking-[0.15em] text-xs">
              Submit Another
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const steps = [
    // Step 0: Scent Families
    <div key="families">
      <h3 className="font-display text-2xl mb-2">Choose Your Scent Families</h3>
      <p className="text-muted-foreground text-sm mb-8">Select up to 3 that speak to you</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scentFamilies.map((f) => (
          <button
            key={f}
            onClick={() => toggleFamily(f)}
            className={`py-4 border text-sm font-body uppercase tracking-wider transition-all ${
              selectedFamilies.includes(f)
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>,
    // Step 1: Occasion
    <div key="occasion">
      <h3 className="font-display text-2xl mb-2">When Will You Wear It?</h3>
      <p className="text-muted-foreground text-sm mb-8">Select the primary occasion</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {occasions.map((o) => (
          <button
            key={o}
            onClick={() => setOccasion(o)}
            className={`py-4 border text-sm font-body uppercase tracking-wider transition-all ${
              occasion === o
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>,
    // Step 2: Intensity
    <div key="intensity">
      <h3 className="font-display text-2xl mb-2">Desired Intensity</h3>
      <p className="text-muted-foreground text-sm mb-8">How strong should it be?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {intensities.map((int) => (
          <button
            key={int.key}
            onClick={() => setIntensity(int.key)}
            className={`py-6 px-4 border text-center transition-all ${
              intensity === int.key
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border hover:border-foreground"
            }`}
          >
            <p className="font-body text-sm uppercase tracking-wider mb-1">{int.label}</p>
            <p className={`text-xs ${intensity === int.key ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {int.desc}
            </p>
          </button>
        ))}
      </div>
    </div>,
    // Step 3: Message
    <div key="message">
      <h3 className="font-display text-2xl mb-2">Anything Else?</h3>
      <p className="text-muted-foreground text-sm mb-8">Special instructions or inspiration (optional)</p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="E.g., I want something that reminds me of a Mediterranean summer evening..."
        className="rounded-none border-border min-h-[150px] resize-none"
      />
    </div>,
  ];

  const canProceed = step === 0 ? selectedFamilies.length > 0 : step === 1 ? occasion !== "" : true;

  return (
    <Layout>
      <SEO title="Custom Perfume" description="Create your bespoke fragrance with BLANC PARFUM. Choose scent families, occasions, and intensity for a perfume crafted just for you." canonical="/custom" />
      <div className="min-h-[80vh] container mx-auto px-4 lg:px-8 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-4">Create Your Scent</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">A bespoke fragrance, crafted for you</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-12">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className={`h-0.5 flex-1 transition-colors ${s <= step ? "bg-foreground" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-none uppercase tracking-[0.15em] text-xs"
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="rounded-none uppercase tracking-[0.15em] text-xs"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-none uppercase tracking-[0.15em] text-xs"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomPerfume;
