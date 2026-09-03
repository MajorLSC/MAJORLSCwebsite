import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/lib/adminGuard";

import {
  findEventById,
  setEventStatus,
  EventStatus,
} from "@/lib/eventsService";

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

  try {
    /*
     * Verify event exists first.
     */
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

    const body =
      await req.json().catch(
        () => null
      );

    const status = body?.status;

    if (
      status !== "PUBLISHED" &&
      status !== "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Invalid status. Use PUBLISHED or ARCHIVED.",
        },
        { status: 400 }
      );
    }

    await setEventStatus(
      id,
      status as EventStatus
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to update event status:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message:
          "Could not update status.",
      },
      { status: 500 }
    );
  }
}