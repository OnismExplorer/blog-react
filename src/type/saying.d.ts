interface poetry {
    content:string; // 诗词内容
    origin:string; // 诗词来源(题目)
    author:string; // 诗词作者
    category:string; // 诗词类型
}

interface hitokoto {
    id?:number;
    uuid?:string;
    hitokoto:string;
    type?:string;
    from:string;
    from_who?:string;
    creator?:string;
    length?:number;
}

export {
    poetry,
    hitokoto
}
