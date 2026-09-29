import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { demoAccounts } from "../data/users";

const AuthContext = createContext(null);

const initials = (n = "") =>
  n.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

async function loadUser(session) {
  if (!session) return null;
  const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  if (!p) return null;
  const base = demoAccounts[p.role] || demoAccounts.trainee;
  // Fall back to the email's local part (not the demo account's name) when full_name is missing —
  // this happens for users created directly in the Supabase dashboard instead of via signup.
  const name = p.full_name || session.user.email.split("@")[0];
  return { ...base, id: p.id, email: session.user.email, name, avatar: initials(name) || base.avatar, role: p.role, status: p.status };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const u = await loadUser(data.session);
      if (alive) { setUser(u?.status === "APPROVED" ? u : null); setLoading(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const u = await loadUser(data.session);
    if (!u) { await supabase.auth.signOut(); return { error: "Profile not found." }; }
    if (u.status !== "APPROVED") {
      await supabase.auth.signOut();
      return { error: u.status === "PENDING" ? "Your account is awaiting admin approval." : "Your account has been suspended." };
    }
    setUser(u);
    return { user: u };
  };

  const signup = async ({ email, password, fullName, phone, role }) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName, phone, role } },
    });
    if (error) return { error: error.message };
    await supabase.auth.signOut(); // must wait for admin approval before entering
    return {};
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };
  const updateUser = (p) => setUser((prev) => ({ ...prev, ...p }));

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);