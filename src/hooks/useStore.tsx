import React, {createContext, ReactNode, useContext, useMemo, useReducer} from 'react';
import {sort} from "@type/sort";
import {user} from "@type/user";
import {webInfo} from "@type/webInfo";

interface State {
    toolbar: {
        visible: boolean;
        enter: boolean;
    };
    sortInfo: sort[];
    currentUser: user;
    currentAdmin: user;
    webInfo: webInfo;
}

// 定义 action 类型
type Action =
    | { type: 'CHANGE_TOOLBAR_STATUS'; payload: { visible: boolean; enter: boolean } }
    | { type: 'LOAD_SORT_INFO'; payload: sort[] }
    | { type: 'LOAD_CURRENT_USER'; payload: user }
    | { type: 'LOAD_CURRENT_ADMIN'; payload: user }
    | { type: 'LOAD_WEB_INFO'; payload: webInfo };

// 初始化状态
const initialState: State = {
    toolbar: JSON.parse(localStorage.getItem('toolbar') ?? '{"visible": false, "enter": true}'),
    sortInfo: JSON.parse(localStorage.getItem('sortInfo') ?? '[]'),
    currentUser: JSON.parse(localStorage.getItem('currentUser') ?? '{}'),
    currentAdmin: JSON.parse(localStorage.getItem('currentAdmin') ?? '{}'),
    webInfo: JSON.parse(localStorage.getItem('webInfo') ?? '{"webName": "", "webTitle": "", "notices": [], "footer": "", "backgroundImage": "", "avatar": ""}'),
};

const getArticleTotal = (state:State):number => {
    if(state.sortInfo !== null && state.sortInfo.length !== 0) {
        if(state.sortInfo.length === 1) {
            return state.sortInfo[0].countOfSort ?? 0;
        } else {
            return state.sortInfo.reduce((total, item) => {
                return total + (item.countOfSort ?? 0);
            }, 0);
        }
    }

    return 0;
}

// 创建 Context
const StoreContext = createContext<{
    state: State;
    getters: {articleTotal: number}
    dispatch: React.Dispatch<Action>
}>({
    state: initialState,
    dispatch: () => null,
    getters: {
        articleTotal: getArticleTotal(initialState)
    }
});

// Reducer 函数，处理状态更新
const storeReducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'CHANGE_TOOLBAR_STATUS': {
            const newToolbar = action.payload;
            localStorage.setItem('toolbar', JSON.stringify(newToolbar));
            return {...state, toolbar: newToolbar};
        }
        case 'LOAD_SORT_INFO': {
            const sortedSortInfo = action.payload.sort((s1, s2) => s1.priority! - s2.priority!);
            localStorage.setItem('sortInfo', JSON.stringify(sortedSortInfo));
            return {...state, sortInfo: sortedSortInfo};
        }
        case 'LOAD_CURRENT_USER': {
            localStorage.setItem('currentUser', JSON.stringify(action.payload));
            return {...state, currentUser: action.payload};
        }
        case 'LOAD_CURRENT_ADMIN': {
            localStorage.setItem('currentAdmin', JSON.stringify(action.payload));
            return {...state, currentAdmin: action.payload};
        }
        case 'LOAD_WEB_INFO': {
            const webInfo = action.payload;
            localStorage.setItem('webInfo', JSON.stringify(webInfo));
            return {...state, webInfo};
        }
        default:
            return state;
    }
};

// 创建 StoreProvider 组件
export const StoreProvider = ({children}: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(storeReducer, initialState);

    const getters = {
        articleTotal: getArticleTotal(state),
    }

    // 使用 useMemo 包装 value 以避免每次渲染时都创建新的对象
    const value = useMemo(() => ({ state,getters, dispatch }), [state]);

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};

// 自定义 Hook，简化获取 state 和 dispatch
export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore 必须在 StoreProvider 内使用');
    }
    return context;
};
