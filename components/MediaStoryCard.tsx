import Image from "next/image";
import type { DriveImage } from "@/lib/googleDrive";

interface MediaStoryCardProps {
  story: DriveImage;
  reverse?: boolean;
}

export default function MediaStoryCard({
  story,
  reverse = false,
}: MediaStoryCardProps) {
  return (
    <article
      className={`media-story ${
        reverse ? "media-story--reverse" : ""
      }`}
    >
      <div className="media-story__image">
        <Image
          src={story.url}
          alt={story.name}
          fill
          sizes="(max-width: 820px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="media-story__content">
        {story.date && (
          <div className="media-story__meta">
            <span>{story.date}</span>
          </div>
        )}

        <h3>{story.name}</h3>

        {story.story && (
          <p>{story.story}</p>
        )}
      </div>
    </article>
  );
}