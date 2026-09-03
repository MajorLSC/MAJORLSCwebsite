"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TrekEvent } from "@/lib/eventsService";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/events", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load events.");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load events."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(ev: TrekEvent) {
    const nextStatus =
      ev.status === "PUBLISHED"
        ? "ARCHIVED"
        : "PUBLISHED";

    const action =
      nextStatus === "PUBLISHED"
        ? "publish"
        : "archive";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${ev.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(ev.id);
      setError("");

      const res = await fetch(
        `/api/admin/events/${ev.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update event status."
        );
      }

      setEvents((current) =>
        current.map((event) =>
          event.id === ev.id
            ? {
                ...event,
                status: nextStatus,
              }
            : event
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update event status."
      );
    } finally {
      setBusyId(null);
    }
  }

  function formatDate(value: string) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Trek Events</h1>
          <p>
            Manage trekking events, registration windows
            and publication status.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="btn btn--primary"
        >
          Add Event
        </Link>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <div className="admin-empty">
          <p>
            No trek events yet. Click "Add Event" to create
            one.
          </p>

          <Link
            href="/admin/events/new"
            className="btn btn--primary"
          >
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Name</th>
                <th>Duration</th>
                <th>Event Dates</th>
                <th>Registration Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td data-label="Thumbnail">
                    {ev.thumbnailUrl ? (
                      <img
                        src={ev.thumbnailUrl}
                        alt={ev.name}
                        className="admin-thumb"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td data-label="Name">
                    <strong>{ev.name}</strong>
                  </td>

                  <td data-label="Duration">
                    {ev.duration}
                  </td>

                  <td data-label="Event Dates">
                    {formatDate(ev.eventStartDate)}
                    {" → "}
                    {formatDate(ev.eventEndDate)}
                  </td>

                  <td data-label="Registration">
                    {formatDate(ev.registrationStart)}
                    {" → "}
                    {formatDate(ev.registrationEnd)}
                  </td>

                  <td data-label="Status">
                    <span
                      className={`badge ${
                        ev.status === "PUBLISHED"
                          ? "badge--selected"
                          : "badge--rejected"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>

                  <td data-label="Actions">
                    <div className="admin-table__actions">
                      <Link
                        href={`/admin/events/${ev.id}`}
                        className="section__link"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="link-button"
                        disabled={busyId === ev.id}
                        onClick={() => toggleStatus(ev)}
                      >
                        {busyId === ev.id
                          ? "Updating..."
                          : ev.status === "PUBLISHED"
                          ? "Archive"
                          : "Publish"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}