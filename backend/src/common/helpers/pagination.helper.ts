interface PaginateOptions {
  page: number;
  limit: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationMeta(
  total: number,
  options: PaginateOptions,
): PaginationMeta {
  return {
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit),
  };
}

export function getPrismaSkipTake(options: PaginateOptions): {
  skip: number;
  take: number;
} {
  return {
    skip: (options.page - 1) * options.limit,
    take: options.limit,
  };
}
