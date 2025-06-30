export interface resourcePath {
    id?: number;
    title: string;
    classify: string // 分类
    cover: string;
    url: string;
    type: string | null;
    remark: string; // 备注
    status: boolean | null; // 状态
    introduction: string;
    createTime?: string;
}
