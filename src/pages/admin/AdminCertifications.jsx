import { useEffect, useState } from "react";
import { Award, Ban, RotateCcw, Eye, Download, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { courses } from "../../data/courses";
import StatCard from "../../components/ui/StatCard";
import { Card } from "../../components/ui/Card";
import DataTable, { Td } from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { CertificatePreview } from "../../components/dashboard/SharedCards";
import { useApp } from "../../context/AppContext";
import { downloadCertificate } from "../../utils/download";
import {
  getAllCertificates, issueCertificate, revokeCertificate,
  reinstateCertificate, getApprovedTrainees,
} from "../../lib/certificates";

const tone = { ISSUED: "green", REVOKED: "red" };

export default function AdminCertifications() {
  const { showToast } = useApp();
  const [certs, setCerts] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ traineeId: "", courseTitle: "", trainerName: "" });

  const load = async () => {
    setLoading(true);
    const [c, t] = await Promise.all([getAllCertificates(), getApprovedTrainees()]);
    setCerts(c.certificates || []);
    setTrainees(t.trainees || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (c) => {
    try { await downloadCertificate(c); showToast("Certificate downloaded."); }
    catch (e) { console.error(e); showToast("Couldn't generate the PDF. Please try again.", "warning"); }
  };

  const submitIssue = async (e) => {
    e.preventDefault();
    const trainee = trainees.find((t) => t.id === form.traineeId);
    if (!trainee || !form.courseTitle.trim()) return;
    setBusy(true);
    const res = await issueCertificate({
      traineeId: trainee.id,
      traineeName: trainee.full_name,
      courseTitle: form.courseTitle.trim(),
      trainerName: form.trainerName.trim(),
    });
    setBusy(false);
    if (res.error) return showToast(`Couldn't issue certificate: ${res.error}`, "warning");
    showToast(`Certificate issued to ${trainee.full_name}.`);
    setIssueOpen(false);
    setForm({ traineeId: "", courseTitle: "", trainerName: "" });
    load();
  };

  const toggleRevoke = async (c) => {
    const res = c.status === "ISSUED" ? await revokeCertificate(c.credential_id) : await reinstateCertificate(c.credential_id);
    if (res.error) return showToast(`Failed: ${res.error}`, "warning");
    showToast(c.status === "ISSUED" ? "Certificate revoked." : "Certificate reinstated.");
    load();
  };

  const issuedCount = certs.filter((c) => c.status === "ISSUED").length;
  const revokedCount = certs.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-ink-900">Certification Management</h1>
          <p className="text-ink-500 mt-1.5">Issue, verify and revoke trainee certificates.</p>
        </div>
        <Button icon={Plus} onClick={() => setIssueOpen(true)}>Issue Certificate</Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Award} label="Certificates Issued" value={String(issuedCount)} tone="teal" />
        <StatCard icon={Ban} label="Revoked" value={String(revokedCount)} tone="amber" />
        <StatCard icon={AlertTriangle} label="Total Records" value={String(certs.length)} tone="violet" />
      </div>

      <Card>
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <p className="text-sm text-ink-500">Loading certificates…</p>
          </div>
        ) : certs.length === 0 ? (
          <p className="text-center text-sm text-ink-500 py-10">No certificates issued yet.</p>
        ) : (
          <DataTable
            columns={["Trainee", "Course", "Certificate ID", "Issue Date", "Status", "Actions"].map((l) => ({ key: l, label: l }))}
            data={certs}
            renderRow={(c) => (
              <>
                <Td><span className="font-semibold text-ink-900">{c.trainee}</span></Td>
                <Td className="text-ink-600">{c.course}</Td>
                <Td className="text-ink-500 font-mono">{c.credentialId}</Td>
                <Td className="text-ink-500">{c.issued}</Td>
                <Td><Badge tone={tone[c.status]}>{c.status === "ISSUED" ? "Issued" : "Revoked"}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => setPreview(c)}>Preview</Button>
                    {c.status === "ISSUED" && <Button size="sm" variant="outline" icon={Download} onClick={() => save(c)}>Download</Button>}
                    <Button
                      size="sm" variant="ghost"
                      icon={c.status === "ISSUED" ? Ban : RotateCcw}
                      className={c.status === "ISSUED" ? "text-red-600 hover:!bg-red-50" : "text-emerald-600 hover:!bg-emerald-50"}
                      onClick={() => toggleRevoke(c)}
                    >
                      {c.status === "ISSUED" ? "Revoke" : "Reinstate"}
                    </Button>
                  </div>
                </Td>
              </>
            )}
          />
        )}
      </Card>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Certificate Preview" size="xl"
        footer={preview?.status === "ISSUED" && <Button icon={Download} onClick={() => save(preview)}>Download Certificate</Button>}>
        {preview && <CertificatePreview cert={preview} />}
      </Modal>

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Issue Certificate">
        <form onSubmit={submitIssue} className="space-y-4">
          <Select
            label="Trainee"
            value={form.traineeId}
            onChange={(e) => setForm((f) => ({ ...f, traineeId: e.target.value }))}
            required
          >
            <option value="">Select a trainee…</option>
            {trainees.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </Select>
          {trainees.length === 0 && (
            <p className="text-xs text-amber-600">No approved trainees found. Approve a trainee first.</p>
          )}
          <Input
            label="Course Title"
            list="course-titles"
            value={form.courseTitle}
            onChange={(e) => setForm((f) => ({ ...f, courseTitle: e.target.value }))}
            placeholder="e.g. Foundations of Machine Learning"
            required
          />
          <datalist id="course-titles">
            {courses.map((c) => <option key={c.id} value={c.title} />)}
          </datalist>
          <Input
            label="Trainer Name (optional)"
            value={form.trainerName}
            onChange={(e) => setForm((f) => ({ ...f, trainerName: e.target.value }))}
            placeholder="e.g. Dr. Meera Nair"
          />
          <Button type="submit" size="lg" className="w-full" disabled={busy || !form.traineeId}>
            {busy ? "Issuing…" : "Issue Certificate"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}