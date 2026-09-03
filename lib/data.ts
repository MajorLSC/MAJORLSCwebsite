export type ServiceId =  "mentoring" | "corporate" | "trekking";
// Add "mentoring" when payment gateways are integrated and we can accept payments for one-to-one sessions

export interface Service {
  id: ServiceId;
  tag: string;
  title: string;
  summary: string;
  description: string;
  points: string[];
  comingSoon?: boolean;
}

export const services: Service[] = [
 {
    id: "mentoring",
    tag: "One-to-One",
    title: "Personal Mentoring",
    summary:
      "Direct, one-on-one sessions with Major LS Chaudhary for people who want to lead their own life with more discipline and clarity.",
    description:
      "Every session is built around the person in front of him — a founder weighing a hard call, a young officer candidate, a professional rebuilding focus after a setback. Drawing on decades of field leadership, Major Chaudhary works through real decisions, not theory.",
    points: [
      "60-minute focused sessions, in person or on video",
      "Goal-setting rooted in real deadlines, not generic advice",
      "Follow-up notes after every conversation",
    ],
    comingSoon: true
  },
  {
    id: "corporate",
    tag: "For Teams",
    title: "Corporate Events",
    summary:
      "Leadership workshops and offsites that put teams under light pressure — the same way real leaders are made.",
    description:
      "For organisations who want their managers to lead like they mean it. Sessions combine military leadership principles with practical exercises: decision-making under time pressure, accountability, and communicating under stress.",
    points: [
      "Half-day and full-day formats, on-site or off-site",
      "Built around your team's actual working challenges",
      "Optional outdoor/field component for deeper impact",
    ],
  },
  {
    id: "trekking",
    tag: "In the Field",
    title: "Leadership Outdoor Expeditions",
    summary:
      "Guided leadership outdoor expeditions led personally by Major Chaudhary — where character shows up faster than in any boardroom.",
    description:
      "Terrain doesn't negotiate. These expeditions are for people who want to test themselves honestly, learn to read a mountain, and come back with a clearer head. Every route is planned and led with the same discipline used in military operations.",
    points: [
      "Small groups, personally led — no large tour-group chaos",
      "Routes matched to fitness level and experience",
      "Full safety planning and briefing before every departure",
    ],
  }
];

export interface GalleryItem {
  id: string;
  caption: string;
  // Add a path under /public/gallery/ once real photos are uploaded,
  // e.g. "/gallery/trek-2025-01.jpg". Left undefined = placeholder tile.
  src?: string;
}

// Placeholder entries — replace with real photos once uploaded.
// Each tile renders a textured placeholder until an image src is added.
export const galleryPlaceholders: GalleryItem[] = [
  { id: "g1", caption: "Corporate leadership workshop, 2025" ,src:"/media/corporate_event.jpeg"},
  { id: "g2", caption: "Leadership Outdoor expedition" , src:"/media/leadership_expedtion.jpg"},
  { id: "g3", caption: "One-to-one mentoring session" ,src:"/media/mentoring_session.png"},
  { id: "g4", caption: "Field leadership training day" },
  { id: "g5", caption: "Base camp briefing" },
  { id: "g6", caption: "Corporate offsite, outdoor module" },
];
