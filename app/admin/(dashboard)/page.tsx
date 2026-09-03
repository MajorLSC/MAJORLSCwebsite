import Link from "next/link";
import { listEnquiries } from "@/lib/sheetsService";
import { EnquiryType, enquiryTypeLabels } from "@/lib/enquiryFields";

export const dynamic = "force-dynamic";

const TYPES: EnquiryType[] = ["mentoring", "trekking", "corporate"];

export default async function AdminDashboardPage() {
  const results = await Promise.allSettled(TYPES.map((t) => listEnquiries(t)));

  const byType = TYPES.map((type, i) => {
    const r = results[i];
    const records = r.status === "fulfilled" ? r.value : [];
    return {
      type,
      total: records.length,
      new: records.filter((e) => e.status === "NEW").length,
      failed: r.status === "rejected",
    };
  });

  const anyFailed = byType.some((t) => t.failed);
  const totalNew = byType.reduce((sum, t) => sum + t.new, 0);
  const totalAll = byType.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      {anyFailed && (
        <p className="form-status form-status--error">
          Couldn't load one or more sheets — check that GOOGLE_SHEET_ID_* env vars are set and
          each sheet is shared with the service account.
        </p>
      )}

      <div className="admin-cards">
        <div className="admin-card">
          <b>{totalAll}</b>
          <span>Total enquiries</span>
        </div>
        <div className="admin-card">
          <b>{totalNew}</b>
          <span>New enquiries</span>
        </div>
        {byType.map((t) => (
          <div className="admin-card" key={t.type}>
            <b>{t.total}</b>
            <span>{enquiryTypeLabels[t.type]}</span>
          </div>
        ))}
      </div>

      <Link href="/admin/enquiries" className="btn btn--outline" style={{ marginTop: 24, display: "inline-flex" }}>
        View all enquiries
      </Link>
    </div>
  );
}
