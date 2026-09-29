import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCertificatesForTrainee } from "../../lib/certificates";
import { CertificateCard } from "../../components/dashboard/SharedCards";
import { EmptyState } from "../../components/ui/States";

export default function TraineeCertificates() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, certificates: [] });

  useEffect(() => {
    let alive = true;
    if (!user?.id) return;
    getCertificatesForTrainee(user.id).then((res) => {
      if (alive) setState({ loading: false, certificates: res.certificates || [] });
    });
    return () => { alive = false; };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-ink-900">Certificates</h1>
        <p className="text-ink-500 mt-1.5">Certificates earned through completed training programs.</p>
      </div>

      {state.loading ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
          <p className="text-sm text-ink-500">Loading your certificates…</p>
        </div>
      ) : state.certificates.length === 0 ? (
        <EmptyState title="No certificates yet" message="Complete a course to earn your first certificate." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.certificates.map((c) => <CertificateCard key={c.id} cert={c} />)}
        </div>
      )}
    </div>
  );
}