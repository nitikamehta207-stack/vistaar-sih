import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";
import { getCertificateByCredentialId } from "../../lib/certificates";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function VerifyCertificate() {
  const { credentialId } = useParams();
  const [state, setState] = useState({ loading: true, certificate: null, error: null });

  useEffect(() => {
    let alive = true;
    getCertificateByCredentialId(credentialId).then((res) => {
      if (!alive) return;
      if (res.error) setState({ loading: false, certificate: null, error: res.error });
      else setState({ loading: false, certificate: res.certificate, error: null });
    });
    return () => { alive = false; };
  }, [credentialId]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-2xl text-ink-900">Certificate Verification</h1>
          <p className="text-ink-500 text-sm mt-1">Capacity Connect — Digital Capacity Building Portal</p>
        </div>

        <Card className="text-center">
          {state.loading && (
            <div className="py-10 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={28} />
              <p className="text-sm text-ink-500">Verifying credential…</p>
            </div>
          )}

          {!state.loading && state.error === "not_found" && (
            <div className="py-6 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <ShieldX size={26} className="text-red-600" />
              </div>
              <h2 className="font-display font-bold text-ink-900">Not a valid credential</h2>
              <p className="text-sm text-ink-500">
                No certificate found for ID <span className="font-mono">{credentialId}</span>. Check the ID and try again.
              </p>
            </div>
          )}

          {!state.loading && state.error && state.error !== "not_found" && (
            <div className="py-6 flex flex-col items-center gap-3">
              <ShieldAlert size={26} className="text-amber-600" />
              <p className="text-sm text-ink-500">Something went wrong verifying this certificate. Please try again shortly.</p>
            </div>
          )}

          {!state.loading && state.certificate && (
            <div className="py-4 space-y-5">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    state.certificate.status === "ISSUED" ? "bg-emerald-50" : "bg-red-50"
                  }`}
                >
                  {state.certificate.status === "ISSUED" ? (
                    <ShieldCheck size={26} className="text-emerald-600" />
                  ) : (
                    <ShieldX size={26} className="text-red-600" />
                  )}
                </div>
                <Badge tone={state.certificate.status === "ISSUED" ? "green" : "red"}>
                  {state.certificate.status === "ISSUED" ? "Valid Certificate" : "Revoked"}
                </Badge>
              </div>

              <div className="text-left space-y-3 border-t border-ink-100 pt-4">
                <Row label="Credential ID" value={state.certificate.credential_id} mono />
                <Row label="Issued To" value={state.certificate.trainee_name} />
                <Row label="Course" value={state.certificate.course_title} />
                {state.certificate.trainer_name && <Row label="Trainer" value={state.certificate.trainer_name} />}
                <Row label="Issued On" value={new Date(state.certificate.issued_on).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-ink-400 mt-5">
          <Link to="/" className="hover:text-indigo-600">Back to Capacity Connect</Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-ink-400 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-ink-900 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}