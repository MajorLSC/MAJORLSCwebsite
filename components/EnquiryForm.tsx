"use client";

import { FormEvent, useState } from "react";
import { enquiryFields, EnquiryType } from "@/lib/enquiryFields";

type Status = "idle" | "submitting" | "success" | "error";

export default function EnquiryForm({ type, prefill }: { type: EnquiryType; prefill?: Record<string, string> }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fields = enquiryFields[type];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Something went wrong sending your enquiry. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} key={type}>
      {/* honeypot — hidden from real visitors, catches basic bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} />

      {fields.map((field) =>
        field.input === "textarea" ? (
          <div className="field" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <textarea id={field.key} name={field.key} required={field.required} defaultValue={prefill?.[field.key]} />
          </div>
        ) : (
          <div className="field" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              name={field.key}
              type={field.input}
              required={field.required}
              defaultValue={prefill?.[field.key]}
            />
          </div>
        )
      )}

      <button type="submit" className="btn btn--primary form-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send Enquiry"}
      </button>

      {status === "success" && (
        <p className="form-status">
          Thank you — your enquiry has been received. We'll get back to you shortly.
        </p>
      )}
      {status === "error" && <p className="form-status form-status--error">{errorMsg}</p>}
    </form>
  );
}