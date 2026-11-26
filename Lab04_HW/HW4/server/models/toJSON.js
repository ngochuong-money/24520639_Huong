// Hide Mongo internals on documents (create responses). .lean() reads must use .select('-_id -__v').
export const toJSONOptions = {
  versionKey: false,
  transform: (doc, { _id, ...publicFields }) => publicFields,
};
