import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PhotoGrid from '../src/components/PhotoGrid.jsx';
import { photos } from '../src/data/photos.js';

const searchFor = (id) => `?album=x&photoId=${id}`;

const renderGrid = (props = {}) =>
  render(
    <MemoryRouter initialEntries={['/gallery']}>
      <PhotoGrid photos={photos} searchFor={searchFor} {...props} />
    </MemoryRouter>,
  );

describe('PhotoGrid', () => {
  test('renders a native list with one item per photo', () => {
    renderGrid();
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(photos.length);
  });

  test('each item is a link with a stable id and the search built by searchFor', () => {
    renderGrid();
    photos.forEach((photo) => {
      const link = document.getElementById(`thumb-${photo.id}`);
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', `/gallery?album=x&photoId=${photo.id}`);
      expect(link).toHaveTextContent(photo.title);
    });
  });

  test('images carry alt, intrinsic size and lazy loading', () => {
    renderGrid();
    photos.forEach((photo) => {
      const img = screen.getByAltText(photo.alt);
      expect(img).toHaveAttribute('src', photo.src);
      expect(img).toHaveAttribute('width', String(photo.width));
      expect(img).toHaveAttribute('height', String(photo.height));
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  test('link accessible name includes the photo title', () => {
    renderGrid();
    expect(screen.getByRole('link', { name: /Arena Stage/ })).toBeInTheDocument();
  });

  test('renders nothing inside the list when there are no photos', () => {
    renderGrid({ photos: [] });
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
