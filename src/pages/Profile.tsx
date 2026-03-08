import { User, MapPin, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useAppSelector } from "@/store/hooks";

const Profile = () => {
  const { profile, orders } = useAppSelector((state) => state.user);
  const { requests } = useAppSelector((state) => state.customRequests);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <User size={28} className="text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl">{profile?.name || "Guest"}</h1>
              <p className="text-muted-foreground text-sm">{profile?.email}</p>
            </div>
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
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Order {order.id}</p>
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
                          <span>${item.price}</span>
                        </div>
                      ))}
                      <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Addresses */}
            <TabsContent value="addresses" className="pt-8">
              {profile?.addresses.length === 0 ? (
                <p className="text-muted-foreground">No saved addresses.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.addresses.map((addr) => (
                    <div key={addr.id} className="border border-border p-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs uppercase tracking-wider font-semibold">{addr.label}</p>
                        {addr.isDefault && <span className="text-[10px] uppercase tracking-wider text-accent">Default</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.street}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-sm text-muted-foreground">{addr.country}</p>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="mt-6 rounded-none uppercase tracking-[0.15em] text-xs">
                Add Address
              </Button>
            </TabsContent>

            {/* Custom Requests */}
            <TabsContent value="custom" className="pt-8">
              {requests.length === 0 ? (
                <p className="text-muted-foreground">No custom requests yet.</p>
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
    </Layout>
  );
};

export default Profile;
