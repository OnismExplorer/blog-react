import { Dayjs } from 'dayjs';

interface family {
    id: number | null;
    userId?:number;
    bgCover:string;
    manCover:string;
    womanCover:string;
    manName:string;
    womanName:string;
    timing:string | Dayjs;
    countdownTitle:string;
    countdownTime:string | Dayjs;
    status:boolean | null;
    familyInfo?:string;
    likeCount?:number;
    createTime?:string;
    updateTime?:string;
}

export {
    family,
}
