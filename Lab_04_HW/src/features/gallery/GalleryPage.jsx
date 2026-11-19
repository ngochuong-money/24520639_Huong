import { useId } from 'react'

export default function GalleryPage() {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h1 id={headingId}>Gallery</h1>
    </section>
  )
}
