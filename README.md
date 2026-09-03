# LSCVentures — Website + Admin Portal (zero-cost stack)

Public site (landing, services, about, media, contact) plus an admin portal
for managing enquiries, sending formatted emails, and a live photo gallery —
all built to run for free using your Google Workspace account.

**How data flows:** enquiry submitted → written straight to the matching
Google Sheet (Mentoring / Trekking / Corporate — one sheet per type) →
admin portal reads/writes that same sheet → email sent via your Workspace
Gmail account → sent-email record appended to that sheet's `EmailLog` tab.
There's no database to pay for or maintain.

## 1. Run it locally

```bash
npm install
npm run dev
```

Nothing works yet without the setup below (Sheets/Drive/email need
credentials) — but the public pages render fine without any of it, showing
placeholder gallery photos until Drive is connected.

## 2. One-time Google Cloud setup (free)

1. Go to https://console.cloud.google.com, create a project (e.g. "LSCVentures").
2. **APIs & Services → Library** — enable **Google Sheets API** and **Google Drive API**.
3. **APIs & Services → Credentials → Create Credentials → Service Account.**
   Give it any name (e.g. `lscventures-app`). No roles needed.
4. Open the service account → **Keys → Add Key → Create new key → JSON**.
   A JSON file downloads — open it, you need two values from it:
   - `client_email` → this is `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → this is `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep the
     `\n` characters exactly as they appear in the file, in quotes)
5. **Keep this JSON file private. Never commit it to Git.**

## 3. Create the 3 Google Sheets

Create three separate Google Sheets in your Workspace account:
`LSCVentures — Mentoring Enquiries`, `... Trekking Enquiries`, `... Corporate Enquiries`.

For **each** sheet:

1. Rename the first tab to exactly `Enquiries`, add a second tab named
   exactly `EmailLog`.
2. In `Enquiries!A1`, paste this header row (one sheet's worth — see below
   for each type's exact columns).
3. Click **Share** → paste the service account's `client_email` → give it
   **Editor** access.
4. Copy the sheet's ID from its URL (`.../d/THIS_PART/edit`) into the
   matching env var.

**Mentoring** — `Enquiries` header row:
```
ID  Name  Email  Phone  Topic  Expectations  Status  CreatedAt  UpdatedAt  UpdatedBy
```

**Trekking** — `Enquiries` header row:
```
ID  Name  Email  Phone  Age  PreviousExperience  Address  TrekInterested  WhyJoin  LeaveBehind  GainFromExpedition  Status  CreatedAt  UpdatedAt  UpdatedBy
```
> Note: the brief for trekking didn't originally list email/phone, but
> they're included here — without them there's no way to email the visitor
> back. Everything else matches exactly what was asked for.

**Corporate** — `Enquiries` header row:
```
ID  CompanyName  ContactPerson  Email  Phone  ParticipantsCount  EventDetails  Status  CreatedAt  UpdatedAt  UpdatedBy
```

**`EmailLog`** header row (same for all three sheets):
```
EnquiryId  Recipient  Subject  Status  SentAt  SentBy
```

## 4. Uploading media (the gallery)

1. In Google Drive (your Workspace account), create a folder, e.g.
   "LSCVentures Website Photos".
2. Share it with the service account's `client_email` (Viewer is enough).
3. Copy the folder's ID from its URL into `GOOGLE_DRIVE_GALLERY_FOLDER_ID`.
4. **That's it.** From now on, whenever you want to add a photo to the
   website, just upload it into that Drive folder — from your phone, the
   Drive app, or drive.google.com. It appears on `/media` automatically,
   no code change or redeploy needed.

## 5. Email sending (Google Workspace, free)

1. In your Google Workspace account, turn on 2-Step Verification
   (Google Account → Security).
2. Create an **App Password** (Google Account → Security → App passwords).
   Name it "LSCVentures Website".
3. Set `SMTP_USER` to your full Workspace email address, and
   `SMTP_APP_PASSWORD` to the generated app password (not your normal
   login password).

## 6. Admin login

1. Pick an admin email and set it as `ADMIN_EMAIL`.
2. Generate a password hash:
   ```bash
   node scripts/hash-password.js "your-chosen-password"
   ```
3. Paste the output into `ADMIN_PASSWORD_HASH`.
4. Set `JWT_SECRET` to any long random string, e.g.:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. Log in at `/admin/login` with `ADMIN_EMAIL` and the plain-text password
   you hashed in step 2 (the hash is only ever compared against, never
   typed in).

Copy `.env.example` to `.env.local` and fill in everything above.

## 7. What the admin portal does

- `/admin` — dashboard with counts per enquiry type
- `/admin/enquiries` — every enquiry from all 3 sheets, filterable by type
  and status, searchable
- `/admin/enquiries/[type]/[id]` — full detail view, a status dropdown
  (New / Contacted / Selected / Rejected / Completed), and an email
  composer with **bold, italic, and bullet-list formatting** — the exact
  formatting you apply is exactly what the visitor receives, since the
  editor's HTML is sent as the email body directly.

## 8. Zero-cost hosting

Deploys free on **Vercel's free tier**:
1. Push this repo to GitHub.
2. vercel.com → Import Project → pick the repo.
3. In Vercel's dashboard, add every variable from `.env.example` under
   **Settings → Environment Variables**.
4. Deploy.

Google Sheets/Drive/Gmail API usage at this scale is well within Google's
free quotas.

## Project structure

```
app/
  layout.tsx                Root layout (fonts only)
  globals.css                Design tokens + all styling

  (site)/                    Public site — route group adds Header/Footer
    layout.tsx
    page.tsx                  Landing page
    about/page.tsx
    services/page.tsx
    media/page.tsx             Reads live photos from Google Drive
    contact/page.tsx           Type-switching enquiry form

  admin/
    login/page.tsx
    (dashboard)/               Route group — adds the admin sidebar shell
      layout.tsx
      page.tsx                  Dashboard
      enquiries/page.tsx         List + filters + search
      enquiries/[type]/[id]/page.tsx   Detail + status + email composer

  api/
    enquiries/route.ts                  POST — public, writes to Sheets
    admin/login/route.ts                 POST
    admin/logout/route.ts                POST
    admin/enquiries/route.ts             GET — list from Sheets
    admin/enquiries/status/route.ts      PATCH — update status
    admin/send-email/route.ts            POST — send + log email

components/
  Header.tsx, Footer.tsx, Logo.tsx, ContourLines.tsx
  ServiceCard.tsx, GalleryGrid.tsx, EnquiryForm.tsx
  admin/AdminSidebar.tsx, RichTextEditor.tsx, StatusBadge.tsx

lib/
  data.ts              Service copy + gallery placeholder fallback
  enquiryFields.ts      Per-type field schema (shared by form + admin)
  session.ts            Edge-safe JWT session (used by middleware)
  auth.ts               bcrypt password check (Node-only, API routes)
  adminGuard.ts          API-route session check
  googleClients.ts       Authenticated Sheets/Drive clients
  sheetsService.ts        Append/list/update enquiries + email log
  googleDrive.ts           List gallery images from a Drive folder
  mailer.ts                Send + sanitize formatted email

middleware.ts            Redirects unauthenticated /admin/* to /admin/login
scripts/hash-password.js  Helper to generate ADMIN_PASSWORD_HASH
```

## What's next (not built yet)

The `/mentoring` booking calendar with real-time slot availability and
concurrency-safe booking (from the original spec) is a separate, larger
piece that needs a real database (Postgres) for correctness — Sheets isn't
safe for that concurrency guarantee. That's the natural next phase once
you're ready for it.
