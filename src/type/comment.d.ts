export interface comment {
    id: number;
    source:number;
    type:string;
    parentCommentId:number;
    userId:number;
    username:string
    avatar:string;
    floorCommentId:number;
    parentUserId:number;
    parentUsername:string;
    likeCount:number;
    commentContent:string;
    commentInfo: string | null;
    createTime:string;
    childComments: childComments;
}


interface childComments {
    totalRow: number;
    totalPage?: number;
    pageNumber: number;
    pageSize?: number;
    records: comment[];
}
