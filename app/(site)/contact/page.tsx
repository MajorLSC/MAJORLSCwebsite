"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import { enquiryTypeLabels, EnquiryType } from "@/lib/enquiryFields";

// Add "mentoring", when payment gateways is integrated and we can accept payments for one-to-one sessions
const TYPES: EnquiryType[] = [ "corporate", "trekking"];

function ContactContent() {
  const params = useSearchParams();
  const initial = (params.get("interest") as EnquiryType) || "mentoring";
  const trekParam = params.get("trek") || "";
  const [type, setType] = useState<EnquiryType>(TYPES.includes(initial) ? initial : "mentoring");

  return (
    <section className="page-intro">
      <div className="wrap">
        <span className="page-intro__rank">Contact</span>
        <h1>Tell us what you're looking for</h1>
        <p>
          Whether it's a personal mentoring session, a leadership event for your team,
          or a trek — pick what you're enquiring about below and send us the details.
        </p>
      </div>

      <div className="wrap contact-grid" style={{ marginTop: 48, paddingBottom: 96 }}>
        <div className="contact-info">
          <h2 style={{ fontSize: 24 }}>Get in touch</h2>
          <p>
            Enquiries are reviewed personally. Choose the option that matches what you're
            after — each one asks a few different questions to help us prepare.
          </p>
          <ul className="contact-info__list">
            <li>
              <b>Email</b>
              <a href="mailto:contact@majorlsc.com">contact@majorlsc.com</a>
            </li>
            <li>
              <b>Phone</b>
              <span>+91 82738 90135</span>
            </li>
            <li>
              <b>Based in</b>
              <span>India · Asia/Kolkata</span>
            </li>
          </ul>
        </div>

        <div>
          <div className="type-switch">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={type === t ? "is-active" : ""}
                onClick={() => setType(t)}
              >
                {enquiryTypeLabels[t]}
              </button>
            ))}
          </div>
          <EnquiryForm type={type} prefill={type === "trekking" && trekParam ? { trekInterested: trekParam } : undefined} />
        </div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}