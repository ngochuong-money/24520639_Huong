export const PHOTO_PARAM = 'photoId';

/** New params with photoId set — other params preserved. Never mutates the input. */
export function withPhoto(params, id) {
  const next = new URLSearchParams(params);
  next.set(PHOTO_PARAM, id);
  return next;
}

/** New params without photoId — other params preserved. Never mutates the input. */
export function withoutPhoto(params) {
  const next = new URLSearchParams(params);
  next.delete(PHOTO_PARAM);
  return next;
}

/** '?a=1' or '' — ready for <Link to={{ search }}> */
export const toSearch = (params) => {
  const query = params.toString();
  return query ? `?${query}` : '';
};
