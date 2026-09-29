import { supabase } from "./supabase";

function generateCredentialId() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const rand2 = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `CC-${year}-${rand}-${rand2}`;
}

// Adds display-friendly aliases on top of the raw Supabase row so existing
// components (CertificatePreview, downloadCertificate) work unchanged.
// Raw fields (credential_id, trainee_name, course_title, issued_on, status)
// are kept as-is too, since VerifyCertificate.jsx reads those directly.
function withDisplayFields(row) {
  if (!row) return row;
  return {
    ...row,
    credentialId: row.credential_id,
    trainee: row.trainee_name,
    course: row.course_title,
    title: row.course_title,
    issued: row.issued_on
      ? new Date(row.issued_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "",
  };
}

export async function issueCertificate({ traineeId, traineeName, courseTitle, trainerName }) {
  const credentialId = generateCredentialId();
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      credential_id: credentialId,
      trainee_id: traineeId,
      trainee_name: traineeName,
      course_title: courseTitle,
      trainer_name: trainerName || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { certificate: withDisplayFields(data) };
}

export async function getCertificateByCredentialId(credentialId) {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("credential_id", credentialId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "not_found" };
  return { certificate: withDisplayFields(data) };
}

export async function getCertificatesForTrainee(traineeId) {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("trainee_id", traineeId)
    .order("issued_on", { ascending: false });

  if (error) return { error: error.message, certificates: [] };
  return { certificates: (data || []).map(withDisplayFields) };
}

// Admin: every certificate, newest first.
export async function getAllCertificates() {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("issued_on", { ascending: false });

  if (error) return { error: error.message, certificates: [] };
  return { certificates: (data || []).map(withDisplayFields) };
}

// Admin: flip a certificate to REVOKED. The public verify page reflects this instantly.
export async function revokeCertificate(credentialId) {
  const { data, error } = await supabase
    .from("certificates")
    .update({ status: "REVOKED" })
    .eq("credential_id", credentialId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { certificate: withDisplayFields(data) };
}

// Admin: reinstate a mistakenly revoked certificate.
export async function reinstateCertificate(credentialId) {
  const { data, error } = await supabase
    .from("certificates")
    .update({ status: "ISSUED" })
    .eq("credential_id", credentialId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { certificate: withDisplayFields(data) };
}

// Admin: trainees eligible to receive a certificate (approved accounts only).
export async function getApprovedTrainees() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "trainee")
    .eq("status", "APPROVED")
    .order("full_name");

  if (error) return { error: error.message, trainees: [] };
  return { trainees: data || [] };
}