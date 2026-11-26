import { useEffect, useId, useRef } from 'react';

export default function PhotoDialog({ photo, onClose }) {
  const dialogRef = useRef(null);
  const headingId = useId();

  // Legitimate effect: syncs React state (from the URL) with the imperative DOM <dialog> API
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (photo && !dialog.open) dialog.showModal(); // guard: showModal() throws when already open
    if (!photo && dialog.open) dialog.close(); // guard: no spurious close event
  }, [photo]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={photo ? headingId : undefined}
      onClose={onClose}
      className="photo-dialog"
    >
      {photo && (
        <>
          <header className="photo-dialog__header">
            <h2 id={headingId}>{photo.title}</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="photo-dialog__close">
              Close photo
            </button>
          </header>
          <figure className="photo-dialog__figure">
            <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} decoding="async" />
            <figcaption>{photo.credit}</figcaption>
          </figure>
        </>
      )}
    </dialog>
  );
}
