// 分页数据结构
export interface page {
    // 当前页数
    pageNumber: number;
    // 页面大小(数据条数)
    pageSize: number;
    // 总共数据条数
    total?: number;
}
