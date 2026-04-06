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
import { fetchUserProfile, fetchOrders, addAddress, updateAddress, deleteAddress } from "@/store/slices/userSlice";
import { fetchCustomRequests } from "@/store/slices/customRequestsSlice";
import { logout } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
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
      <SEO title="Profile" canonical="/profile" />
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl pt-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {displayProfile?.avatar ? (
                  <img src={displayProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="font-display text-3xl">{displayProfile?.name || "User"}</h1>
                <p className="text-muted-foreground text-sm">{displayProfile?.email}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-xs uppercase tracking-[0.15em] gap-2">
              <LogOut size={14} /> Logout
            </Button>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 px-0">
              {[
                { value: "orders", label: "Orders", icon: Clock },
                { value: "addresses", label: "Addresses", icon: MapPin },
                { value: "custom", label: "Custom Requests", icon: Sparkles },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs uppercase tracking-[0.15em] px-0 pb-3 flex items-center gap-2"
                >
                  <tab.icon size={14} /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Orders */}
            <TabsContent value="orders" className="pt-8">
              {userLoading ? (
                <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
              ) : orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <span className={`text-xs uppercase tracking-wider px-3 py-1 ${
                          order.status === "delivered" ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span>{item.name} ({item.size}ml) × {item.quantity}</span>
                          <span>₹{item.price.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{order.total.toLocaleString("en-IN")}</span>
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
                  {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : (
                <>
                  {(!profile?.addresses?.length) ? (
                    <p className="text-muted-foreground mb-6">No saved addresses yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {profile.addresses.map((addr) => (
                        <div key={addr.id} className="border border-border p-5 relative group">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs uppercase tracking-wider font-semibold">{addr.label}</p>
                            {addr.isDefault && (
                              <span className="text-[9px] uppercase tracking-wider bg-foreground text-background px-1.5 py-0.5">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.street}</p>
                          <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-sm text-muted-foreground">{addr.country}</p>
                          <div className="flex gap-1 mt-4">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => openEditAddress(addr)}>
                              <Pencil size={11} /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => handleDeleteAddress(addr.id)}>
                              <Trash2 size={11} /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button onClick={openAddAddress} variant="outline" className="rounded-none uppercase tracking-[0.15em] text-xs gap-2">
                    <Plus size={13} /> Add Address
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Custom Requests */}
            <TabsContent value="custom" className="pt-8">
              {reqLoading ? (
                <div className="space-y-4">{[1].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-muted-foreground">No custom requests yet.</p>
                  <Link to="/custom">
                    <Button variant="outline" className="rounded-none uppercase tracking-[0.15em] text-xs">
                      Create Custom Fragrance
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="border border-border p-6">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{req.date}</p>
                        <span className={`text-xs uppercase tracking-wider px-3 py-1 ${
                          req.status === "completed" ? "bg-accent/10 text-accent"
                            : req.status === "in_progress" ? "bg-secondary text-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {req.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm"><span className="text-muted-foreground">Scent Families:</span> {req.scentFamilies.join(", ")}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Occasion:</span> {req.occasion}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Intensity:</span> {req.intensity}</p>
                      {req.notes && <p className="text-sm mt-2 text-muted-foreground italic">"{req.notes}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Add / Edit Address Dialog */}
      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">
              {editingAddr ? "Edit Address" : "Add Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Label <span className="text-destructive">*</span></Label>
                <Input placeholder="Home, Office…" value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Street <span className="text-destructive">*</span></Label>
                <Input placeholder="123 Main St, Apt 4" value={addrForm.street} onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">City <span className="text-destructive">*</span></Label>
                <Input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">State <span className="text-destructive">*</span></Label>
                <Input value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">PIN Code <span className="text-destructive">*</span></Label>
                <Input value={addrForm.zip} onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Country <span className="text-destructive">*</span></Label>
                <Input value={addrForm.country} onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={addrForm.isDefault}
                onCheckedChange={(v) => setAddrForm((f) => ({ ...f, isDefault: v }))}
              />
              <Label className="text-xs uppercase tracking-wider cursor-pointer">Set as default address</Label>
            </div>
            <Button
              onClick={handleSaveAddress}
              disabled={addrSaving}
              className="w-full rounded-none uppercase tracking-[0.15em] text-xs h-11"
            >
              {addrSaving ? "Saving…" : editingAddr ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
