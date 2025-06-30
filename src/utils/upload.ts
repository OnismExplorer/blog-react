import type {UploadRequestOption} from 'rc-upload/lib/interface';
import {message} from "antd";

interface ProgressEventWithPercent extends ProgressEvent {
    percent?: number; // 添加可选的 percent 属性
}

export interface UploadOption {
    action: string;
    data?: Record<string, string | Blob>; // 更具体的类型，避免 any
    filename: string;
    file: File;
    onProgress: (e: ProgressEventWithPercent) => void;
    onError: (e: Error) => void;
    onSuccess: (response: unknown) => void; // 使用 unknown 类型替代 any
    withCredentials?: boolean;
    headers?: Record<string, string | null>;
}

function getError(action: string, xhr: XMLHttpRequest): Error {
    let msg: string;
    if (xhr.response) {
        msg = `${xhr.response.error || xhr.response}`;
    } else if (xhr.responseText) {
        msg = `${xhr.responseText}`;
    } else {
        msg = `fail to ${action} ${xhr.status}`;
    }

    return new Error(msg);
}

/**
 * 基于 rc-upload UploadRequestOption 的错误处理函数
 * @param action 上传地址
 * @param option 上传参数
 * @param xhr XMLHttpRequest 实例
 * @returns Error 实例
 */
function getErrorByRc(action: string, xhr: XMLHttpRequest): Error {
    let msg: string;
    if (xhr.response && typeof xhr.response === "object" && "error" in xhr.response) {
        msg = `${(xhr.response as Record<string, unknown>)["error"] || xhr.response}`;
    } else if (xhr.responseText) {
        msg = `${xhr.responseText}`;
    } else {
        msg = `fail to ${action} ${xhr.status}`;
    }
    return new Error(msg);
}

function getBody(xhr: XMLHttpRequest): unknown { // 使用 unknown 类型
    const text = xhr.responseText || xhr.response;
    if (!text) {
        return text;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/**
 * 基于 rc-upload UploadRequestOption 的响应体解析函数
 * @param xhr XMLHttpRequest 实例
 * @returns 解析后的响应体
 */
function getBodyByRc(xhr: XMLHttpRequest): unknown {
    const text = xhr.responseText || xhr.response;
    if (!text) {
        return text;
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        message.error("获取请求体失败！")
            .then(()=>{
                console.error("获取请求体失败！报错信息："+e)
                return text
            })
    }
}

export  function upload(option: UploadOption): XMLHttpRequest {
    const xhr = new XMLHttpRequest();
    const action = option.action;

    if (xhr.upload) {
        xhr.upload.onprogress = function progress(e: ProgressEvent) {
            const progressEvent = e as ProgressEventWithPercent; // 强制转换
            if (progressEvent.total > 0) {
                progressEvent.percent = (progressEvent.loaded / progressEvent.total) * 100;
            }
            option.onProgress(progressEvent);
        };
    }

    const formData = new FormData();

    if (option.data) {
        Object.keys(option.data).forEach((key) => {
            formData.append(key, option.data![key]);
        });
    }

    formData.append(option.filename, option.file, option.file.name);

    xhr.onerror = function error(e: Event) {
        option.onError(new Error(`Upload error: ${e}`)); // 将事件转换为 Error
    };

    xhr.onload = function onload() {
        if (xhr.status < 200 || xhr.status >= 300) {
            return option.onError(getError(action, xhr));
        }

        option.onSuccess(getBody(xhr));
    };

    xhr.open('post', action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
        xhr.withCredentials = true;
    }

    const headers = option.headers || {};

    for (const item in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, item) && headers[item] !== null) {
            xhr.setRequestHeader(item, headers[item]!);
        }
    }

    xhr.send(formData);
    return xhr;
}

/**
 * 基于 rc-upload UploadRequestOption 的上传主函数
 * @param option rc-upload 的 UploadRequestOption 参数
 * @returns XMLHttpRequest 实例
 */
export function uploadByRc(option: UploadRequestOption): XMLHttpRequest {
    const xhr = new XMLHttpRequest();
    const { action, file, data, headers, withCredentials, onProgress, onSuccess, onError, filename = "file" } = option;

    if (xhr.upload) {
        xhr.upload.onprogress = function progress(e: ProgressEvent) {
            if (e.lengthComputable && e.total > 0) {
                (e as ProgressEvent & { percent?: number }).percent = (e.loaded / e.total) * 100;
            }
            if (onProgress) {
                onProgress(e as ProgressEvent & { percent?: number });
            }
        };
    }

    const formData = new FormData();
    if (data) {
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (typeof value === "string" || value instanceof Blob) {
                formData.append(key, value);
            } else {
                formData.append(key, String(value));
            }
        });
    }
    formData.append(filename, file as File, (file as File).name);

    xhr.onerror = function error(e) {
        if (onError) {
            onError(e);
        }
    };

    xhr.onload = function onload() {
        if (xhr.status < 200 || xhr.status >= 300) {
            if (onError) onError(getErrorByRc(action, xhr));
            return;
        }
        if (onSuccess) onSuccess(getBodyByRc(xhr));
    };

    xhr.open("post", action, true);

    if (withCredentials && "withCredentials" in xhr) {
        xhr.withCredentials = true;
    }

    if (headers) {
        Object.keys(headers).forEach(item => {
            if (headers[item] !== null) {
                xhr.setRequestHeader(item, headers[item]);
            }
        });
    }

    xhr.send(formData);
    return xhr;
}
