import { useEffect, useId, useRef } from 'react'
import './Lightbox.css'

export default function Lightbox({
  photo = null,
  hasPrev = false,
  hasNext = false,
  onClose,
  onPrev,
  onNext,
}) {
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const titleId = useId()

  // Open or close the native dialog to match the photo prop.
  // Only opens from the closed state, so switching photos while open does not reset the opener.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    if (photo && !dialog.open) {
      openerRef.current = document.activeElement
      dialog.showModal()
    } else if (!photo && dialog.open) {
      dialog.close()
    }
  }, [photo])

  // Every close (Esc, button, backdrop, or a prop change) ends in the native close event.
  // onClose is idempotent upstream (closePhoto), so a prop-driven close is harmless.
  function handleClose() {
    const opener = openerRef.current
    openerRef.current = null
    onClose?.()
    if (opener?.isConnected) {
      opener.focus()
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      dialogRef.current.close()
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft' && hasPrev) {
      event.preventDefault()
      onPrev?.()
    } else if (event.key === 'ArrowRight' && hasNext) {
      event.preventDefault()
      onNext?.()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {photo && (
        <figure className="lightbox-figure">
          <img
            key={photo.id}
            className="lightbox-image"
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            decoding="async"
          />
          <figcaption id={titleId} className="lightbox-caption">
            {photo.title}
          </figcaption>
          <footer className="lightbox-controls">
            <button type="button" onClick={() => onPrev?.()} disabled={!hasPrev}>
              Previous
            </button>
            <button type="button" onClick={() => dialogRef.current.close()}>
              Close
            </button>
            <button type="button" onClick={() => onNext?.()} disabled={!hasNext}>
              Next
            </button>
          </footer>
        </figure>
      )}
    </dialog>
  )
}
