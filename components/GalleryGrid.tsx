import Image from "next/image";
import type { GalleryItem } from "@/lib/data";

function Pattern({ seed }: { seed: number }) {
  const offset = (seed * 37) % 60;

  return (
    <svg
      className="gallery-tile__pattern"
      viewBox="0 0 100 75"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`p-${seed}`}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${offset})`}
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="14"
            stroke="#EFEAE0"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="100" height="75" fill={`url(#p-${seed})`} />
    </svg>
  );
}

export default function GalleryGrid({
  items,
}: {
  items: GalleryItem[];
}) {
  return (
    <div className="gallery-grid">
      {items.map((item, i) => (
        <figure className="gallery-tile" key={item.id}>
          <div className="gallery-tile__media">
            {item.src ? (
              <Image
                src={item.src}
                alt={item.caption}
                fill
                sizes="(max-width: 820px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Pattern seed={i + 1} />
            )}

            <div className="gallery-tile__overlay" />
          </div>

          <figcaption className="gallery-tile__caption">
            {item.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}