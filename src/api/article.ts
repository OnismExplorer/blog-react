import {ApiError} from "@error/ApiError";
import {article} from "../type/article";
import {BaseRequestVO} from "../type/base";
import {page} from "../type/page";
import request, {CommonResponseResult} from "@utils/request";
import common from "@utils/common";

/**
  * 获取文章列表
  */
const getArticleList = async (params:page,role:string):Promise<CommonResponseResult<BaseRequestVO<article>>> => {
    let url;
    if(role === 'boss') {
        url = "/admin/article/boss/list";
    } else if(role === 'admin') {
        url = "/admin/article/user/list";
    } else {
        url = "/article/listArticle";
    }

   try {
       const response = await request.post<BaseRequestVO<article>>(url,params,role !== 'user')

       return response.data;
   } catch (error) {
       throw ApiError.handleError(error)
   }
}

const getArticleById = async (articleId:string | null,isAdmin:boolean):Promise<CommonResponseResult<article>> => {
    let url;
    let param;

    if(isAdmin) {
        url = '/admin/article/getArticleById';
        param = {id:articleId};
    } else {
        url = '/article/getArticleById';
        param = {id: articleId, flag: true};
    }

    try {
        const resopnse = await request.get<article>(url,param,isAdmin);
        return resopnse.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 修改文章状态
  */
const changeArticleStatus = async (param:Record<string, unknown>):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/admin/article/changeArticleStatus',param,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 删除文章
  */
const handleDeleteArticle = async (id:number):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/article/deleteArticle', {id: id}, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 保存/更新文章
  */
const handleSaveOrUpdateArticle = async(article:article):Promise<CommonResponseResult<string>> => {
    let url;
    if(common.isEmpty(article.id) || article.id === -1) {
        url = '/article/saveArticle';
    } else {
        url = '/article/updateArticle';
    }

    try {
        const response = await request.post<string>(url,article,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

export {
    getArticleList,
    getArticleById,
    changeArticleStatus,
    handleDeleteArticle,
    handleSaveOrUpdateArticle,
}
