import { notFound } from "next/navigation";
import EventForm from "@/components/EventForm";
import { findEventById } from "@/lib/eventsService";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;

  const event = await findEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Trekking Event
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the event details, registration dates, thumbnail, and status.
        </p>
      </div>

      <EventForm mode="edit" initial={event} />
    </div>
  );
}
