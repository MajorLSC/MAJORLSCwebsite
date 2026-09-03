"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  enquiryFields,
  enquiryStatuses,
  enquiryTypeLabels,
  EnquiryStatus,
  EnquiryType,
} from "@/lib/enquiryFields";

interface EnquiryRecord {
  id: string;
  type: EnquiryType;
  status: EnquiryStatus;
  createdAt: string;
  fields: Record<string, string>;
}

export default function AdminEnquiryDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const type = params.type as EnquiryType;
  const id = params.id as string;

  const [record, setRecord] = useState<EnquiryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [markSelected, setMarkSelected] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/enquiries?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.enquiries.find((e: EnquiryRecord) => e.id === id);
          setRecord(found ?? null);
          if (found) {
            const name = found.fields.name || found.fields.contactPerson || "there";
            setSubject("LSCVentures — Your Application / Enquiry");
            setBody(`<p>Hi ${name},</p><p></p><p>Thank you for reaching out to LSCVentures.</p>`);
          }
        }
        setLoading(false);
      });
  }, [type, id]);

  async function updateStatus(newStatus: EnquiryStatus) {
    setStatusSaving(true);
    setStatusMsg("");
    const res = await fetch("/api/admin/enquiries/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      setRecord((r) => (r ? { ...r, status: newStatus } : r));
      setStatusMsg("Status updated.");
    } else {
      setStatusMsg(data.message || "Could not update status.");
    }
    setStatusSaving(false);
  }

  async function sendEmail() {
    if (!record) return;
    const to = record.fields.email;
    if (!to) {
      setSendMsg({ ok: false, text: "This enquiry has no email address on file." });
      return;
    }
    setSending(true);
    setSendMsg(null);
    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, enquiryId: id, to, subject, html: body, markSelected }),
    });
    const data = await res.json();
    if (data.success) {
      setSendMsg({ ok: true, text: `Email sent to ${to}.` });
      if (markSelected) setRecord((r) => (r ? { ...r, status: "SELECTED" } : r));
    } else {
      setSendMsg({ ok: false, text: data.message || "Could not send the email." });
    }
    setSending(false);
  }

  if (loading) return <div className="admin-page">Loading...</div>;
  if (!record) return <div className="admin-page">Enquiry not found.</div>;

  return (
    <div className="admin-page">
      <div className="admin-detail__head">
        <div>
          <span className="page-intro__rank">{enquiryTypeLabels[type]}</span>
          <h1>{record.fields.name || record.fields.companyName}</h1>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="admin-detail__grid">
        <section className="admin-panel">
          <h2>Details</h2>
          <dl className="admin-detail__list">
            {enquiryFields[type].map((f) => (
              <div key={f.key}>
                <dt>{f.label}</dt>
                <dd>{record.fields[f.key] || "—"}</dd>
              </div>
            ))}
          </dl>

          <h2>Status</h2>
          <div className="admin-status-row">
            <select
              value={record.status}
              onChange={(e) => updateStatus(e.target.value as EnquiryStatus)}
              disabled={statusSaving}
            >
              {enquiryStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {statusMsg && <span className="admin-status-row__msg">{statusMsg}</span>}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Send email</h2>
          <div className="field">
            <label>To</label>
            <input type="text" value={record.fields.email || "No email on file"} disabled />
          </div>
          <div className="field">
            <label>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="field">
            <label>Message</label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={markSelected}
              onChange={(e) => setMarkSelected(e.target.checked)}
            />
            Mark this enquiry as Selected after sending
          </label>

          {sendMsg && (
            <p className={`form-status ${sendMsg.ok ? "" : "form-status--error"}`}>{sendMsg.text}</p>
          )}

          <button type="button" className="btn btn--primary" onClick={sendEmail} disabled={sending}>
            {sending ? "Sending..." : "Send Email"}
          </button>
        </section>
      </div>
    </div>
  );
}
