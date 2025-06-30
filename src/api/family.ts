import {ApiError} from "@error/ApiError";
import {BaseRequestVO} from "@type/base";
import {family} from "@type/family";
import {page} from "@type/page";
import request, {CommonResponseResult} from "@utils/request";
import common from "@utils/common";

/**
  * 获取家庭列表
  */
const getFamilyList = async (param: page): Promise<CommonResponseResult<BaseRequestVO<family>>> => {
    try {
        const response = await request.post<BaseRequestVO<family>>('/family/listFamily', param, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 修改家庭状态
  */
const changeFamilyStatus = async (id:number | null,status:boolean): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/family/changeLoveStatus',{id:id,status:status},true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 保存家庭
  */
const handleSaveOrUpdateFamily = async(param:family):Promise<CommonResponseResult<string>> => {
    let url;
    let isAdmin;
    if(common.isEmpty(param.id) || param.id === -1) {
        url = '/family/saveFamily';
        isAdmin = false;
    } else {
        url = '/family/updateFamily';
        isAdmin = true;
    }

    try {
        const response  = await request.post<string>(url,param,isAdmin);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 删除家庭
  */
const handleDeleteFamily = async (id:number | null):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/family/deleteFamily',{id:id},true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

export {
    getFamilyList,
    changeFamilyStatus,
    handleSaveOrUpdateFamily,
    handleDeleteFamily,
}
