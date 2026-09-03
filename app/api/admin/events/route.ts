import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminGuard";

import {
  createEvent,
  listEvents,
} from "@/lib/eventsService";

import {
  deleteEventThumbnail,
  uploadEventThumbnail,
} from "@/lib/googleDrive";

const MAX_THUMBNAIL_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function isValidDate(
  value: string
): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  return !Number.isNaN(
    date.getTime()
  );
}

export async function GET(
  req: NextRequest
) {
  const session = await requireAdmin(req);

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const events = await listEvents();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(
      "Failed to list events:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message:
          "Could not load events.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  const session = await requireAdmin(req);

  if (session instanceof NextResponse) {
    return session;
  }

  let uploadedThumbnailId: string | null =
    null;

  try {
    const form = await req.formData();

    const name = String(
      form.get("name") || ""
    ).trim();

    const description = String(
      form.get("description") || ""
    ).trim();

    const duration = String(
      form.get("duration") || ""
    ).trim();

    const eventStartDate = String(
      form.get("eventStartDate") || ""
    ).trim();

    const eventEndDate = String(
      form.get("eventEndDate") || ""
    ).trim();

    const registrationStart = String(
      form.get("registrationStart") || ""
    ).trim();

    const registrationEnd = String(
      form.get("registrationEnd") || ""
    ).trim();

    const thumbnail = form.get(
      "thumbnail"
    );

    /*
     * Basic required-field validation.
     */
    if (
      !name ||
      !duration ||
      !eventStartDate ||
      !eventEndDate ||
      !registrationStart ||
      !registrationEnd
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Name, duration, event dates, and registration dates are required.",
        },
        { status: 400 }
      );
    }

    /*
     * Date validation.
     */
    const datesAreValid =
      isValidDate(eventStartDate) &&
      isValidDate(eventEndDate) &&
      isValidDate(registrationStart) &&
      isValidDate(registrationEnd);

    if (!datesAreValid) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Please provide valid dates.",
        },
        { status: 400 }
      );
    }

    /*
     * Event cannot end before it starts.
     */
    if (
      eventStartDate > eventEndDate
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Event end date cannot be before the event start date.",
        },
        { status: 400 }
      );
    }

    /*
     * Registration cannot close before it opens.
     */
    if (
      registrationStart >
      registrationEnd
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Registration closing date cannot be before the opening date.",
        },
        { status: 400 }
      );
    }

    /*
     * Registration should close before
     * the event starts.
     */
    if (
      registrationEnd >
      eventStartDate
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Registration must close on or before the event starts.",
        },
        { status: 400 }
      );
    }

    /*
     * Thumbnail validation.
     */
    if (
      !(thumbnail instanceof File) ||
      thumbnail.size === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "A thumbnail image is required.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        thumbnail.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Only JPG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (
      thumbnail.size >
      MAX_THUMBNAIL_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Thumbnail image must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    /*
     * Upload thumbnail.
     */
    const buffer = Buffer.from(
      await thumbnail.arrayBuffer()
    );

    const uploaded =
      await uploadEventThumbnail(
        buffer,
        thumbnail.name,
        thumbnail.type
      );

    uploadedThumbnailId =
      uploaded.id;

    /*
     * Create Sheet record.
     */
    const result = await createEvent({
      name,
      description,
      duration,

      eventStartDate,
      eventEndDate,

      registrationStart,
      registrationEnd,

      thumbnailUrl: uploaded.url,
      thumbnailDriveId: uploaded.id,
    });

    return NextResponse.json(
      {
        success: true,
        id: result.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to create event:",
      error
    );

    /*
     * If Sheet creation failed after
     * Drive upload, remove the orphan image.
     */
    if (uploadedThumbnailId) {
      await deleteEventThumbnail(
        uploadedThumbnailId
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message:
          "Could not create the event.",
      },
      { status: 500 }
    );
  }
}