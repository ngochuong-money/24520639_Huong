import { Link, useSearchParams } from 'react-router';
import { photos, findPhoto } from '../data/photos.js';
import { PHOTO_PARAM, withPhoto, withoutPhoto, toSearch } from '../utils/photoSearch.js';
import PhotoGrid from './PhotoGrid.jsx';
import PhotoDialog from './PhotoDialog.jsx';

export default function PhotoGalleryLayout() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived from the URL — the URL is the single source of truth for the modal
  const photoId = searchParams.get(PHOTO_PARAM);
  const selectedPhoto = photoId ? findPhoto(photoId) : undefined;
  const isUnknown = photoId !== null && !selectedPhoto;

  const searchFor = (id) => toSearch(withPhoto(searchParams, id));

  // Single close path: button, Esc and Back all end up here via the native `close` event
  const handleClose = () => {
    const closingId = photoId;
    if (searchParams.has(PHOTO_PARAM)) {
      setSearchParams((prev) => withoutPhoto(prev), { replace: true });
    }
    if (closingId) document.getElementById(`thumb-${closingId}`)?.focus();
  };

  return (
    <main className="page">
      <h1>Photo Gallery</h1>

      {isUnknown && (
        <p role="status" className="gallery-notice">
          Photo not found.{' '}
          <Link to={{ pathname: '/gallery', search: toSearch(withoutPhoto(searchParams)) }}>Show all photos</Link>
        </p>
      )}

      <PhotoGrid photos={photos} searchFor={searchFor} />
      <PhotoDialog photo={selectedPhoto} onClose={handleClose} />
    </main>
  );
}
