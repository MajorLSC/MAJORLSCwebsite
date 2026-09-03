import { google } from "googleapis";

// Server-only.
// Uses Application Default Credentials (ADC).
// In Cloud Run, authentication comes from the attached service account.

function getAuth() {
  return new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

export function getSheetsClient() {
  return google.sheets({
    version: "v4",
    auth: getAuth(),
  });
}

export function getDriveClient() {
  return google.drive({
    version: "v3",
    auth: getAuth(),
  });
}