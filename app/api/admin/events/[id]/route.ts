import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminGuard";

import {
  findEventById,
  setEventStatus,
  updateEvent,
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
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await requireAdmin(req);

  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await params;

  try {
    const event =
      await findEventById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          code: "NOT_FOUND",
          message:
            "Event not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(
      "Failed to get event:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message:
          "Could not load the event.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await requireAdmin(req);

  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await params;

  const existing =
    await findEventById(id);

  if (!existing) {
    return NextResponse.json(
      {
        success: false,
        code: "NOT_FOUND",
        message:
          "Event not found.",
      },
      { status: 404 }
    );
  }

  let newThumbnailId: string | null =
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

    const thumbnail =
      form.get("thumbnail");

    /*
     * Required fields.
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
     * Validate dates.
     */
    if (
      !isValidDate(eventStartDate) ||
      !isValidDate(eventEndDate) ||
      !isValidDate(registrationStart) ||
      !isValidDate(registrationEnd)
    ) {
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
     * Keep existing thumbnail unless
     * a new one was supplied.
     */
    let thumbnailUrl =
      existing.thumbnailUrl;

    let thumbnailDriveId =
      existing.thumbnailDriveId;

    const hasNewThumbnail =
      thumbnail instanceof File &&
      thumbnail.size > 0;

    /*
     * Upload the new thumbnail first.
     */
    if (hasNewThumbnail) {
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

      const buffer = Buffer.from(
        await thumbnail.arrayBuffer()
      );

      const uploaded =
        await uploadEventThumbnail(
          buffer,
          thumbnail.name,
          thumbnail.type
        );

      newThumbnailId =
        uploaded.id;

      thumbnailUrl =
        uploaded.url;

      thumbnailDriveId =
        uploaded.id;
    }

    /*
     * Update Google Sheet.
     *
     * If this fails, the new image is
     * cleaned up and the old image remains.
     */
    try {
      await updateEvent(id, {
        name,
        description,
        duration,

        eventStartDate,
        eventEndDate,

        registrationStart,
        registrationEnd,

        thumbnailUrl,
        thumbnailDriveId,
      });
    } catch (error) {
      if (newThumbnailId) {
        await deleteEventThumbnail(
          newThumbnailId
        );
      }

      throw error;
    }

    /*
     * Sheet update succeeded.
     *
     * Now safely delete the old image.
     */
    if (
      newThumbnailId &&
      existing.thumbnailDriveId &&
      existing.thumbnailDriveId !==
        newThumbnailId
    ) {
      await deleteEventThumbnail(
        existing.thumbnailDriveId
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to update event:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message:
          "Could not update the event.",
      },
      { status: 500 }
    );
  }
}

/**
 * Soft delete.
 *
 * The event remains in Google Sheets but
 * becomes ARCHIVED and therefore can be
 * excluded from the public website.
 */
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await requireAdmin(req);

  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await params;

  try {
    const existing =
      await findEventById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          code: "NOT_FOUND",
          message:
            "Event not found.",
        },
        { status: 404 }
      );
    }

    await setEventStatus(
      id,
      "ARCHIVED"
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to archive event:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message:
          "Could not archive the event.",
      },
      { status: 500 }
    );
  }
}