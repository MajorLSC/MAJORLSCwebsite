export type EnquiryType = "mentoring" | "trekking" | "corporate";

export interface FieldDef {
  key: string;
  label: string;
  input: "text" | "email" | "tel" | "number" | "textarea";
  required?: boolean;
}

// NOTE on trekking: the brief didn't list email/phone, but they're added here
// as required fields — without them there's no way to actually send the
// visitor a reply email. Everything else matches exactly what was asked for.
export const enquiryFields: Record<EnquiryType, FieldDef[]> = {
  mentoring: [
    { key: "name", label: "Full name", input: "text", required: true },
    { key: "email", label: "Email address", input: "email", required: true },
    { key: "phone", label: "Phone number", input: "tel", required: true },
    { key: "topic", label: "What is the topic you'd like to discuss?", input: "textarea", required: true },
    { key: "expectations", label: "What do you expect from this session?", input: "textarea", required: true },
  ],
  trekking: [
    { key: "name", label: "Full name", input: "text", required: true },
    { key: "email", label: "Email address", input: "email", required: true },
    { key: "phone", label: "Phone number", input: "tel", required: true },
    { key: "age", label: "Age", input: "number", required: true },
    { key: "previousExperience", label: "Previous trekking experience, if any", input: "textarea" },
    { key: "address", label: "Address", input: "textarea", required: true },
    { key: "trekInterested", label: "Which trek are you interested in?", input: "text", required: true },
    { key: "whyJoin", label: "Why do you want to join?", input: "textarea", required: true },
    { key: "leaveBehind", label: "One thing you want to leave behind", input: "text", required: true },
    { key: "gainFromExpedition", label: "One thing you want to gain from this expedition", input: "text", required: true },
  ],
  corporate: [
    { key: "companyName", label: "Company name", input: "text", required: true },
    { key: "contactPerson", label: "Contact person name", input: "text", required: true },
    { key: "email", label: "Email address", input: "email", required: true },
    { key: "phone", label: "Phone number", input: "tel", required: true },
    { key: "eventDetails", label: "An overview of the event", input: "textarea", required: true },
  ],
};

export const enquiryTypeLabels: Record<EnquiryType, string> = {
  mentoring: "One-to-One Mentoring",
  trekking: "LeaderShip Outdoor Expeditions",
  corporate: "Corporate Events",
};

export const enquiryStatuses = ["NEW", "CONTACTED", "SELECTED", "REJECTED", "COMPLETED"] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];
