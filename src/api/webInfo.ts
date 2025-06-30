import {ApiError} from "@error/ApiError";
import {resourcePath} from "@type/resourcePath";
import {CommonResponseResult} from "@utils/request";
import request from "@utils/request";
import {PhotoTitle} from "@pages/Travel";
import {Funnys} from "@type/funny";
import {sort} from "@type/sort";
import {treeHole} from "@type/treeHole";
import {webInfo} from "@type/webInfo";
import {BaseRequestVO} from "../type/base";
import {historyInfo} from "../type/historyInfo";
import {label} from "../type/label";
import {page} from "../type/page";
import {music} from "../type/webInfo";

/**
 * 获取百宝箱收集列表
 */
const getCollectList = async (): Promise<CommonResponseResult<Record<string, resourcePath[]>>> => {
    try {
        const response = await request.get<Record<string, resourcePath[]>>("/webInfo/listCollect");
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 保存友链
 */
const saveFriend = async (param: object): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/webInfo/saveFriend', param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取音乐列表
 */
const getFunnyList = async (): Promise<CommonResponseResult<Funnys[]>> => {
    try {
        const response = await request.get<Funnys[]>(`/webInfo/listFunny`)
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取分类列表数据
 */
const getSortInfo = async (): Promise<CommonResponseResult<sort[]>> => {
    try {
        const response = await request.get<sort[]>('/webInfo/getSortInfo');
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取网站信息
 */
const getWebInfo = async (): Promise<CommonResponseResult<webInfo>> => {
    try {
        const response = await request.get<webInfo>('/webInfo/getWebInfo');
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取树洞留言列表
 */
const getTreeHoleList = async (): Promise<CommonResponseResult<treeHole[]>> => {
    try {
        const response = await request.get<treeHole[]>("/webInfo/listTreeHole");
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取资源路径列表
 */
const getResourcePathList = async (params: page, isAdmin: boolean): Promise<CommonResponseResult<BaseRequestVO<resourcePath>>> => {
    try {
        const response = await request.post<BaseRequestVO<resourcePath>>('/webInfo/listResourcePath', params, isAdmin)
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
 * 更新资源路径
 */
const handleUpadteResourcePath = async (param: resourcePath): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/webInfo/updateResourcePath', param, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
 * 保存资源路径
 */
const handleSaveResourcePath = async (param: resourcePath): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/webInfo/saveResourcePath', param, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
 * 删除资源路径
 */
const handleDeleteResourcePath = async (id: number | null): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/webInfo/deleteResourcePath', {id: id}, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
 * 保存树洞信息
 */
const saveTreeHole = async (param: treeHole): Promise<CommonResponseResult<treeHole>> => {
    try {
        const response = await request.post<treeHole>("/webInfo/saveTreeHole", param);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取旅拍照片
 */
const getTravelPhoto = async (): Promise<CommonResponseResult<PhotoTitle[]>> => {
    try {
        const response = await request.get<PhotoTitle[]>('/webInfo/listAdminLovePhoto');
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error);
    }
}

/**
 * 获取历史访问数据
 */
const getHistoryInfo = async (): Promise<CommonResponseResult<historyInfo>> => {
    try {
        const response = await request.get<historyInfo>('/webInfo/getHistoryInfo', {}, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 保存/更新分类信息
 */
const handleSaveOrUpdateSort = async (id: number | null, param: object): Promise<CommonResponseResult<string>> => {
    const url = id ? '/webInfo/updateSort' : '/webInfo/saveSort';

    try {
        const response = await request.post<string>(url, param, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 保存/更新标签信息
 */
const handleSaveOrUpdateLabel = async (id: number | null, param: object): Promise<CommonResponseResult<string>> => {
    const url = id ? '/webInfo/updateLabel' : '/webInfo/saveLabel';

    try {
        const response = await request.post<string>(url, param, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 删除分类/标签
 */
const handleDeleteSortOrLabel = async (flag: number, id: number | null): Promise<CommonResponseResult<string>> => {
    const url = flag === 1 ? '/webInfo/deleteSort' : '/webInfo/deleteLabel';

    try {
        const response = await request.get<string>(url, {id: id}, true)
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取分类和标签列表
 */
const getSortAndLabelList = async (): Promise<CommonResponseResult<{ sorts: sort[], labels: label[] }>> => {
    try {
        const response = await request.get<{ sorts: sort[], labels: label[] }>('/webInfo/listSortAndLabel');
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
 * 获取后台网站信息
 */
const getAdminWebInfo = async (): Promise<CommonResponseResult<webInfo>> => {
    try {
        const response = await request.get<webInfo>('/admin/webInfo/getAdminWebInfo', {}, true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 更新网站信息
  */
const handleUpdateWebInfo = async (param: webInfo | Record<string, unknown>): Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.post<string>('/webInfo/updateWebInfo',param,true);
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 获取音乐信息
  */
const handleGetMusic = async ():Promise<CommonResponseResult<music>> => {
    try {
        const response = await request.get<music>('/webInfo/getMusic');
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

/**
  * 获取随机资源
  */
const getRandomResource = async (type:'cover' | 'avatar' | 'name'):Promise<CommonResponseResult<string>> => {
    try {
        const response = await request.get<string>('/webInfo/getRandomResource',{type:type});
        return response.data;
    } catch (error) {
        throw ApiError.handleError(error)
    }
}

export {
    getCollectList,
    saveFriend,
    getFunnyList,
    getSortInfo,
    getWebInfo,
    getTreeHoleList,
    saveTreeHole,
    getTravelPhoto,
    getHistoryInfo,
    handleDeleteSortOrLabel,
    handleSaveOrUpdateSort,
    handleSaveOrUpdateLabel,
    getResourcePathList,
    handleUpadteResourcePath,
    handleDeleteResourcePath,
    handleSaveResourcePath,
    getSortAndLabelList,
    getAdminWebInfo,
    handleUpdateWebInfo,
    handleGetMusic,
    getRandomResource
}
