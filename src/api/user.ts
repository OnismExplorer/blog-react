import {ApiError} from "@error/ApiError";
import request, {CommonResponseResult} from "@utils/request";
import {LoginParams, user} from "@type/user";
import {BaseRequestVO} from "../type/base";
import {page} from "../type/page";

/**
  * 处理用户登出
  */
const handleLogout = async (isAdmin:boolean):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/user/logout',{},isAdmin);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 获取验证码
  */
const getCode = async (param:Record<string, unknown>): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>("/user/getCode", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 处理登陆
  */
const handleLogin = async (param:LoginParams):Promise<CommonResponseResult<user>> => {
    try {
        const response = await request.post<user>("/user/login", param, param.isAdmin)
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 处理注册事件
  */
const handleRegist = async (param:user): Promise<CommonResponseResult<user>> => {
    try {
        const response = await request.post<user>("/user/regist", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 更新用户信息
  */
const handleUpdateUserInfo = async (param:user): Promise<CommonResponseResult<user>> => {
    try {
        const response = await request.post<user>("/user/updateUserInfo", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 更新账号信息
  */
const handleUpdateAccountInfo = async (param:Record<string, unknown>): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>("/user/updateAccountInfo", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 忘记密码
  */
const handleForgetPassword = async (param:Record<string, unknown>): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>("/user/forgetPassword", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 后台管理员身份校验
  */
const handleVerify = async ():Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/user/verify', { role: 'admin' }, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 管理员获取用户列表
  */
const getUserList = async (param:page):Promise<CommonResponseResult<BaseRequestVO<user>>> => {
    try {
        const response = await request.post<BaseRequestVO<user>>('/admin/user/list',param,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 添加用户
  */
const handleSaveUser = async (param:user):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/admin/user/save',param,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 修改用户
  */
const handleUpdateUser = async (param:user):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/admin/user/update',param,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
  * 更新用户
  */
const handleChangeUser = async (flag:'type' | 'status',param:Record<string, unknown>):Promise<CommonResponseResult<string>> => {
    let url;
    if(flag === 'type') {
        url = '/admin/user/changeUserType';
    } else if(flag === 'status') {
        url = '/admin/user/changeUserStatus';
    } else {
        url = '/admin/user/changeUserAdmire';
    }

    try {
        const response = await request.get<string>(url,param,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

const handleDeleteUser = async (uid:number | null): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>(`/admin/user/remove/${uid}`,{},true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

export {
    handleLogout,
    getCode,
    handleLogin,
    handleRegist,
    handleUpdateUserInfo,
    handleUpdateAccountInfo,
    handleForgetPassword,
    handleVerify,
    getUserList,
    handleSaveUser,
    handleUpdateUser,
    handleChangeUser,
    handleDeleteUser,
}
