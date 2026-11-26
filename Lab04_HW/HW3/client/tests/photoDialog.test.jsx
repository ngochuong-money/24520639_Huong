import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoDialog from '../src/components/PhotoDialog.jsx';
import { findPhoto } from '../src/data/photos.js';

const ARENA = findPhoto('arena-stage');
const BOOTH = findPhoto('player-booth');
const getDialog = () => document.querySelector('dialog');

describe('PhotoDialog', () => {
  test('without a photo: dialog is rendered but closed and empty', () => {
    render(<PhotoDialog photo={undefined} onClose={() => {}} />);
    expect(getDialog()).toBeInTheDocument();
    expect(getDialog()).not.toHaveAttribute('open');
    expect(getDialog().querySelector('h2')).toBeNull();
  });

  test('with a photo: opens modally and shows title, image and caption', () => {
    render(<PhotoDialog photo={ARENA} onClose={() => {}} />);
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleName('Arena Stage');

    const img = screen.getByAltText(ARENA.alt);
    expect(img).toHaveAttribute('width', String(ARENA.width));
    expect(img).toHaveAttribute('height', String(ARENA.height));
    expect(dialog.querySelector('figcaption')).toHaveTextContent(ARENA.credit);
  });

  test('aria-labelledby points to the h2; close button is type="button"', () => {
    render(<PhotoDialog photo={ARENA} onClose={() => {}} />);
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('aria-labelledby', dialog.querySelector('h2').id);
    expect(screen.getByRole('button', { name: 'Close photo', hidden: true })).toHaveAttribute('type', 'button');
  });

  test('close button closes the native dialog and fires onClose once', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PhotoDialog photo={ARENA} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close photo', hidden: true }));

    expect(getDialog()).not.toHaveAttribute('open');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('photo → undefined closes the dialog (URL lost photoId)', () => {
    const onClose = vi.fn();
    const { rerender } = render(<PhotoDialog photo={ARENA} onClose={onClose} />);
    rerender(<PhotoDialog photo={undefined} onClose={onClose} />);

    expect(getDialog()).not.toHaveAttribute('open');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('re-rendering while open never calls showModal twice (guard)', () => {
    const { rerender } = render(<PhotoDialog photo={ARENA} onClose={() => {}} />);
    expect(() => {
      rerender(<PhotoDialog photo={ARENA} onClose={() => {}} />);
      rerender(<PhotoDialog photo={BOOTH} onClose={() => {}} />);
    }).not.toThrow();
    expect(getDialog()).toHaveAccessibleName('Player Booth');
  });
});
