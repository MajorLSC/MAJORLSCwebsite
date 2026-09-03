import Link from "next/link";
import EventForm from  "@/components/EventForm";

export default function NewEventPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <Link
            href="/admin/events"
            className="section__link"
          >
            ← Back to Events
          </Link>

          <h1>Create Trek Event</h1>

          <p>
            Add a new trekking event and publish it when
            registration is ready.
          </p>
        </div>
      </div>
        <EventForm mode="create" />
    </div>
  );
}