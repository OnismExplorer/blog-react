import {label} from "./label";

export interface sort {
    id:number | null;
    sortName:string;
    sortDescription:string;
    sortType:number | null;
    priority:number | null;
    countOfSort?:number | null;
    labels?:label[]
}
