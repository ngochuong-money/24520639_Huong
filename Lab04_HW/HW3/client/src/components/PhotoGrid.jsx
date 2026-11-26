import { Link } from 'react-router';

export default function PhotoGrid({ photos = [], searchFor = (id) => `?photoId=${id}` }) {
  return (
    <ul className="photo-grid">
      {photos.map((photo) => (
        <li key={photo.id}>
          <Link id={`thumb-${photo.id}`} to={{ search: searchFor(photo.id) }} className="photo-card">
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className="photo-thumb"
            />
            <span className="photo-title">{photo.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
