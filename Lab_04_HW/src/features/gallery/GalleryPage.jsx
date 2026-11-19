import { useId } from 'react'
import { useSearchParams } from 'react-router'
import { isValidCategory, isValidId } from '../../../shared/validation.js'
import CategoryFilter from './CategoryFilter.jsx'
import Lightbox from './Lightbox.jsx'
import PhotoGrid from './PhotoGrid.jsx'
import { useGalleryParams } from './useGalleryParams.js'
import { usePhotos } from './usePhotos.js'
import Skeleton from '../../components/Skeleton.jsx'

export default function GalleryPage() {
  const headingId = useId()
  const { photos, status } = usePhotos()
  const { category, photoId, setCategory, openPhoto, closePhoto, replacePhoto } = useGalleryParams()
  const [searchParams] = useSearchParams()
  const rawCategory = searchParams.get('category')
  const rawPhoto = searchParams.get('photo')

  // Everything below is derived during render. Nothing is copied into state.
  const categories = [...new Set(photos.map((photo) => photo.category))].sort()
  const categoryKnown =
    (rawCategory === null || isValidCategory(rawCategory)) &&
    (category === 'all' || categories.includes(category))
  const effectiveCategory = categoryKnown ? category : 'all'
  const visiblePhotos =
    effectiveCategory === 'all' ? photos : photos.filter((photo) => photo.category === effectiveCategory)

  const activeIndex = photoId ? visiblePhotos.findIndex((photo) => photo.id === photoId) : -1
  const photoKnown =
    (rawPhoto === null || isValidId(rawPhoto)) && (photoId === null || activeIndex !== -1)
  const activePhoto = photoKnown && activeIndex !== -1 ? visiblePhotos[activeIndex] : null

  const hasPrev = activeIndex > 0
  const hasNext = activeIndex !== -1 && activeIndex < visiblePhotos.length - 1

  // Messages describe the URL; they never write it back.
  let statusMessage = ''
  if (!categoryKnown) {
    statusMessage = 'Unknown category, showing all photos.'
  } else if (!photoKnown) {
    statusMessage = 'Photo not found.'
  }

  if (status === 'loading') {
    return <Skeleton variant="gallery" />
  }

  if (status === 'error') {
    return (
      <section className="page" aria-labelledby={headingId}>
        <h1 id={headingId} className="page-title">Gallery</h1>
        <p role="alert" className="page-line">Could not load photos. Please refresh the page.</p>
      </section>
    )
  }

  return (
    <section className="page" aria-labelledby={headingId}>
      <h1 id={headingId} className="page-title">Gallery</h1>
      <CategoryFilter categories={categories} activeCategory={effectiveCategory} onSelect={setCategory} />
      {/* Always rendered, even when empty, so the layout does not shift (CLS = 0). */}
      <p role="status" className="page-line">{statusMessage}</p>
      <PhotoGrid photos={visiblePhotos} onOpen={openPhoto} />
      <Lightbox
        photo={activePhoto}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onClose={closePhoto}
        onPrev={() => replacePhoto(visiblePhotos[activeIndex - 1].id)}
        onNext={() => replacePhoto(visiblePhotos[activeIndex + 1].id)}
      />
    </section>
  )
}
