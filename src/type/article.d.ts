import {sort} from "./sort";
import {label} from "./label";

export interface article {
    id              ?: number;
    userId          ?: number;
    articleTitle    : string;
    articleCover    : string;
    articleContent  : string;
    viewCount       ?: number;
    likeCount       ?: number;
    commentStatus   : boolean;
    commentCount    ?: number;
    recommendStatus : boolean;
    password       ?: string
    viewStatus      : boolean;
    createTime      ?: string;
    updateTime      ?: string;
    updateBy        ?: string;
    sortId          : number | null;
    labelId         : number | null;
    username        ?: string;
    sort            ?: sort;
    label           ?: label;
}
