import { NextRequest, NextResponse } from "next/server";
import { appendEnquiry } from "@/lib/sheetsService";
import { enquiryFields, EnquiryType } from "@/lib/enquiryFields";

const VALID_TYPES: EnquiryType[] = ["mentoring", "trekking", "corporate"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Invalid request body." }, { status: 400 });
  }

  const type = body.type as EnquiryType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Unknown enquiry type." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const fields = enquiryFields[type];
  const values: Record<string, string> = {};

  for (const field of fields) {
    const value = body[field.key];
    if (field.required && (value === undefined || String(value).trim() === "")) {
      return NextResponse.json(
        { success: false, code: "VALIDATION_ERROR", message: `Missing required field: ${field.label}` },
        { status: 400 }
      );
    }
    values[field.key] = value !== undefined ? String(value) : "";
  }

  try {
    const result = await appendEnquiry(type, values);
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("Failed to append enquiry to Google Sheets:", err);
    return NextResponse.json(
      { success: false, code: "INTERNAL_ERROR", message: "Could not save your enquiry. Please try again shortly." },
      { status: 500 }
    );
  }
}
