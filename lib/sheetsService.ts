import { getSheetsClient } from "./googleClients";
import { enquiryFields, EnquiryType, EnquiryStatus } from "./enquiryFields";

const SHEET_ID_ENV: Record<EnquiryType, string> = {
  mentoring: "GOOGLE_SHEET_ID_MENTORING",
  trekking: "GOOGLE_SHEET_ID_TREKKING",
  corporate: "GOOGLE_SHEET_ID_CORPORATE",
};

const ENQUIRIES_TAB = "Enquiries";
const EMAIL_LOG_TAB = "EmailLog";

function spreadsheetId(type: EnquiryType): string {
  const id = process.env[SHEET_ID_ENV[type]];
  if (!id) throw new Error(`Missing env var ${SHEET_ID_ENV[type]} for the ${type} sheet.`);
  return id;
}

// Column order for the Enquiries tab: ID, <type-specific fields...>, Status, CreatedAt, UpdatedAt, UpdatedBy
function columns(type: EnquiryType): string[] {
  return ["ID", ...enquiryFields[type].map((f) => f.key), "Status", "CreatedAt", "UpdatedAt", "UpdatedBy"];
}

export interface EnquiryRecord {
  id: string;
  rowNumber: number; // 1-indexed sheet row, needed for updates
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  fields: Record<string, string>;
}

export async function appendEnquiry(type: EnquiryType, values: Record<string, string>) {
  const sheets = getSheetsClient();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const cols = columns(type);

  const row = cols.map((col) => {
    if (col === "ID") return id;
    if (col === "Status") return "NEW";
    if (col === "CreatedAt" || col === "UpdatedAt") return now;
    if (col === "UpdatedBy") return "";
    return values[col] ?? "";
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(type),
    range: `${ENQUIRIES_TAB}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  return { id, createdAt: now };
}

export async function listEnquiries(type: EnquiryType): Promise<EnquiryRecord[]> {
  const sheets = getSheetsClient();
  const cols = columns(type);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(type),
    range: `${ENQUIRIES_TAB}!A2:Z`,
  });

  const rows = res.data.values ?? [];

  return rows
    .map((row, idx) => {
      if (!row[0]) return null;
      const record: Record<string, string> = {};
      cols.forEach((col, i) => (record[col] = row[i] ?? ""));

      const fields: Record<string, string> = {};
      enquiryFields[type].forEach((f) => (fields[f.key] = record[f.key] ?? ""));

      return {
        id: record.ID,
        rowNumber: idx + 2, // +2 because data starts at row 2 (row 1 is the header)
        status: (record.Status || "NEW") as EnquiryStatus,
        createdAt: record.CreatedAt,
        updatedAt: record.UpdatedAt,
        updatedBy: record.UpdatedBy,
        fields,
      };
    })
    .filter((r): r is EnquiryRecord => r !== null)
    .reverse(); // newest first
}

export async function findEnquiryById(type: EnquiryType, id: string): Promise<EnquiryRecord | null> {
  const all = await listEnquiries(type);
  return all.find((e) => e.id === id) ?? null;
}

export async function updateEnquiryStatus(
  type: EnquiryType,
  id: string,
  status: EnquiryStatus,
  updatedBy: string
) {
  const record = await findEnquiryById(type, id);
  if (!record) throw new Error("Enquiry not found");

  const sheets = getSheetsClient();
  const cols = columns(type);
  const statusColIdx = cols.indexOf("Status");
  const updatedAtColIdx = cols.indexOf("UpdatedAt");
  const updatedByColIdx = cols.indexOf("UpdatedBy");
  const now = new Date().toISOString();

  const colLetter = (idx: number) => String.fromCharCode(65 + idx);

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: spreadsheetId(type),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: [
        { range: `${ENQUIRIES_TAB}!${colLetter(statusColIdx)}${record.rowNumber}`, values: [[status]] },
        { range: `${ENQUIRIES_TAB}!${colLetter(updatedAtColIdx)}${record.rowNumber}`, values: [[now]] },
        { range: `${ENQUIRIES_TAB}!${colLetter(updatedByColIdx)}${record.rowNumber}`, values: [[updatedBy]] },
      ],
    },
  });
}

export async function appendEmailLog(
  type: EnquiryType,
  entry: { enquiryId: string; recipient: string; subject: string; status: "SENT" | "FAILED"; sentBy: string }
) {
  const sheets = getSheetsClient();
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(type),
    range: `${EMAIL_LOG_TAB}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[entry.enquiryId, entry.recipient, entry.subject, entry.status, now, entry.sentBy]],
    },
  });
}
