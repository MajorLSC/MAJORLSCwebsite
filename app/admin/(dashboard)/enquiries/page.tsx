"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import { enquiryTypeLabels, EnquiryStatus, EnquiryType } from "@/lib/enquiryFields";

interface Row {
  id: string;
  type: EnquiryType;
  status: EnquiryStatus;
  createdAt: string;
  fields: Record<string, string>;
}

const TYPE_FILTERS: Array<{ value: EnquiryType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "mentoring", label: "Mentoring" },
  { value: "trekking", label: "Trekking" },
  { value: "corporate", label: "Corporate" },
];

export default function AdminEnquiriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<EnquiryType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/enquiries")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRows(data.enquiries);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search.trim()) {
        const haystack = Object.values(r.fields).join(" ").toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, typeFilter, statusFilter, search]);

  return (
    <div className="admin-page">
      <h1>Enquiries</h1>

      <div className="admin-filters">
        <div className="admin-filters__tabs">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              className={typeFilter === f.value ? "is-active" : ""}
              onClick={() => setTypeFilter(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="SELECTED">Selected</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <input
          type="search"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading enquiries...</p>
      ) : filtered.length === 0 ? (
        <p>No enquiries match these filters.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name / Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.type}-${r.id}`}>
                  <td data-label="Name">{r.fields.name || r.fields.companyName || "—"}</td>
                  <td data-label="Type">{enquiryTypeLabels[r.type]}</td>
                  <td data-label="Status">
                    <StatusBadge status={r.status} />
                  </td>
                  <td data-label="Received">{new Date(r.createdAt).toLocaleString()}</td>
                  <td data-label="">
                    <Link href={`/admin/enquiries/${r.type}/${r.id}`} className="section__link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
