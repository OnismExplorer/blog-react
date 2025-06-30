import constant from "./constant";
import {message} from "antd";
import request from "./request";

/**
 * 检测是否为移动设备
 */
const mobile = (): boolean => {
    const flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    return !!(flag && flag.length > 0);
};

/**
 * 判断是否为空
 */
const isEmpty = (value: unknown): boolean => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0) ||
        (Object.prototype.isPrototypeOf.call(Object.prototype, value) && Object.keys(value).length === 0)
    );
};

/**
 * 表情包转换
 */
const faceReg = (content: string): string => {
    const qiniuDownload = sessionStorage.getItem("qiniuDownload");
    const newContent = content.replace(/\[[^[^\]]+]/g, (word) => {
        const index = constant.emojiList.indexOf(word.replace("[", "").replace("]", ""));
        if (index > -1) {
            const url = `${qiniuDownload}emoji/q${index + 1}.gif`;
            return `<img alt="" style="vertical-align: middle;width: 32px;height: 32px" src="${url}" title="${word}"/>`;
        }
        return word;
    });
    sessionStorage.removeItem("qiniuDownload");
    console.log('清除后下载地址：',sessionStorage.getItem('qiniuDownload'))
    return newContent;
};

/**
 * 图片转换
 */
const pictureReg = (content: string): string => {
    return content.replace(/<[^<^>]+>/g, (word) => {
        const index = word.indexOf(",");
        if (index > -1) {
            const arr = word.replace("<", "").replace(">", "").split(",");
            return `<img alt="" style="border-radius: 5px;width: 100%;max-width: 250px;display: block" src="${arr[1]}" title="${arr[0]}"/>`;
        }
        return word;
    });
};



/**
 * 保存资源
 */
interface Resource {
    type: string;
    path: string;
    size: number;
    mimeType: string;
}


const saveResource = (
    type: string,
    path: string,
    size: number,
    mimeType: string,
    isAdmin?: boolean
): void => {
    const resource: Resource = {
        type,
        path,
        size,
        mimeType,
    };

    request
        .post(`/resource/saveResource`, resource, isAdmin)
        .catch((error) => {
            message.error(error.message, 3).then();
        });
};

/**
 * 倒计时
 */
const countdown = (time: string): Record<string, number> => {
    const targetTime = new Date(time.replace(/-/g, "/"));
    const nowTime = new Date();
    const seconds = Math.floor((targetTime.getTime() - nowTime.getTime()) / 1000);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return {d, h, m, s};
};

const parseNumber = (
    value:string | number | null | undefined,
    defaultValue?: number,
):number => {
    if (value == null) {
        // null 或 undefined
        return defaultValue ?? -1;
    }

    // 若已经是 number，直接用；否则按 string 解析
    const n = typeof value === 'number'
        ? value
        : parseInt(value, 10);

    // 如果解析后是 NaN，返回默认值
    return Number.isNaN(n) ? defaultValue ?? -1 : n;
}

export default {
    mobile,
    isEmpty,
    faceReg,
    pictureReg,
    saveResource,
    countdown,
    parseNumber
};
