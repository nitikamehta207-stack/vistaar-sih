import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, GraduationCap, Presentation } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const [role, setRole] = useState("trainee");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const password = String(f.get("password"));

    if (password !== f.get("confirm")) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setError("");
    setBusy(true);
    const res = await signup({
      fullName: String(f.get("fullName")).trim(),
      email: String(f.get("email")).trim(),
      phone: String(f.get("phone")).trim(),
      password,
      role,
    });
    setBusy(false);

    if (res.error) return setError(res.error);
    navigate("/verify-email", { state: { role } });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Vistaar and start building your capabilities."
      footer={
        <p className="text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-700 font-semibold hover:text-indigo-900">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name" name="fullName" icon={User} placeholder="Aditi Rao" required />
        <Input label="Email address" name="email" type="email" icon={Mail} placeholder="you@example.com" required />
        <Input label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+91 98765 43210" required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" required />
          <Input label="Confirm Password" name="confirm" type="password" icon={Lock} placeholder="••••••••" required />
        </div>

        <div>
          <p className="block text-sm font-medium text-ink-700 mb-1.5">I am joining as a</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("trainee")}
              className={`focus-ring flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                role === "trainee" ? "border-indigo-500 bg-indigo-50" : "border-ink-100 hover:border-ink-200"
              }`}
            >
              <GraduationCap size={22} className={role === "trainee" ? "text-indigo-600" : "text-ink-400"} />
              <span className={`text-sm font-semibold ${role === "trainee" ? "text-indigo-700" : "text-ink-600"}`}>Trainee</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("trainer")}
              className={`focus-ring flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                role === "trainer" ? "border-indigo-500 bg-indigo-50" : "border-ink-100 hover:border-ink-200"
              }`}
            >
              <Presentation size={22} className={role === "trainer" ? "text-indigo-600" : "text-ink-400"} />
              <span className={`text-sm font-semibold ${role === "trainer" ? "text-indigo-700" : "text-ink-600"}`}>Trainer</span>
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-ink-500 pt-1">
          <input type="checkbox" required className="mt-0.5 rounded border-ink-300 text-indigo-600 focus:ring-indigo-500" />
          I agree to the Terms of Service and Privacy Policy.
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}