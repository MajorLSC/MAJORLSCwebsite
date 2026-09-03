import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — LSCVentures",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="page-intro__rank">About</span>

          <h1>
            Discipline is a skill. It can be taught.
          </h1>

          <p>
            Major LS Chaudhary spent his career leading people through situations
            where hesitation has real consequences. LSCVentures is where that
            experience is put to work for people building something outside the
            field — a business, a team, or simply a more disciplined version of
            themselves.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap about-hero">
          <div className="about-hero__frame">
            <img
              src="/founder-hero.jpeg"
              alt="Major L S Chaudhary"
            />
          </div>

          <div className="about-body">
            <h2>
              A DECADE IN UNIFORM.
              <br />
              A LIFETIME ON HIGH
              <br />
              GROUND.
            </h2>
            <br/>
            <p>
              Commissioned through the <strong>NDA</strong> and{" "}
              <strong>IMA</strong>, Major L S Chaudhary served with the{" "}
              <strong>Rashtriya Rifles</strong> across counter-terror operations
              in North Kashmir, leading long-range patrols and living for months
              above <strong>3,500 metres</strong>.
            </p>

            <p>
              A combat injury pulled him off the front line — not out of
              uniform. He moved into a technical staff role, coordinating
              projects across India and with friendly foreign nations, before
              retiring after a decade of service.
            </p>

            <p>
              He carried that same discipline into a second career few veterans
              attempt — earning an <strong>MBA in Boston</strong> and rising to{" "}
              <strong>Head of Data Science</strong> for a US-based multinational,
              across both the US and India.
            </p>

            <p>
              Today he brings both worlds together: running outdoor and
              corporate leadership programs, narrating combat leadership stories
              to a large YouTube audience, and speaking on stages worldwide,
              including <strong>TEDx</strong>.
            </p>

            <p>
              He founded LSCVentures to bridge two worlds: the discipline of
              military leadership and the everyday challenges faced by founders,
              executives, and teams. Whether in a one-to-one conversation, a
              corporate workshop, or on a mountain trail, the method is the same
              — face the real problem directly and build the habits that hold up
              under pressure.
            </p>

            <div className="credentials">
              <div>
                <b>Service</b>
                <span>10+ years / Rashtriya Rifles / Kashmir Operations</span>
              </div>

              <div>
                <b>Focus areas</b>
                <span>
                  Leadership, decision-making, accountability
                </span>
              </div>

              <div>
                <b>Expeditions led</b>
                <span>50+ treks and expeditions</span>
              </div>

              <div>
                <b>Speaking</b>
                <span>TEDx / Leadership &amp; Corporate Programs</span>
              </div>
            </div>

            <div className="founder-story__tagline">
              <p>
                <strong>Field and staff. Combat and command.</strong>
              </p>

              <h3>Major L S CHAUDHARY</h3>

              <p>
                <strong>
                  Battlefield and boardroom — tested twice over.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
