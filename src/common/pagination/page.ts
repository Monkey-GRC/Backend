// Colección paginada (contracts/conventions.md): page arranca en 1, page_size máx. 100.
export type PageRequest = { page: number; pageSize: number };

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export const toPageResponse = <T, R>(page: Page<T>, map: (item: T) => R) => ({
  items: page.items.map(map),
  page: page.page,
  page_size: page.pageSize,
  total: page.total,
  total_pages: Math.ceil(page.total / page.pageSize),
});
