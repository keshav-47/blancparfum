import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, MapPin, Clock, Sparkles, LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchUserProfile, fetchOrders, updateProfile, addAddress, updateAddress, deleteAddress } from "@/store/slices/userSlice";
import { fetchCustomRequests } from "@/store/slices/customRequestsSlice";
import { logout, updateAuthUser } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import { usePincodeLookup } from "@/hooks/use-pincode";
import type { Address } from "@/types";

const emptyAddr: Omit<Address, "id"> = {
  label: "", street: "", city: "", state: "", zip: "", country: "India", isDefault: false,
};

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { isAuthenticated, user: authUser } = useAppSelector((s) => s.auth);
  const { profile, orders, loading: userLoading } = useAppSelector((s) => s.user);
  const { requests, loading: reqLoading } = useAppSelector((s) => s.customRequests);

  const [addrOpen, setAddrOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>(emptyAddr);
  const [addrSaving, setAddrSaving] = useState(false);

  // Profile edit
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState({ name: "", email: "", phone: "" });

  const openEditProfile = () => {
    setProfileForm({
      name: displayProfile?.name || "",
      email: displayProfile?.email || "",
      phone: displayProfile?.phone?.replace("+91", "") || "",
    });
    setProfileErrors({ name: "", email: "", phone: "" });
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    const errors = { name: "", email: "", phone: "" };
    let valid = true;
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"; valid = false;
    }
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = "Please enter a valid email"; valid = false;
    }
    if (profileForm.phone && profileForm.phone.length < 10) {
      errors.phone = "Phone must be 10 digits"; valid = false;
    }
    setProfileErrors(errors);
    if (!valid) return;

    setProfileSaving(true);
    try {
      const payload: { name?: string; email?: string; phone?: string } = {};
      if (profileForm.name.trim()) payload.name = profileForm.name.trim();
      if (profileForm.email.trim()) payload.email = profileForm.email.trim();
      if (profileForm.phone.trim()) payload.phone = profileForm.phone.trim();
      const updated = await dispatch(updateProfile(payload)).unwrap();
      dispatch(updateAuthUser({ name: updated.name, email: updated.email, phone: updated.phone }));
      toast({ title: "Profile updated" });
      setProfileOpen(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to update profile";
      if (msg.toLowerCase().includes("phone")) {
        setProfileErrors((e) => ({ ...e, phone: msg }));
      } else if (msg.toLowerCase().includes("email")) {
        setProfileErrors((e) => ({ ...e, email: msg }));
      } else {
        toast({ title: msg, variant: "destructive" });
      }
    } finally {
      setProfileSaving(false);
    }
  };

  // Auto-fill city/state from PIN code
  const pinLookup = usePincodeLookup(addrForm.zip);
  useEffect(() => {
    if (pinLookup.city && pinLookup.state) {
      setAddrForm((f) => ({ ...f, city: pinLookup.city, state: pinLookup.state }));
    }
  }, [pinLookup.city, pinLookup.state]);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    dispatch(fetchUserProfile());
    dispatch(fetchOrders());
    dispatch(fetchCustomRequests());
  }, [isAuthenticated, dispatch, navigate]);

  const displayProfile = profile || authUser;

  const handleLogout = () => { dispatch(logout()); navigate("/"); };

  const openAddAddress = () => {
    setEditingAddr(null);
    setAddrForm(emptyAddr);
    setAddrOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddr(addr);
    setAddrForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, isDefault: addr.isDefault });
    setAddrOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!addrForm.label || !addrForm.street || !addrForm.city || !addrForm.state || !addrForm.zip || !addrForm.country) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setAddrSaving(true);
    try {
      if (editingAddr) {
        await dispatch(updateAddress({ id: editingAddr.id, ...addrForm })).unwrap();
        toast({ title: "Address updated" });
      } else {
        await dispatch(addAddress(addrForm)).unwrap();
        toast({ title: "Address added" });
      }
      setAddrOpen(false);
    } catch {
      toast({ title: "Failed to save address", variant: "destructive" });
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast({ title: "Address deleted" });
    } catch {
      toast({ title: "Failed to delete address", variant: "destructive" });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <SEO title="Profile" canonical="/profile" noindex />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 pb-16 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
                {displayProfile?.avatar ? (
                  <img src={displayProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl md:text-3xl truncate">{displayProfile?.name || "User"}</h1>
                  <button onClick={openEditProfile} className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0">
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-muted-foreground text-sm font-body truncate">{displayProfile?.email || displayProfile?.phone}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-[11px] uppercase tracking-[0.15em] gap-2 font-body font-medium text-muted-foreground hover:text-foreground self-start sm:self-auto flex-shrink-0"
            >
              <LogOut size={14} strokeWidth={1.5} /> Logout
            </Button>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-4 sm:gap-8 px-0 h-auto overflow-x-auto scrollbar-hide">
              {[
                { value: "orders", label: "Orders", icon: Clock },
                { value: "addresses", label: "Addresses", icon: MapPin },
                { value: "custom", label: "Custom Requests", icon: Sparkles },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] uppercase tracking-[0.15em] px-0 pb-3 flex items-center gap-1.5 sm:gap-2 font-body font-medium whitespace-nowrap flex-shrink-0"
                >
                  <tab.icon size={14} strokeWidth={1.5} /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Orders */}
            <TabsContent value="orders" className="pt-8">
              {userLoading ? (
                <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
              ) : orders.length === 0 ? (
                <p className="text-muted-foreground font-body text-sm">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-xl p-4 sm:p-6 overflow-hidden">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-body font-medium truncate">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground font-body">{order.date}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-[0.15em] font-body font-medium px-3 py-1 rounded-full flex-shrink-0 ${
                          order.status === "delivered"
                            ? "bg-green-50 text-green-700"
                            : order.status === "shipped"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-secondary text-muted-foreground"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between gap-2 text-sm py-1 font-body">
                          <span className="text-muted-foreground min-w-0 break-words">{item.name} ({item.size}ml) &times; {item.quantity}</span>
                          <span className="flex-shrink-0">{"\u20B9"}{item.price.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="border-t border-border mt-3 pt-3 flex justify-between font-medium font-body">
                        <span>Total</span>
                        <span>{"\u20B9"}{order.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Addresses */}
            <TabsContent value="addresses" className="pt-8">
              {userLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
              ) : (
                <>
                  {(!profile?.addresses?.length) ? (
                    <p className="text-muted-foreground mb-6 font-body text-sm">No saved addresses yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {profile.addresses.map((addr) => (
                        <div key={addr.id} className="border border-border rounded-xl p-5 group">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] uppercase tracking-[0.15em] font-body font-semibold">{addr.label}</p>
                            {addr.isDefault && (
                              <span className="text-[9px] uppercase tracking-[0.1em] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-body">{addr.street}</p>
                          <p className="text-sm text-muted-foreground font-body">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-sm text-muted-foreground font-body">{addr.country}</p>
                          <div className="flex gap-1 mt-4">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 font-body" onClick={() => openEditAddress(addr)}>
                              <Pencil size={11} /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 text-destructive hover:text-destructive font-body" onClick={() => handleDeleteAddress(addr.id)}>
                              <Trash2 size={11} /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button onClick={openAddAddress} variant="outline" className="rounded-full uppercase tracking-[0.15em] text-[11px] gap-2 font-body font-medium">
                    <Plus size={13} /> Add Address
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Custom Requests */}
            <TabsContent value="custom" className="pt-8">
              {reqLoading ? (
                <div className="space-y-4">{[1].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-muted-foreground font-body text-sm">No custom requests yet.</p>
                  <Link to="/custom">
                    <Button variant="outline" className="rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium">
                      Create Custom Fragrance
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="border border-border rounded-xl p-4 sm:p-6 overflow-hidden">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-body font-medium">{req.date}</p>
                        <span className={`text-[10px] uppercase tracking-[0.15em] font-body font-medium px-3 py-1 rounded-full flex-shrink-0 ${
                          req.status === "completed" ? "bg-green-50 text-green-700"
                            : req.status === "in_progress" ? "bg-blue-50 text-blue-700"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {req.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm font-body"><span className="text-muted-foreground">Scent Families:</span> {req.scentFamilies.join(", ")}</p>
                      <p className="text-sm font-body"><span className="text-muted-foreground">Occasion:</span> {req.occasion}</p>
                      <p className="text-sm font-body"><span className="text-muted-foreground">Intensity:</span> {req.intensity}</p>
                      {req.notes && <p className="text-sm mt-2 text-muted-foreground italic font-body">"{req.notes}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Address dialog */}
      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">
              {editingAddr ? "Edit Address" : "Add Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Label <span className="text-destructive">*</span></Label>
                <Input placeholder="Home, Office…" value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} className="rounded-lg" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Street <span className="text-destructive">*</span></Label>
                <Input placeholder="123 Main St, Apt 4" value={addrForm.street} onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">City <span className="text-destructive">*</span></Label>
                <Input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">State <span className="text-destructive">*</span></Label>
                <Input value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">PIN Code <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input value={addrForm.zip} onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, "").slice(0, 6) }))} className="rounded-lg" placeholder="110001" maxLength={6} />
                  {pinLookup.loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Country <span className="text-destructive">*</span></Label>
                <Input value={addrForm.country} onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))} className="rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={addrForm.isDefault} onCheckedChange={(v) => setAddrForm((f) => ({ ...f, isDefault: v }))} />
              <Label className="text-[11px] uppercase tracking-[0.15em] cursor-pointer font-body font-medium">Set as default</Label>
            </div>
            <Button
              onClick={handleSaveAddress}
              disabled={addrSaving}
              className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium"
            >
              {addrSaving ? "Saving\u2026" : editingAddr ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Name <span className="text-destructive">*</span></Label>
              <Input
                value={profileForm.name}
                onChange={(e) => { setProfileForm((f) => ({ ...f, name: e.target.value })); setProfileErrors((e2) => ({ ...e2, name: "" })); }}
                className={`rounded-lg ${profileErrors.name ? "border-destructive" : ""}`}
                placeholder="Your full name"
              />
              {profileErrors.name && <p className="text-[11px] text-destructive font-body">{profileErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => { setProfileForm((f) => ({ ...f, email: e.target.value })); setProfileErrors((e2) => ({ ...e2, email: "" })); }}
                className={`rounded-lg ${profileErrors.email ? "border-destructive" : ""}`}
                placeholder="you@example.com"
              />
              {profileErrors.email && <p className="text-[11px] text-destructive font-body">{profileErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Phone</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-border rounded-lg text-sm text-muted-foreground bg-muted font-body">
                  +91
                </span>
                <Input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => { setProfileForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })); setProfileErrors((e2) => ({ ...e2, phone: "" })); }}
                  className={`rounded-lg ${profileErrors.phone ? "border-destructive" : ""}`}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {profileErrors.phone && <p className="text-[11px] text-destructive font-body">{profileErrors.phone}</p>}
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium"
            >
              {profileSaving ? "Saving\u2026" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
