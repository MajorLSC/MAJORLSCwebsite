import type { Metadata } from "next";
import type { MediaCategory } from "@/lib/googleDrive";
import { listDriveImages } from "@/lib/googleDrive";
import MediaStorySection from "@/components/MediaStorySection";

export const metadata: Metadata = {
  title: "Media — LSCVentures",
  description:
    "Stories and experiences from LSCVentures across leadership, outdoor expeditions, public speaking, corporate events and military leadership.",
};

export const dynamic = "force-dynamic";

const categories: MediaCategory[] = [
  "Leadership & Outdoor Expeditions",
  "Public Speaking",
  "Corporate Events",
  "Military",
];

export default async function MediaPage() {
  let driveImages: Awaited<
    ReturnType<typeof listDriveImages>
  > = [];

  let driveError = false;

  try {
    driveImages = await listDriveImages();
  } catch (err) {
    console.error(
      "Could not load media from Google Drive:",
      err
    );

    driveError = true;
  }

  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="page-intro__rank">Media</span>

          <h1>
            From mentoring rooms to mountain trails
          </h1>

          <p>
            A visual record of the experiences, people,
            conversations and engagements that shape
            LSCVentures.
          </p>
        </div>
      </section>

      <main className="section media-page">
        <div className="wrap">
          {categories.map((category) => {
            const stories = driveImages.filter(
              (image) => image.category === category
            );

            return (
              <MediaStorySection
                key={category}
                category={category}
                stories={stories}
              />
            );
          })}

          {driveImages.length === 0 && !driveError && (
            <div className="media-empty">
              <p>
                Media stories will appear here as photos are
                added to the Google Drive media folders.
              </p>
            </div>
          )}

          {driveError && (
            <div className="media-empty">
              <p>
                We couldn't load the media archive right now.
                Please try again shortly.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}