import type { EnquiryStatus } from "@/lib/enquiryFields";

const STYLES: Record<EnquiryStatus, string> = {
  NEW: "badge badge--new",
  CONTACTED: "badge badge--contacted",
  SELECTED: "badge badge--selected",
  REJECTED: "badge badge--rejected",
  COMPLETED: "badge badge--completed",
};

export default function StatusBadge({ status }: { status: EnquiryStatus }) {
  return <span className={STYLES[status]}>{status}</span>;
}
