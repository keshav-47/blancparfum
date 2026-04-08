import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePincodeLookup } from "@/hooks/use-pincode";
import { useCitiesForState, preloadAllCities } from "@/hooks/use-cities";
import { useGeolocation } from "@/hooks/use-geolocation";
import { indianStates } from "@/data/indian-states";
import type { Address } from "@/types";
import { Check, LocateFixed } from "lucide-react";

export const emptyAddress: Omit<Address, "id"> = {
  label: "", street: "", city: "", state: "", zip: "", country: "India", isDefault: true,
};

interface AddressFormProps {
  value: Omit<Address, "id">;
  onChange: (addr: Omit<Address, "id">) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

// Preload cities for all states in background on first render
let preloadStarted = false;

const AddressForm = ({ value, onChange, onSubmit, saving, submitLabel = "Save Address", onCancel }: AddressFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pinLookup = usePincodeLookup(value.zip);
  const [pinFilled, setPinFilled] = useState(false);

  const geo = useGeolocation();

  // Kick off background preload once
  useEffect(() => {
    if (!preloadStarted) {
      preloadStarted = true;
      preloadAllCities(indianStates);
    }
  }, []);

  // Fetch cities for selected state (only when not pin-filled)
  const { cities, loading: citiesLoading } = useCitiesForState(pinFilled ? "" : value.state);

  const handleUseLocation = async () => {
    const result = await geo.detect();
    if (result) {
      onChange({
        ...value,
        street: result.street || value.street,
        city: result.city,
        state: result.state,
        zip: result.pincode,
      });
      if (result.pincode && result.city && result.state) {
        setPinFilled(true);
      }
      setErrors({});
    }
  };

  // Auto-fill city/state from pincode
  useEffect(() => {
    if (pinLookup.city && pinLookup.state && pinLookup.valid) {
      onChange({ ...value, city: pinLookup.city, state: pinLookup.state });
      setPinFilled(true);
      setErrors((e) => ({ ...e, zip: "", city: "", state: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinLookup.city, pinLookup.state, pinLookup.valid]);

  // Show pincode error
  useEffect(() => {
    if (pinLookup.valid === false && value.zip.length === 6) {
      setErrors((e) => ({ ...e, zip: "Please enter a valid PIN code" }));
      setPinFilled(false);
    }
  }, [pinLookup.valid, value.zip]);

  // Clear city when state changes (manual selection)
  const handleStateChange = (newState: string) => {
    onChange({ ...value, state: newState, city: "" });
    if (errors.state) setErrors((e) => ({ ...e, state: "" }));
  };

  const set = (field: string, val: string) => {
    onChange({ ...value, [field]: val });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!value.label.trim()) e.label = "Label is required";
    if (!value.street.trim()) e.street = "Street address is required";
    else if (value.street.trim().length < 8) e.street = "Street address must be at least 8 characters";
    if (!value.zip || value.zip.length !== 6) e.zip = "PIN code must be 6 digits";
    else if (pinLookup.valid === false) e.zip = "Please enter a valid PIN code";
    if (!value.state) e.state = "Please select a state";
    if (!value.city.trim()) e.city = "Please select or enter a city";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onChange({ ...value, country: "India" });
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Use current location */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={geo.loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-accent/50 text-accent text-[11px] font-body font-medium uppercase tracking-[0.15em] hover:bg-accent/5 transition-colors disabled:opacity-50"
      >
        {geo.loading ? (
          <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        ) : (
          <LocateFixed size={14} />
        )}
        {geo.loading ? "Detecting location..." : "Use my current location"}
      </button>
      {geo.error && <p className="text-[11px] text-destructive font-body -mt-2">{geo.error}</p>}

      <div className="grid grid-cols-2 gap-3">
        {/* Label */}
        <div className="col-span-2 space-y-1.5">
          <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Label <span className="text-destructive">*</span></Label>
          <Input
            placeholder="Home, Office..."
            value={value.label}
            onChange={(e) => set("label", e.target.value)}
            className={`rounded-lg ${errors.label ? "border-destructive" : ""}`}
          />
          {errors.label && <p className="text-[11px] text-destructive font-body">{errors.label}</p>}
        </div>

        {/* Street */}
        <div className="col-span-2 space-y-1.5">
          <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Street Address <span className="text-destructive">*</span></Label>
          <Input
            placeholder="House/Flat No., Street, Landmark"
            value={value.street}
            onChange={(e) => set("street", e.target.value)}
            className={`rounded-lg ${errors.street ? "border-destructive" : ""}`}
          />
          {errors.street
            ? <p className="text-[11px] text-destructive font-body">{errors.street}</p>
            : <p className="text-[11px] text-muted-foreground font-body">Min 8 characters</p>
          }
        </div>

        {/* PIN Code */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">PIN Code <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              placeholder="110001"
              value={value.zip}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                set("zip", v);
                if (v.length < 6) setPinFilled(false);
              }}
              maxLength={6}
              className={`rounded-lg pr-8 ${errors.zip ? "border-destructive" : ""}`}
            />
            {pinLookup.loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            )}
            {pinLookup.valid === true && !pinLookup.loading && (
              <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
            )}
          </div>
          {errors.zip && <p className="text-[11px] text-destructive font-body">{errors.zip}</p>}
        </div>

        {/* Country — locked to India */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Country</Label>
          <Input value="India" disabled className="rounded-lg bg-muted" />
        </div>

        {/* State dropdown */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">State <span className="text-destructive">*</span></Label>
          {pinFilled ? (
            <Input value={value.state} disabled className="rounded-lg bg-muted" />
          ) : (
            <Select value={value.state} onValueChange={handleStateChange}>
              <SelectTrigger className={`rounded-lg ${errors.state ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {indianStates.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.state && <p className="text-[11px] text-destructive font-body">{errors.state}</p>}
        </div>

        {/* City dropdown or input */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">City <span className="text-destructive">*</span></Label>
          {pinFilled ? (
            <Input value={value.city} disabled className="rounded-lg bg-muted" />
          ) : cities.length > 0 ? (
            <Select value={value.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger className={`rounded-lg ${errors.city ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder={!value.state ? "Select state first" : "Enter city"}
              value={value.city}
              onChange={(e) => set("city", e.target.value)}
              disabled={!value.state || citiesLoading}
              className={`rounded-lg ${!value.state || citiesLoading ? "bg-muted" : ""} ${errors.city ? "border-destructive" : ""}`}
            />
          )}
          {errors.city && <p className="text-[11px] text-destructive font-body">{errors.city}</p>}
        </div>
      </div>

      {/* Default toggle */}
      <div className="flex items-center gap-3 pt-1">
        <Switch
          checked={value.isDefault}
          onCheckedChange={(v) => onChange({ ...value, isDefault: v })}
        />
        <Label className="text-[11px] uppercase tracking-[0.15em] cursor-pointer font-body font-medium">Set as default</Label>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium"
        >
          {saving ? "Saving\u2026" : submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default AddressForm;
