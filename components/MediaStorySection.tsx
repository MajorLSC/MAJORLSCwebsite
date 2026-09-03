import type {
  DriveImage,
  MediaCategory,
} from "@/lib/googleDrive";
import MediaStoryCard from "./MediaStoryCard";

const sectionNumbers: Record<MediaCategory, string> = {
  "Leadership & Outdoor Expeditions": "01",
  "Public Speaking": "02",
  "Corporate Events": "03",
  Military: "04",
};

interface MediaStorySectionProps {
  category: MediaCategory;
  stories: DriveImage[];
}

export default function MediaStorySection({
  category,
  stories,
}: MediaStorySectionProps) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="media-section">
      <div className="media-section__heading">
        <span className="media-section__number">
          {sectionNumbers[category]}
        </span>

        <h2>{category}</h2>
      </div>

      <div className="media-section__stories">
        {stories.map((story, index) => (
          <MediaStoryCard
            key={story.id}
            story={story}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}