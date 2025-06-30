export interface  BaseRequestVO<T = unknown> {
    records: T[];
    pageNumber: number;
    pageSize: number;
    totalPage: number;
    totalRow: number;
    order:string;
    desc:boolean;
    source:number;
    commentType:string;
    floorCommentId:number;
    searchKey:string
    articleSearch:string;
    recommendStatus:boolean;
    sortId:number;
    labelId:number;
    userStatus:boolean;
    userType:number;
    userId:number;
    username:string;
    resourceType:string;
    status:boolean;
    classify:string;
}
