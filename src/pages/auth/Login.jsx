import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

const roles = [
  { value: "trainee", label: "Trainee" },
  { value: "trainer", label: "Trainer" },
  { value: "admin", label: "Admin" },
];

export default function Login() {
  const [role, setRole] = useState("trainee");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const from = useLocation().state?.from;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await login(email.trim(), password);
    setBusy(false);
    if (res.error) return setError(res.error);
    const r = res.user.role;
    showToast(`Welcome back, ${res.user.name}!`);
    navigate(from && r === "trainee" ? from : `/${r}/dashboard`, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your learning journey."
      footer={
        <p className="text-sm text-ink-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-700 font-semibold hover:text-indigo-900">
            Sign up
          </Link>
        </p>
      }
    >
      <div className="flex gap-2 mb-6 bg-ink-100/60 rounded-xl p-1">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`focus-ring flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              role === r.value ? "bg-white text-indigo-700 shadow-card" : "text-ink-500 hover:text-ink-800"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            icon={Lock}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3.5 top-[38px] text-ink-300 hover:text-ink-600"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div className="flex items-center justify-end text-sm">
          <Link to="/forgot-password" className="text-indigo-700 font-medium hover:text-indigo-900">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Logging in…" : `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </Button>
      </form>
    </AuthLayout>
  );
}