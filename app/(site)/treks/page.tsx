import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { listEvents } from "@/lib/eventsService";

export const metadata: Metadata = {
  title: "Upcoming Expeditions — LSCVentures",
};

export const dynamic = "force-dynamic";

function formatDate(d: string) {
  if (!d) return "";

  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function TreksPage() {
  let events: Awaited<ReturnType<typeof listEvents>> = [];
  let loadError = false;

  try {
    events = await listEvents();

    console.log(
      `Loaded ${events.length} events from Google Sheets.`
    );
  } catch (err) {
    console.error("Could not load trek events:", err);
    loadError = true;
  }

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = events
    .filter(
      (e) =>
        e.status === "PUBLISHED" &&
        e.registrationEnd >= today
    )
    .sort((a, b) =>
      a.registrationStart < b.registrationStart ? -1 : 1
    );

  return (
    <>
      {/* PAGE INTRO */}
      <section className="page-intro">
        <div className="wrap">
          <span className="page-intro__rank">
            Leadership Outdoor Expeditions
          </span>

          <h1>Upcoming expeditions</h1>

          <p>
            Every expedition is personally led by Major LS Chaudhary,
            in small groups. Registration windows are limited —
            enquire early.
          </p>
        </div>
      </section>

      {/* TREK LISTING */}
      <section className="section">
        <div className="wrap">

          {/* ERROR */}
          {loadError && (
            <p className="gallery-note">
              Couldn't load upcoming expeditions right now —
              please check back shortly.
            </p>
          )}

          {/* EMPTY STATE */}
          {!loadError && upcoming.length === 0 && (
            <p className="gallery-note">
              No upcoming expeditions are open for registration right
              now. Check back soon, or{" "}
              <Link
                href="/contact?interest=trekking"
                className="section__link"
              >
                send an enquiry
              </Link>{" "}
              to be notified.
            </p>
          )}

          {/* CARDS */}
          {upcoming.length > 0 && (
            <div className="events-grid">
              {upcoming.map((ev) => (
                <article
                  className="event-card"
                  key={ev.id}
                >
                  {/* IMAGE */}
                  <div className="event-card__thumb">
                    <Image
                      src={ev.thumbnailUrl}
                      alt={ev.name}
                      fill
                      sizes="
                        (max-width: 650px) 100vw,
                        (max-width: 1000px) 50vw,
                        33vw
                      "
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* CARD BODY */}
                  <div className="event-card__body">

                    {/* TREK NAME */}
                    <h3>{ev.name}</h3>

                    {/* DURATION */}
                    {ev.duration && (
                      <span className="event-card__duration">
                        {ev.duration}
                      </span>
                    )}

                    {/* TREK DATES */}
                    {ev.eventStartDate &&
                      ev.eventEndDate && (
                        <div className="event-card__dates">
                          {formatDate(ev.eventStartDate)}
                          {" – "}
                          {formatDate(ev.eventEndDate)}
                        </div>
                      )}

                    {/* DESCRIPTION */}
                    {ev.description && (
                      <p>
                        {ev.description}
                      </p>
                    )}

                    {/* REGISTRATION WINDOW */}
                    <div className="event-card__reg">
                      Registration:{" "}
                      {formatDate(
                        ev.registrationStart
                      )}
                      {" – "}
                      {formatDate(
                        ev.registrationEnd
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/contact?interest=trekking&trek=${encodeURIComponent(
                        ev.name
                      )}`}
                      className="btn btn--outline"
                    >
                      Enquire Now
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

