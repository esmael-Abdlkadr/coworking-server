const allowedSortFields = ["createdAt", "bookingDate", "price"];
const allowedSortDirections = ["asc", "desc"];
export const getSortQuery = (sortField, sortDirection) => {
  if (
    !allowedSortFields.includes(sortField) ||
    !allowedSortDirections.includes(sortDirection)
  ) {
    throw new Error("Invalid sort field or direction");
  }
  return { [sortField]: sortDirection === "asc" ? 1 : -1 };
};

const sortUtil = (sortField = "createdAt", sortDirection = "desc") => {
  const sortOptions = {};
  sortOptions[sortField] = sortDirection === "asc" ? 1 : -1;
  return sortOptions;
};

export default sortUtil;
