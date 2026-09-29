import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";

export default function VerifyEmail() {
  return (
    <AuthLayout title="Registration received" subtitle="">
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
          <Clock size={28} className="text-indigo-600" />
        </div>
        <h2 className="font-display font-bold text-xl text-ink-900">Awaiting admin approval</h2>
        <p className="text-sm text-ink-600 mt-2 leading-relaxed">
          Your account has been created. An administrator must approve it before you can log in.
        </p>
        <Link to="/login">
          <Button size="lg" className="mt-6 w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}