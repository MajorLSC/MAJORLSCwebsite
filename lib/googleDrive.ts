import { Readable } from "stream";
import { getDriveClient } from "./googleClients";

export type MediaCategory =
  | "Leadership & Outdoor Expeditions"
  | "Public Speaking"
  | "Corporate Events"
  | "Military";

export interface DriveImage {
  id: string;
  name: string;
  url: string;
  category: MediaCategory;
  story: string;
  date?: string;
}

const MEDIA_CATEGORIES: MediaCategory[] = [
  "Leadership & Outdoor Expeditions",
  "Public Speaking",
  "Corporate Events",
  "Military",
];

/**
 * Lists images from one category folder in Google Drive.
 *
 * The image filename becomes the story title.
 * The Google Drive file description becomes the story text.
 */
async function listFolderImages(
  folderId: string,
  category: MediaCategory
): Promise<DriveImage[]> {
  const drive = getDriveClient();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id, name, thumbnailLink, description, createdTime)",
    orderBy: "createdTime desc",
    pageSize: 50,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files = res.data.files ?? [];

  return files
    .filter((file) => file.id && file.thumbnailLink)
    .map((file) => ({
      id: file.id as string,
      name: file.name ?? "Photo",
      url: (file.thumbnailLink as string).replace(/=s\d+$/, "=s1200"),
      category,
      story: file.description?.trim() ?? "",
      date: file.createdTime
        ? new Date(file.createdTime).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
          })
        : undefined,
    }));
}

/**
 * Lists all media images from the four category folders
 * inside GOOGLE_DRIVE_GALLERY_FOLDER_ID.
 *
 * Expected Google Drive structure:
 *
 * LSCVentures Media
 * ├── Leadership & Outdoor Expeditions
 * ├── Public Speaking
 * ├── Corporate Events
 * └── Military
 */
export async function listDriveImages(): Promise<DriveImage[]> {
  const parentFolderId = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID;

  if (!parentFolderId) {
    return [];
  }

  const drive = getDriveClient();

  const folderRes = await drive.files.list({
    q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 50,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const folders = folderRes.data.files ?? [];

  const results = await Promise.all(
    MEDIA_CATEGORIES.map(async (category) => {
      const folder = folders.find(
        (item) => item.name?.trim() === category
      );

      if (!folder?.id) {
        return [];
      }

      return listFolderImages(folder.id, category);
    })
  );

  return results.flat();
}

/**
 * Uploads a trek/event thumbnail into
 * GOOGLE_DRIVE_EVENTS_FOLDER_ID.
 *
 * IMPORTANT:
 * This folder must be inside a Google Workspace Shared Drive.
 */
export async function uploadEventThumbnail(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ id: string; url: string }> {
  const folderId = process.env.GOOGLE_DRIVE_EVENTS_FOLDER_ID;

  if (!folderId) {
    throw new Error("Missing GOOGLE_DRIVE_EVENTS_FOLDER_ID env var.");
  }

  const drive = getDriveClient();

  const createRes = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const fileId = createRes.data.id;

  if (!fileId) {
    throw new Error("Drive upload did not return a file id.");
  }

  return {
    id: fileId,
    url: `https://drive.google.com/uc?export=view&id=${fileId}`,
  };
}

/**
 * Deletes an event thumbnail from Google Drive.
 *
 * Cleanup is best-effort so a failed Drive deletion
 * does not break the parent operation.
 */
export async function deleteEventThumbnail(
  fileId: string
): Promise<void> {
  const drive = getDriveClient();

  try {
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
  } catch (err) {
    console.error(
      "Could not delete old thumbnail from Drive:",
      err
    );
  }
}