describe('<dialog> polyfill (test environment only)', () => {
  const makeDialog = () => document.body.appendChild(document.createElement('dialog'));

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('showModal opens the dialog and rejects a second call', () => {
    const dialog = makeDialog();
    dialog.showModal();
    expect(dialog.open).toBe(true);
    expect(dialog).toHaveAttribute('open');
    expect(() => dialog.showModal()).toThrow(/already open/);
  });

  test('close clears open and dispatches a close event once', () => {
    const dialog = makeDialog();
    const onClose = vi.fn();
    dialog.addEventListener('close', onClose);

    dialog.showModal();
    dialog.close('done');

    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe('done');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('close on an already closed dialog does nothing', () => {
    const dialog = makeDialog();
    const onClose = vi.fn();
    dialog.addEventListener('close', onClose);

    dialog.close();

    expect(onClose).not.toHaveBeenCalled();
  });
});
