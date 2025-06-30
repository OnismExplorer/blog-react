/**
 * 解析字符串日期
 */
const parseDate = (dateString?: string): Date => {
    if (dateString) {
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    return new Date();
};

/**
 * 获取年份
 */
const getYear = (dateString?: string): number => {
    const date = parseDate(dateString);
    return date.getFullYear();
};

/**
 * 获取月份(数字)
 */
const getMonthNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    return date.getMonth() + 1;
};

/**
 * 获取月份(字符串，补零)
 */
const getMonth = (dateString?: string): string => {
    const month = getMonthNumber(dateString);
    return month.toString().padStart(2, '0');
};

/**
 * 获取日期(数字)
 */
const getDayNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    return date.getDate();
};

/**
 * 获取日期(字符串，补零)
 */
const getDay = (dateString?: string): string => {
    const day = getDayNumber(dateString);
    return day.toString().padStart(2, '0');
};

/**
 * 获取小时(数字)
 */
const getHourNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    return date.getHours();
};

/**
 * 获取小时(字符串，补零)
 */
const getHour = (dateString?: string): string => {
    const hour = getHourNumber(dateString);
    return hour.toString().padStart(2, '0');
};

/**
 * 获取分钟(数字)
 */
const getMinuteNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    return date.getMinutes();
};

/**
 * 获取分钟(字符串，补零)
 */
const getMinute = (dateString?: string): string => {
    const minute = getMinuteNumber(dateString);
    return minute.toString().padStart(2, '0');
};

/**
 * 获取秒(数字)
 */
const getSecondNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    return date.getSeconds();
};

/**
 * 获取秒(字符串，补零)
 */
const getSecond = (dateString?: string): string => {
    const second = getSecondNumber(dateString);
    return second.toString().padStart(2, '0');
};

/**
 * 获取格式化时间字符串 YYYY-MM-DD HH:mm:ss
 */
const getTimeString = (separator?: '/' | '-' | 'chinese', dateString?: string): string => {
    const date = parseDate(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    if (separator !== 'chinese') {
        if(!separator) {
            separator = '-';
        }
        return `${year}${separator}${month}${separator}${day} ${hour}:${minute}:${second}`;
    } else {
        return `${year}年${month}月${day}日 ${hour}时${minute}分${second}秒`;
    }
};

/**
 * 获取 ISO 周数 (1-53)
 */
const getWeekNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

/**
 * 获取星期几(数字 1-7, 1=周一, 7=周日)
 */
const getWeekdayNumber = (dateString?: string): number => {
    const date = parseDate(dateString);
    const day = date.getDay();
    return day === 0 ? 7 : day;
};

/**
 * 获取星期几(中文名称)
 */
const getWeekdayName = (dateString?: string): string => {
    const weekdayMap = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const date = parseDate(dateString);
    return weekdayMap[date.getDay()];
};

/**
 * 计算时间差异
 */
const getDateDiff = (dateStr: string): string => {
    const publishTime = isNaN(Date.parse(dateStr.replace(/-/gi, "/")) / 1000)
        ? Date.parse(dateStr) / 1000
        : Date.parse(dateStr.replace(/-/gi, "/")) / 1000;
    const timeNow = Math.floor(new Date().getTime() / 1000);
    const d = timeNow - publishTime;
    const d_days = Math.floor(d / 86400);
    const d_hours = Math.floor(d / 3600);
    const d_minutes = Math.floor(d / 60);
    const d_seconds = Math.floor(d);

    if (d_days > 0 && d_days < 3) {
        return `${d_days}天前`;
    } else if (d_days <= 0 && d_hours > 0) {
        return `${d_hours}小时前`;
    } else if (d_hours <= 0 && d_minutes > 0) {
        return `${d_minutes}分钟前`;
    } else if (d_seconds < 60) {
        return d_seconds <= 0 ? "刚刚发表" : `${d_seconds}秒前`;
    } else if (d_days >= 3) {
        const date = new Date(publishTime * 1000);
        const Y = date.getFullYear();
        const M = String(date.getMonth() + 1).padStart(2, "0");
        const D = String(date.getDate()).padStart(2, "0");
        const H = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        return `${Y}-${M}-${D} ${H}:${m}`;
    }
    return "";
};

/**
 * 字符串转换为时间戳
 */
const getDateTimeStamp = (dateStr: string): number => {
    return Date.parse(dateStr.replace(/-/gi, "/"));
};

/**
 * 计算两个时间相差的年、月、日、时、分、秒
 */
const timeDiff = (oldTime: string, newTime?: string): Record<string, number> => {
    const oldT = new Date(oldTime.replace(/-/g, "/"));
    const newT = newTime ? new Date(newTime.replace(/-/g, "/")) : new Date();
    const diffTime = Math.abs(newT.getTime() - oldT.getTime());

    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 3600 * 24)) / (1000 * 3600));
    const diffMinutes = Math.floor((diffTime % (1000 * 3600)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    return {
        diffDays,
        diffHours,
        diffMinutes,
        diffSeconds,
    };
};

export default {
    parseDate,
    getYear,
    getMonthNumber,
    getMonth,
    getDayNumber,
    getDay,
    getHourNumber,
    getHour,
    getMinuteNumber,
    getMinute,
    getSecondNumber,
    getSecond,
    getTimeString,
    getWeekNumber,
    getWeekdayNumber,
    getWeekdayName,
    getDateDiff,
    getDateTimeStamp,
    timeDiff,
};
