import { getSheetsClient } from "./googleClients";

const TAB = "Events";

const COLUMNS = [
  "ID",
  "Name",
  "Description",
  "Duration",
  "EventStartDate",
  "EventEndDate",
  "RegistrationStart",
  "RegistrationEnd",
  "ThumbnailUrl",
  "ThumbnailDriveId",
  "Status",
  "CreatedAt",
  "UpdatedAt",
] as const;

export type EventStatus =
  | "PUBLISHED"
  | "ARCHIVED";

export interface TrekEvent {
  id: string;
  rowNumber: number;

  name: string;
  description: string;
  duration: string;

  eventStartDate: string;
  eventEndDate: string;

  registrationStart: string;
  registrationEnd: string;

  thumbnailUrl: string;
  thumbnailDriveId: string;

  status: EventStatus;

  createdAt: string;
  updatedAt: string;
}

export interface EventInput {
  name: string;
  description: string;
  duration: string;

  eventStartDate: string;
  eventEndDate: string;

  registrationStart: string;
  registrationEnd: string;

  thumbnailUrl: string;
  thumbnailDriveId: string;
}

function spreadsheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID_EVENTS;

  if (!id) {
    throw new Error(
      "Missing env var GOOGLE_SHEET_ID_EVENTS."
    );
  }

  return id;
}

function rowToEvent(
  row: string[],
  rowNumber: number
): TrekEvent | null {
  if (!row[0]) {
    return null;
  }

  const record: Record<string, string> = {};

  COLUMNS.forEach((column, index) => {
    record[column] = row[index] ?? "";
  });

  const status: EventStatus =
    record.Status === "ARCHIVED"
      ? "ARCHIVED"
      : "PUBLISHED";

  return {
    id: record.ID,
    rowNumber,

    name: record.Name,
    description: record.Description,
    duration: record.Duration,

    eventStartDate: record.EventStartDate,
    eventEndDate: record.EventEndDate,

    registrationStart: record.RegistrationStart,
    registrationEnd: record.RegistrationEnd,

    thumbnailUrl: record.ThumbnailUrl,
    thumbnailDriveId: record.ThumbnailDriveId,

    status,

    createdAt: record.CreatedAt,
    updatedAt: record.UpdatedAt,
  };
}

export async function listEvents(): Promise<TrekEvent[]> {
  const sheets = getSheetsClient();

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId(),
      range: `${TAB}!A2:M`,
    });

  const rows = response.data.values ?? [];
  console.log(`Found ${rows.length} rows in ${TAB} tab.`);

  return rows
    .map((row, index) =>
      rowToEvent(row, index + 2)
    )
    .filter(
      (event): event is TrekEvent =>
        event !== null
    )
    .reverse();
}

export async function findEventById(
  id: string
): Promise<TrekEvent | null> {
  const events = await listEvents();

  return (
    events.find(
      (event) => event.id === id
    ) ?? null
  );
}

export async function createEvent(
  input: EventInput
): Promise<{ id: string }> {
  const sheets = getSheetsClient();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const row = [
    id,

    input.name,
    input.description,
    input.duration,

    input.eventStartDate,
    input.eventEndDate,

    input.registrationStart,
    input.registrationEnd,

    input.thumbnailUrl,
    input.thumbnailDriveId,

    "PUBLISHED",

    now,
    now,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${TAB}!A:M`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });

  return { id };
}

export async function updateEvent(
  id: string,
  updates: Partial<EventInput> & {
    status?: EventStatus;
  }
): Promise<void> {
  const existing = await findEventById(id);

  if (!existing) {
    throw new Error("Event not found");
  }

  const sheets = getSheetsClient();

  const now = new Date().toISOString();

  const merged: TrekEvent = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  const row = [
    merged.id,

    merged.name,
    merged.description,
    merged.duration,

    merged.eventStartDate,
    merged.eventEndDate,

    merged.registrationStart,
    merged.registrationEnd,

    merged.thumbnailUrl,
    merged.thumbnailDriveId,

    merged.status,

    merged.createdAt,
    merged.updatedAt,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${TAB}!A${existing.rowNumber}:M${existing.rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

export async function setEventStatus(
  id: string,
  status: EventStatus
): Promise<void> {
  await updateEvent(id, {
    status,
  });
}