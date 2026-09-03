"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { TrekEvent } from "@/lib/eventsService";

interface Props {
  mode: "create" | "edit";
  initial?: TrekEvent;
}

export default function EventForm({
  mode,
  initial,
}: Props) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [preview, setPreview] = useState<string | null>(
    initial?.thumbnailUrl ?? null
  );

  function handleThumbnailChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      setPreview(initial?.thumbnailUrl ?? null);
      return;
    }

    // Revoke the previous local preview.
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      const url =
        mode === "create"
          ? "/api/admin/events"
          : `/api/admin/events/${initial!.id}`;

      const method =
        mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Something went wrong."
        );
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      console.error(
        "Event form submission failed:",
        err
      );

      setError(
        "Unable to save the event. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="form event-form"
      onSubmit={handleSubmit}
    >
      {/* Event Name */}
      <div className="field">
        <label htmlFor="name">
          Trek name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          defaultValue={initial?.name}
          placeholder="e.g. Kashmir Great Lakes"
        />
      </div>

      {/* Description */}
      <div className="field">
        <label htmlFor="description">
          Details
        </label>

        <textarea
          id="description"
          name="description"
          rows={6}
          maxLength={5000}
          defaultValue={initial?.description}
          placeholder="Describe the trek..."
        />
      </div>

      {/* Duration */}
      <div className="form-row">
        <div className="field">
          <label htmlFor="duration">
            Duration
          </label>

          <input
            id="duration"
            name="duration"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. 5 Days / 4 Nights"
            defaultValue={initial?.duration}
          />
        </div>
      </div>

      {/* Event Dates */}
      <div className="form-row">
        <div className="field">
          <label htmlFor="eventStartDate">
            Event starts
          </label>

          <input
            id="eventStartDate"
            name="eventStartDate"
            type="date"
            required
            defaultValue={initial?.eventStartDate}
          />
        </div>

        <div className="field">
          <label htmlFor="eventEndDate">
            Event ends
          </label>

          <input
            id="eventEndDate"
            name="eventEndDate"
            type="date"
            required
            defaultValue={initial?.eventEndDate}
          />
        </div>
      </div>

      {/* Registration Dates */}
      <div className="form-row">
        <div className="field">
          <label htmlFor="registrationStart">
            Registration opens
          </label>

          <input
            id="registrationStart"
            name="registrationStart"
            type="date"
            required
            defaultValue={initial?.registrationStart}
          />
        </div>

        <div className="field">
          <label htmlFor="registrationEnd">
            Registration closes
          </label>

          <input
            id="registrationEnd"
            name="registrationEnd"
            type="date"
            required
            defaultValue={initial?.registrationEnd}
          />
        </div>
      </div>

      {/* Thumbnail */}
      <div className="field">
        <label htmlFor="thumbnail">
          Thumbnail image{" "}
          {mode === "edit" &&
            "(leave empty to keep the current one)"}
        </label>

        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={mode === "create"}
          onChange={handleThumbnailChange}
        />

        {preview && (
          <img
            src={preview}
            alt="Event thumbnail preview"
            className="event-form__preview"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="form-status form-status--error">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn btn--primary"
        disabled={submitting}
      >
        {submitting
          ? "Saving..."
          : mode === "create"
          ? "Create Event"
          : "Save Changes"}
      </button>
    </form>
  );
}