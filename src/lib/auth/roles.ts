// lib/auth/roles.ts

import { supabase } from "@/integrations/supabase/client";

export async function fetchUserRoles(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw error;

  return data.map(r => r.role);
}