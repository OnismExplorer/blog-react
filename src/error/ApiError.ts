import {message} from "antd";
import {AxiosError, AxiosResponse} from 'axios';

/**
 * ApiError 在保留原始 response 的同时，暴露 message、status 等字段，
 * 方便上层逻辑根据不同场景做差异化处理或上报埋点。
 */
export class ApiError extends Error {
    public response: AxiosResponse;

    constructor(message: string, response: AxiosResponse) {
        super(message);
        this.name = 'ApiError';
        this.response = response;
        // 修复 TS 继承 Error 后 prototype 链断裂问题
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    get status(): number {
        return this.response.status;
    }

    get headers() {
        return this.response.headers;
    }

    get data() {
        return this.response.data;
    }

    get code() {
        return this.response.data.code;
    }

    /**
      * 静态方法，统一处理异常
      */
    static handleError(error:unknown):Error {
        // 先确定 errorMessage
        const msg = error instanceof ApiError
            ? error.message
            : '发生错误!';

        // 给用户提示
        message.error(msg).then();

        // 如果已经是 ApiError，则直接抛
        if (error instanceof ApiError) {
            throw error;
        }

        // 不是 ApiError，就当成 AxiosError 来处理，拿到它的 response
        const axiosErr = error as AxiosError;
        const resp = axiosErr.response;
        // 抛出带 response 的 ApiError
        throw new ApiError(msg, resp!);
    }
}
