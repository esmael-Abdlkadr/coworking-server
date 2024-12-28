export const getPagination = (page, limit) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};
