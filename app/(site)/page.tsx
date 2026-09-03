import Link from "next/link";
import ContourLines from "@/components/ContourLines";
import ServiceCard from "@/components/ServiceCard";
import GalleryGrid from "@/components/GalleryGrid";
import { services, galleryPlaceholders } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <ContourLines />
        <div className="wrap hero__inner">
          <div>
            <span className="hero__rank">Major LS Chaudhary (Retd.)</span>
            <h1>Leadership tested in the field, not in theory.</h1>
            <p className="hero__lede">
              LSCVentures brings military-grade discipline to the people and teams who
              want to lead better — through one-to-one mentoring, corporate leadership
              events, and expeditions that leave no room for pretending.
            </p>
            <div className="hero__actions">
              <Link href="/contact" className="btn btn--primary">
                Book a Conversation
              </Link>
              <Link href="/services" className="btn btn--outline">
                Explore Services
              </Link>
            </div>
          </div>
          <div className="hero__aside">
            <div className="hero__stat">
              <b>3</b>
              <span>Ways to work together</span>
            </div>
            <div className="hero__stat">
              <b>1:1</b>
              <span>Personally led, every time</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <h2>What we do</h2>
              <p>Ways to work with Major LS Chaudhary, each built for a different kind of challenge.</p>
            </div>
            <Link href="/services" className="section__link">
              View all services
            </Link>
          </div>
        </div>
        <div className="wrap">
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard service={service} key={service.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--raised">
        <div className="wrap about-hero">
          <div className="about-hero__frame">
            <img 
            src="founder-hero.jpeg"/>
          </div>
          <div className="about-body">
            <h2 style={{ marginBottom: 16 }}>About Major LS Chaudhary</h2>
            <p>
              After years of leading in demanding, high-stakes environments, Major
              Chaudhary now works with individuals, teams, and organisations who want
              that same clarity under pressure. His approach is direct: no jargon, no
              theory disconnected from real decisions.
            </p>
            <p>
              LSCVentures grew out of a simple observation — people learn who they are
              faster on a mountain trail or in an honest one-to-one conversation than
              in most training rooms.
            </p>
            <Link href="/about" className="section__link" style={{ display: "inline-block", marginTop: 20 }}>
              Read the full story
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <h2>From the field</h2>
              <p>A look at recent mentoring sessions, corporate events, and expeditions.</p>
            </div>
            {/* <Link href="/media" className="section__link">
              View full gallery
            </Link> */}
          </div>
        </div>
        <div className="wrap">
          <GalleryGrid items={galleryPlaceholders.slice(0, 3)} />
        </div>
      </section>
    </>
  );
}
