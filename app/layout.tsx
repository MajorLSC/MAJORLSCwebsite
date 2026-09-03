import type { Metadata } from "next";
import { Big_Shoulders_Display, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const shoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-shoulders",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LSCVentures — Major LS Chaudhary",
  description:
    "One-to-one mentoring, corporate leadership events, and guided treks & expeditions with Major LS Chaudhary.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shoulders.variable} ${plex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
