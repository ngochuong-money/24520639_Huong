import { Link, useSearchParams } from 'react-router';
import { photos, findPhoto } from '../data/photos.js';
import PhotoGrid from './PhotoGrid.jsx';
import PhotoDialog from './PhotoDialog.jsx';

export default function PhotoGalleryLayout() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived from the URL — the URL is the single source of truth for the modal
  const photoId = searchParams.get('photoId');
  const selectedPhoto = photoId ? findPhoto(photoId) : undefined;
  const isUnknown = photoId !== null && !selectedPhoto;

  const searchFor = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('photoId', id);
    return `?${next}`;
  };

  const searchWithoutPhoto = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('photoId');
    const query = next.toString();
    return query ? `?${query}` : '';
  };

  // Single close path: button, Esc and Back all end up here via the native `close` event
  const handleClose = () => {
    const closingId = photoId;

    if (searchParams.has('photoId')) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('photoId');
          return next;
        },
        { replace: true },
      );
    }

    if (closingId) document.getElementById(`thumb-${closingId}`)?.focus();
  };

  return (
    <main className="page">
      <h1>Photo Gallery</h1>

      {isUnknown && (
        <p role="status" className="gallery-notice">
          Photo not found.{' '}
          <Link to={{ pathname: '/gallery', search: searchWithoutPhoto() }}>Show all photos</Link>
        </p>
      )}

      <PhotoGrid photos={photos} searchFor={searchFor} />
      <PhotoDialog photo={selectedPhoto} onClose={handleClose} />
    </main>
  );
}
