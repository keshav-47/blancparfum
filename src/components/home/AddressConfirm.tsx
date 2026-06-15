import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AddressForm, { emptyAddress } from "@/components/AddressForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addAddress, fetchUserProfile } from "@/store/slices/userSlice";
import { clearPendingAction, pushAssistantNote, closeChat } from "@/store/slices/assistantSlice";
import { toast } from "@/hooks/use-toast";
import type { Address } from "@/types";
import type { AssistantAddressDraft } from "@/api/assistantApi";

const AddressConfirm = ({ draft }: { draft?: AssistantAddressDraft }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const profile = useAppSelector((s) => s.user.profile);

  const [form, setForm] = useState<Omit<Address, "id">>({
    ...emptyAddress,
    label: draft?.label || emptyAddress.label,
    street: draft?.street || "",
    city: draft?.city || "",
    state: draft?.state || "",
    zip: draft?.zip || "",
    country: "India",
  });
  const [saving, setSaving] = useState(false);

  // Saving pushes into profile.addresses → make sure the profile is loaded.
  useEffect(() => {
    if (isAuthenticated && !profile) dispatch(fetchUserProfile());
  }, [isAuthenticated, profile, dispatch]);

  if (!isAuthenticated) {
    return (
      <div>
        <p className="text-sm font-body mb-3">Sign in to save your shipping address.</p>
        <Button
          onClick={() => { dispatch(clearPendingAction()); dispatch(closeChat()); navigate(`/login?returnTo=${encodeURIComponent("/?concierge=open")}`); }}
          className="rounded-full text-[11px] uppercase tracking-[0.15em] h-10 font-body font-medium"
        >
          Sign in
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(addAddress(form)).unwrap();
      toast({ title: "Address saved" });
      dispatch(pushAssistantNote("Saved your address — ready to checkout whenever you are."));
      dispatch(clearPendingAction());
    } catch {
      toast({ title: "Couldn't save address", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-body mb-3">Confirm your shipping address:</p>
      <AddressForm
        value={form}
        onChange={setForm}
        onSubmit={handleSave}
        saving={saving}
        submitLabel="Save address"
        onCancel={() => dispatch(clearPendingAction())}
      />
    </div>
  );
};

export default AddressConfirm;
