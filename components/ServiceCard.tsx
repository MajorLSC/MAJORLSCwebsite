import Link from "next/link";
import type { Service } from "@/lib/data";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <span className="service-card__tag">{service.tag}</span>

      <h3>{service.title}</h3>

      <p>{service.summary}</p>

      {service.comingSoon ? (
        <span className="service-card__link service-card__link--disabled">
          Coming Soon
        </span>
      ) : (
        <Link
          href={`/services#${service.id}`}
          className="service-card__link"
        >
          Learn more
        </Link>
      )}
    </article>
  );
}
