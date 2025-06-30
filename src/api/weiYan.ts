import {ApiError} from "@error/ApiError";
import {BaseRequestVO} from "@type/base";
import {page} from "@type/page";
import {weiYan} from "@type/weiYan";
import request, {CommonResponseResult} from "@utils/request";

/**
  * 获取最新进展
  */
const getNewList = async (params:page):Promise<CommonResponseResult<BaseRequestVO<weiYan>>> => {
    try {
        const response = await request.post<BaseRequestVO<weiYan>>("/weiYan/listNews", params)
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 删除微言
  */
const deleteWeiYan = async (id:number | null):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>("/weiYan/deleteWeiYan", {id: id})
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 保存最新进展
  */
const saveNews = async (param:weiYan):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>("/weiYan/saveNews", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 保存微言
  */
const saveWeiYan = async (param:weiYan):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/weiYan/saveWeiYan', param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 获取微言列表
  */
const getWeiYanList = async (param:page) :Promise<CommonResponseResult<BaseRequestVO<weiYan>>> => {
    try {
        const response = await request.post<BaseRequestVO<weiYan>>("/weiYan/listWeiYan", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}


export {
    getNewList,
    deleteWeiYan,
    saveNews,
    getWeiYanList,
    saveWeiYan,
}
