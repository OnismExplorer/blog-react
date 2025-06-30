import {ApiError} from "@error/ApiError";
import {BaseRequestVO} from "../type/base";
import {page} from "@type/page";
import request from "@utils/request";
import {CommonResponseResult} from "@utils/request";
import {resource} from "../type/resource";

const baseURI = '/resource'

/**
  * 获取资源列表
  */
const getResourceList = async (param:page,isAdmin:boolean):Promise<CommonResponseResult<BaseRequestVO<resource>>> => {
    try {
        const response = await request.post<BaseRequestVO<resource>>(`${baseURI}/listResource`,param,isAdmin);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 修改资源状态
  */
const changeResourceStatus = async (param:Record<string, unknown>):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>(`${baseURI}/changeResourceStatus`,param,true)
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 删除资源
  */
const handleDeleteResource = async(path:string):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>("/resource/deleteResource",{path:path},true,false);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 按类型获取资源路径
  */
const getResourcePath = async (type:string):Promise<CommonResponseResult<string[]>> => {
    try {
        const response = await request.get<string[]>('/resource/getResourcePath',{type:type});
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 获取七牛云下载链接
  */
const getDownloadUrl = async ():Promise<string> => {
    const response = await getResourcePath('downloadUrl');
    return response.data[0]
}

export {
    getResourceList,
    handleDeleteResource,
    changeResourceStatus,
    getResourcePath,
    getDownloadUrl,
}
