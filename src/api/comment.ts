import {ApiError} from "@error/ApiError";
import {BaseRequestVO} from "../type/base";
import {comment} from "../type/comment";
import {page} from "../type/page";
import request, {CommonResponseResult} from "@utils/request";

/**
  * 获取评论列表
  */
const getCommentList = async (role:string,param:page):Promise<CommonResponseResult<BaseRequestVO<comment>>> => {
    let url;
    if(role === 'boss') {
        url = "/admin/comment/boss/list";
    } else if(role === 'admin') {
        url = "/admin/comment/user/list";
    } else {
        url = "/comment/listComment";
    }

    try {
        const response = await request.post<BaseRequestVO<comment>>(url,param,role !== 'user');
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 删除评论
  */
const handleDeleteComment = async (role:string,id:number): Promise<CommonResponseResult<string>> => {
    let url;
    if(role === 'boss') {
        url = "/admin/comment/boss/deleteComment";
    } else {
        url = "/admin/comment/user/deleteComment";
    }

    try {
        const response = await request.get<string>(url, {id: id}, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

export {
    getCommentList,
    handleDeleteComment,
}
