// 定义音乐项的接口
interface FunnyItem {
    classify: string;
    cover: string;
    url: string;
    title: string;
}

// 定义音乐分类的接口
interface Funnys {
    classify: string;
    count: number;
}

interface FunnyData extends Funnys {
    data: FunnyItem[];
}

type FunnyMap = Record<string, FunnyData>;

export  {
    FunnyItem,
    Funnys,
    FunnyData,
    FunnyMap,
}
