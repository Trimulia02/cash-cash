// Pagination helper
const getPaginationInfo = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    offset,
  };
};

// Calculate total pages
const calculatePages = (total, limit) => {
  return Math.ceil(total / limit);
};

// Build pagination response
const buildPaginationResponse = (data, total, page, limit) => {
  const pages = calculatePages(total, limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  getPaginationInfo,
  calculatePages,
  buildPaginationResponse,
};
