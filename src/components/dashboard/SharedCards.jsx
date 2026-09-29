import { Award, Download, Eye, Clock, ClipboardCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

// cert here is a real Supabase row: { credential_id, trainee_name, course_title, issued_on, status }
export function CertificateCard({ cert }) {
  const toneMap = { ISSUED: "green", REVOKED: "red" };
  const verifyUrl = `${window.location.origin}/verify/${cert.credential_id}`;

  return (
    <Card hover className="relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-grad-violet rounded-full opacity-10" />
      <div className="flex items-start justify-between relative">
        <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
          <Award size={20} className="text-violet-600" />
        </div>
        <Badge tone={toneMap[cert.status] || "gray"} icon={cert.status === "ISSUED" ? ShieldCheck : undefined}>
          {cert.status === "ISSUED" ? "Verified" : "Revoked"}
        </Badge>
      </div>

      <h3 className="font-display font-bold text-ink-900 mt-4 leading-snug">{cert.course_title}</h3>
      <p className="text-xs text-ink-400 mt-2 font-mono">Credential ID: {cert.credential_id}</p>
      <p className="text-xs text-ink-400">
        Issued: {new Date(cert.issued_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      <div className="flex items-center gap-4 mt-4">
        <div className="p-1.5 bg-white rounded-lg border border-ink-100 shrink-0">
          <QRCodeSVG value={verifyUrl} size={64} />
        </div>
        <p className="text-[11px] text-ink-400 leading-relaxed">
          Scan to verify, or share this link:
          <br />
          <Link to={`/verify/${cert.credential_id}`} className="text-indigo-600 font-medium break-all">
            /verify/{cert.credential_id}
          </Link>
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <Link to={`/verify/${cert.credential_id}`} className="flex-1">
          <Button size="sm" variant="secondary" icon={Eye} className="w-full" disabled={cert.status !== "ISSUED"}>
            View
          </Button>
        </Link>
        <Button size="sm" variant="primary" icon={Download} className="flex-1" disabled={cert.status !== "ISSUED"}>
          Download
        </Button>
      </div>
    </Card>
  );
}

export function AssessmentCard({ assessment }) {
  const toneMap = { "Not Started": "gray", "In Progress": "amber", Completed: "green" };
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
          <ClipboardCheck size={20} className="text-amber-600" />
        </div>
        <Badge tone={toneMap[assessment.status] || "gray"}>{assessment.status}</Badge>
      </div>
      <h3 className="font-display font-bold text-ink-900 mt-4 leading-snug">{assessment.title}</h3>
      <p className="text-sm text-ink-500 mt-1">{assessment.course}</p>
      <div className="flex items-center gap-4 text-xs text-ink-500 mt-3">
        <span>{assessment.questions} Questions</span>
        <span className="flex items-center gap-1"><Clock size={12} /> Due {assessment.deadline}</span>
      </div>
      <Link
        to={`/trainee/assessments/${assessment.id}`}
        className="focus-ring mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
      >
        {assessment.status === "Not Started" ? "Start Assessment" : "Continue"} <ArrowRight size={15} />
      </Link>
    </Card>
  );
}

// A printable-style certificate preview shown inside a Modal.
// Expects: { trainee, title, course, credentialId, issued }
export function CertificatePreview({ cert }) {
  if (!cert) return null;
  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-100 p-8 sm:p-12 relative overflow-hidden text-center">
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-grad-violet rounded-full opacity-10" />
      <div className="absolute -bottom-20 -right-16 w-56 h-56 bg-grad-violet rounded-full opacity-10" />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-grad-violet flex items-center justify-center mx-auto shadow-lift">
          <Award size={26} className="text-white" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 mt-6">Certificate of Completion</p>
        <p className="text-sm text-ink-400 mt-1">This certifies that</p>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-900 mt-3">{cert.trainee}</h2>

        <p className="text-sm text-ink-500 mt-3">has successfully completed</p>
        <h3 className="font-display font-bold text-lg sm:text-xl text-indigo-700 mt-1">{cert.title || cert.course}</h3>

        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-ink-100">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Issued On</p>
            <p className="text-sm font-semibold text-ink-800 mt-1">{cert.issued}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Credential ID</p>
            <p className="text-sm font-mono font-semibold text-ink-800 mt-1">{cert.credentialId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}