import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import qs from "qs";
import {ApiError} from "../error/ApiError";

/** 通用响应体类型 */
export interface CommonResponseResult<T = unknown> {
    code: number;
    message: string;
    data: T;
}

/** Axios 的封装返回类型 */
export interface ApiResponse<T = unknown> {
    status: number;
    headers: {
        'content-type': string;
    },
    statusText: string;
    config: {
        baseURL: string;
        data: string
        headers: {
            accept: string
            authorization: string
        },
        method: string,
        url: string
    },
    data: T;
}

/**
 * Axios 实例
 * - baseURL: 来自常量
 * - withCredentials: true → 浏览器会自动带上同域名下的 Cookie（也就是我们的 HttpOnly refresh_token）
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    // 若需要跨域场景：后端 CORS 要允许 credentials，并且前端在 create 或请求时开启 withCredentials
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse<unknown>) => {
        // 严格校验返回体格式
        const data = response.data;
        if (typeof data !== "object" || data === null) {
            // 非预期结构，直接返回原始 response
            return response;
        }

        const result = data as CommonResponseResult;

        if (!Number.isInteger(result.code)) {
            // 结构不符合，直接返回原始 response
            return response;
        }

        if (result.code !== 200) {
            if (result.code === 300) {

                // 清空 token
                localStorage.removeItem('userToken');
                localStorage.removeItem('currentUser');

                // 安全跳转
                const redirectBase = new URL(import.meta.env.VITE_WEB_URL);
                // 避免 open-redirect 的风险
                const allowedHosts = ['onism.cn', 'www.onism.cn'
                    // , 'localhost' // 开发测试使用，后续注释掉
                ];
                if (allowedHosts.includes(redirectBase.host)) {
                    window.location.replace(redirectBase.origin + '/user');
                } else {
                    console.warn('检测到不安全的重定向地址，已跳转至首页');
                    window.location.replace('/');
                }
                return Promise.reject(new ApiError('登录已过期，请重新登录', response));
            }
            // 其他业务异常，抛出自定义错误，保留原始 response
            return Promise.reject(new ApiError(result.message, response));
        }
        return response;
    },
    (error) => Promise.reject(error)
);

/**
 * POST 请求封装
 * - url: 接口路径
 * - params: 请求体（JSON 或 form-data）
 * - isAdmin: 是否管理员标志（如果接口需要），会自动加到 params 里
 * - json: true 表示 Content-Type: application/json；否则 form-urlencoded
 */
const post = async <T = unknown, R = ApiResponse<CommonResponseResult<T>>>(
    url: string,
    params: object,
    isAdmin = false,
    json = true
): Promise<R> => {
    const token = isAdmin
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("userToken");

    const requestParams = {...params, isAdmin};
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: token || "",
            ...(json ? {"Content-Type": "application/json"} :
                {"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"})
        },
        params: {isAdmin},
    }

    try {
        if (json) {
            return await apiClient.post<T, R>(url, requestParams, config);
        } else {
            // form-urlencoded
            return await apiClient.post<T, R>(
                url,
                qs.stringify(requestParams),
                config
            );
        }
    } catch (err) {
        return Promise.reject(err);
    }
};

/**
 * GET 请求封装
 * - url: 接口路径
 * - params: URL 查询参数
 * - skipAuth: true 时不带 Authorization 头，用于调用公开接口
 * - isAdmin: 是否管理员标志，会自动加到 params 里
 */
const get = async <T = unknown, R = ApiResponse<CommonResponseResult<T>>>(
    url: string,
    params: Record<string, unknown> = {},
    isAdmin = false,
    skipAuth = false, // 是否跳过鉴权，适用于调用公开 API
): Promise<R> => {
    const token = skipAuth
        ? "" : isAdmin
            ? localStorage.getItem("adminToken")
            : localStorage.getItem("userToken");

    const requestParams = {...params, isAdmin};
    const config: AxiosRequestConfig = {
        params: requestParams,
        headers: token ? {Authorization: token} : {}
    };

    // skipAuth 为 true，则临时覆写 headers，不带 Authorization
    if (skipAuth) {
        config.withCredentials = false;
    }

    try {
        return await apiClient.get<T, R>(url, config);
    } catch (err) {
        return Promise.reject(err);
    }
};

/**
 * 文件上传
 * - url: 接口路径
 * - formData: 包含要上传的文件及其它字段
 * - isAdmin: 是否管理员
 */
const upload = async <T = unknown, R = ApiResponse<CommonResponseResult<T>>>(
    url: string,
    param: FormData,
    isAdmin = false
): Promise<R> => {
    const token = isAdmin
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("userToken");
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: token || "",
            "Content-Type": "multipart/form-data"
        }
    };

    if (isAdmin) {
        param.append("isAdmin", "true");
    }

    try {
        return await axios.post<T, R>(
            url,
            param,
            config
        );
    } catch (err) {
        return Promise.reject(err);
    }
};

// 七牛云上传
const uploadQiniu = async <T = unknown, R = ApiResponse<CommonResponseResult<T>>>(url: string, param: FormData): Promise<R> => {
    const config: AxiosRequestConfig = {
        headers: {"Content-Type": "multipart/form-data"},
        timeout: 60000
    };
    try {
        return await axios.post<T, R>(
            url,
            param,
            config
        );
    } catch (err) {
        return Promise.reject(err);
    }
};

// 导出统一接口
const request = {
    post,
    get,
    upload,
    uploadQiniu
};

export default request;
