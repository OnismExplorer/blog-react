export interface weiYan {
    id: number | null;
    userId?: number;
    likeCount?: number;
    content: string;
    type?: string;
    source: string | null;
    isPublic?: boolean;
    createTime: string;
}
