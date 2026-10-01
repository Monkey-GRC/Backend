export type PageRequest = {
    page: number;
    pageSize: number;
};
export type Page<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};
export declare const toPageResponse: <T, R>(page: Page<T>, map: (item: T) => R) => {
    items: R[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
};
