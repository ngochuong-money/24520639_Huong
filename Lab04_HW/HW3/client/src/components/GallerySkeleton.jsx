import { photos } from '../data/photos.js';

export default function GallerySkeleton() {
  return (
    <main className="page" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading gallery…</span>

      {/* Same box as the real <h1>, hidden from assistive tech */}
      <h1 className="sk-text" aria-hidden="true">Photo Gallery</h1>

      <ul className="photo-grid" aria-hidden="true">
        {photos.map((photo) => (
          <li key={photo.id}>
            <span className="photo-card">
              <span className="photo-thumb sk-block" />
              <span className="photo-title sk-text">{photo.title}</span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
