import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { updateEnquiryStatus } from "@/lib/sheetsService";
import { enquiryStatuses, EnquiryStatus, EnquiryType } from "@/lib/enquiryFields";

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { type, id, status } = await req.json().catch(() => ({}));

  if (!type || !id || !enquiryStatuses.includes(status)) {
    return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Missing or invalid fields." }, { status: 400 });
  }

  try {
    await updateEnquiryStatus(type as EnquiryType, id, status as EnquiryStatus, session.email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update status:", err);
    return NextResponse.json({ success: false, code: "INTERNAL_ERROR", message: "Could not update status." }, { status: 500 });
  }
}
