// 创建上下文
import {createContext, useContext, useMemo} from "react";
import common from "@utils/common";
import constant from "@utils/constant";
import request from "@utils/request";
import time from "@utils/time";


const AppContext = createContext({common, constant, request,time})

// 创建一个 Provider 组件
export const AppProvider = () => {
    // 使用 useMemo 来缓存 context 的 value，避免不必要的重新渲染
    const value = useMemo(() => ({ common, constant, request,time }), []);
    return (
        <AppContext.Provider value={value}>
        </AppContext.Provider>
    )
}
// 自定义 Hook 用于访问上下文
export const useAppContext = () => {
    return useContext(AppContext);
}
