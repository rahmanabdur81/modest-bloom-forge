import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      setFullName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Could not save profile");
    else toast.success("Profile updated");
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <UserIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Account Settings</h1>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
        </div>
      </header>

      <Card className="p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={save} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => { await signOut(); navigate("/"); }}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
