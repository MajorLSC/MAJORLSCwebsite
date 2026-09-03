import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services — LSCVentures",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="page-intro__rank">Services</span>

          <h1>Ways to work with Major LS Chaudhary</h1>

          <p>
            Whether it's a full-day workshop for your team, or a multi-day
            expedition, every engagement is personally led — never delegated.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {services.map((service) => (
            <div
              className="service-detail"
              id={service.id}
              key={service.id}
            >
              <div className="service-detail__grid">
                <div>
                  <span className="service-card__tag">
                    {service.tag}
                  </span>

                  <h3>{service.title}</h3>

                  <p>{service.description}</p>

                  {service.comingSoon ? (
                    <span
                      className="btn btn--outline service-coming-soon"
                      style={{
                        marginTop: 24,
                        display: "inline-flex",
                        cursor: "default",
                      }}
                    >
                      Coming Soon
                    </span>
                  ) : (
                    <Link
                      href={`/contact?interest=${service.id}`}
                      className="btn btn--outline"
                      style={{
                        marginTop: 24,
                        display: "inline-flex",
                      }}
                    >
                      Enquire about this
                    </Link>
                  )}
                </div>

                <ul>
                  {service.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}