import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { sendEmail } from "@/lib/mailer";
import { appendEmailLog, updateEnquiryStatus } from "@/lib/sheetsService";
import { EnquiryType } from "@/lib/enquiryFields";

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { type, enquiryId, to, subject, html, markSelected } = await req.json().catch(() => ({}));

  if (!type || !enquiryId || !to || !subject || !html) {
    return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Missing required fields." }, { status: 400 });
  }

  try {
    await sendEmail({ to, subject, html });
    await appendEmailLog(type as EnquiryType, { enquiryId, recipient: to, subject, status: "SENT", sentBy: session.email });

    if (markSelected) {
      await updateEnquiryStatus(type as EnquiryType, enquiryId, "SELECTED", session.email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    try {
      await appendEmailLog(type as EnquiryType, { enquiryId, recipient: to, subject, status: "FAILED", sentBy: session.email });
    } catch {}
    return NextResponse.json({ success: false, code: "EMAIL_ERROR", message: "Could not send the email." }, { status: 500 });
  }
}
