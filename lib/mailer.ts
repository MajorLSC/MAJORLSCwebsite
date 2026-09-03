import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER or SMTP_APP_PASSWORD env vars.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

// Allow the formatting the rich text editor produces (bold/italic/lists/links/paragraphs)
// and strip anything else out before it ever reaches an email.
function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "b", "strong", "i", "em", "ul", "ol", "li", "a", "u"],
    allowedAttributes: { a: ["href", "target", "rel"] },
  });
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transporter = getTransporter();
  const safeHtml = cleanHtml(html);

  await transporter.sendMail({
    from: `LSCVentures <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: safeHtml,
  });

  return safeHtml;
}
