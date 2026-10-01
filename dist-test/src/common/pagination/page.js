"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPageResponse = void 0;
const toPageResponse = (page, map) => ({
    items: page.items.map(map),
    page: page.page,
    page_size: page.pageSize,
    total: page.total,
    total_pages: Math.ceil(page.total / page.pageSize),
});
exports.toPageResponse = toPageResponse;
//# sourceMappingURL=page.js.map