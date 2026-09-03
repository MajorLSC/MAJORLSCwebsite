import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { listEnquiries } from "@/lib/sheetsService";
import { EnquiryType } from "@/lib/enquiryFields";

const TYPES: EnquiryType[] = ["mentoring", "trekking", "corporate"];

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const typeParam = req.nextUrl.searchParams.get("type") as EnquiryType | null;
  const typesToFetch = typeParam && TYPES.includes(typeParam) ? [typeParam] : TYPES;

  try {
    const results = await Promise.all(
      typesToFetch.map(async (type) => {
        const records = await listEnquiries(type);
        return records.map((r) => ({ ...r, type }));
      })
    );

    const all = results.flat().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({ success: true, enquiries: all });
  } catch (err) {
    console.error("Failed to list enquiries:", err);
    return NextResponse.json({ success: false, code: "INTERNAL_ERROR", message: "Could not load enquiries." }, { status: 500 });
  }
}
