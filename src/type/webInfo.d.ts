interface webInfo {
    id:number | null;
    webName:string;
    webTitle:string; // 网站标题
    notices?:string[]; // 通知
    footer:string;
    backgroundImage:string;
    avatar:string;
    randomAvatar?:string[];
    randomName?:string[];
    randomCover?:string[];
    waifuJson:string;
    status:boolean; // 状态
    historyAllCount?:string;
    historyDayCount?:string;
}

interface music {
    title:string;
    url:string;
    cover:string;
    author:string;
}

export {
    webInfo,
    music
}
