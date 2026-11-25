// Hide Mongo internals in every JSON response
export const toJSONOptions = {
  versionKey: false,
  transform: (doc, { _id, ...publicFields }) => publicFields,
};
