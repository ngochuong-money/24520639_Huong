import './PhotoGrid.css'

export default function PhotoGrid({ photos = [], onOpen }) {
  return (
    <ul className="photo-grid">
      {photos.map((photo) => (
        <li key={photo.id} className="photo-tile">
          <figure className="photo-tile-figure">
            <button
              type="button"
              className="photo-tile-button"
              aria-haspopup="dialog"
              onClick={() => onOpen(photo.id)}
            >
              <span className="photo-tile-media">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </button>
            <figcaption className="photo-tile-caption">{photo.title}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
