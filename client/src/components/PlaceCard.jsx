import { Link } from 'react-router-dom';
import { MapPin, Image, Video } from 'lucide-react';
import { useState } from 'react';

export default function PlaceCard({ place }) {
  const [imageError, setImageError] = useState(false);

  const location = [place.area, place.district, place.state]
    .filter(Boolean)
    .join(', ');

  const hasValidImage = place.coverImage && !imageError;

  return (
    <Link
      to={`/places/${place.slug}`}
      className="card group overflow-hidden"
    >
      <div className="relative h-44 w-full overflow-hidden bg-terracotta-100 dark:bg-terracotta-900/30">
        {hasValidImage ? (
          <img
            src={place.coverImage}
            alt={place.name || 'Place'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => {
              console.error(
                'Cover image failed to load:',
                place.coverImage
              );
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-terracotta-300">
            <MapPin className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">
          {place.name}
        </h3>

        {location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-950/50 dark:text-terracotta-50/50">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </p>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-ink-950/60 dark:text-terracotta-50/60">
          <span className="flex items-center gap-1">
            <Image className="h-3.5 w-3.5" />
            {place.photoCount || 0}
          </span>

          <span className="flex items-center gap-1">
            <Video className="h-3.5 w-3.5" />
            {place.videoCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}