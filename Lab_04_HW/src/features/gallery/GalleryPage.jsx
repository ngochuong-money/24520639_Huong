import { useId } from 'react'

export default function GalleryPage() {
  const headingId = useId()

  return (
    <section className="page" aria-labelledby={headingId}>
      <h1 id={headingId} className="page-title">
        Gallery
      </h1>
    </section>
  )
}
