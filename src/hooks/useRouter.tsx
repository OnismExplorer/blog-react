import {message} from "antd";
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import DelayedRoute from "@components/common/delayedRoute";
import NotFound from "@pages/error/NotFound";
import request from "@utils/request";
import Loading from "@components/common/loading";
import {ApiError} from "@error/ApiError";

// 懒加载页面
const Home = React.lazy(() => import('@pages/Home'));
const Index = React.lazy(() => import('@pages/Index'));
const Sort = React.lazy(() => import('@pages/Sort'));
const Article = React.lazy(() => import('@pages/Article'));
const WeiYan = React.lazy(() => import('@pages/WeiYan'));
// const Love = React.lazy(() => import('@pages/Love'));
const Favorite = React.lazy(() => import('@pages/Favorite'));
const Travel = React.lazy(() => import('@pages/Travel'));
const Message = React.lazy(() => import('@pages/Message'));
const Friend = React.lazy(() => import('@pages/Friend'));
const Funny = React.lazy(() => import('@pages/Funny'));
const About = React.lazy(() => import('@pages/About'));
const User = React.lazy(() => import('@pages/User'));

// Admin pages
const Admin = React.lazy(() => import('@pages/admin/Admin'));
const Welcome = React.lazy(() => import('@pages/admin/Welcome'));
const Main = React.lazy(() => import('@pages/admin/Main'));
const TreeHoleList = React.lazy(() => import('@pages/admin/TreeHoleList'));
const CommentList = React.lazy(() => import('@pages/admin/CommentList'));
const SortList = React.lazy(() => import('@pages/admin/SortList'));
const ResourceList = React.lazy(() => import('@pages/admin/ResourceList'));
const ResourcePathList = React.lazy(() => import('@pages/admin/ResourcePathList'));
const UserList = React.lazy(() => import('@pages/admin/UserList'));
const PostList = React.lazy(() => import('@pages/admin/PostList'));
const ArticleEdit = React.lazy(() => import('@pages/admin/ArticleEdit'));
const WebEdit = React.lazy(() => import('@pages/admin/WebEdit'));
const LoveList = React.lazy(() => import('@pages/admin/LoveList'));
/*
*/
const Verify = React.lazy(() => import('@pages/admin/Verify'));

// 受保护路由组件
const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const isAuthenticated = Boolean(localStorage.getItem("adminToken"));
    // judge: null 表示还在“校验中”，true/false 表示校验结果
    const [judge, setJudge] = useState<boolean | null>(null);

    useEffect(() => {
        // 如果本地连 token 都没有，就没必要请求后端校验
        if (!isAuthenticated) {
            setJudge(false);
            return;
        }

        // 异步调用后端接口验证 token
        (async () => {
            try {
                await request.get<string>('/user/verify', {role: 'admin'}, true, false);
                setJudge(true);
            } catch (err) {
                message.error(err instanceof ApiError ? err.message : '非法操作');
                // 后端验证失败：删掉假 token，并把 judge 设 false
                localStorage.removeItem('adminToken');
                localStorage.removeItem('currentAdmin');
                setJudge(false);
            }
        })();
    }, [isAuthenticated]);

    // 如果本地没有 token，直接跳转到 /verify
    if (!isAuthenticated) {
        const fromPath = encodeURIComponent(location.pathname + location.search + location.hash);
        return <Navigate to={`/verify?redirect=${fromPath}`} replace/>;
    }

    // 如果还在校验中，可返回一个 loading（或者直接 null）
    if (judge === null) {
        return <Loading/>;
    }

    // 如果后端校验失败，同样跳转去 /verify
    if (!judge) {
        const fromPath = encodeURIComponent(location.pathname + location.search + location.hash);
        return <Navigate to={`/verify?redirect=${fromPath}`} replace/>;
    }

    // 校验通过，渲染子路由
    return <>{children}</>;
};

// 主路由组件
export const AppRouter = () => {
    return (
        <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Routes>
                <Route path="/" element={<Home/>}>
                    <Route index element={<DelayedRoute><Index/></DelayedRoute>}/>
                    <Route path="sort" element={<DelayedRoute><Sort/></DelayedRoute>}/>
                    <Route path="article" element={<DelayedRoute><Article/></DelayedRoute>}/>
                    <Route path="weiYan" element={<DelayedRoute><WeiYan/></DelayedRoute>}/>
                    {/*<Route path="love" element={<DelayedRoute><Love /></DelayedRoute>} />*/}
                    <Route path="favorite" element={<DelayedRoute><Favorite/></DelayedRoute>}/>
                    <Route path="travel" element={<DelayedRoute><Travel/></DelayedRoute>}/>
                    <Route path="message" element={<DelayedRoute><Message/></DelayedRoute>}/>
                    <Route path="friend" element={<DelayedRoute><Friend/></DelayedRoute>}/>
                    <Route path="funny" element={<DelayedRoute><Funny/></DelayedRoute>}/>
                    <Route path="about" element={<DelayedRoute><About/></DelayedRoute>}/>
                    <Route path="user" element={<DelayedRoute><User/></DelayedRoute>}/>
                </Route>

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Admin/>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/welcome" replace/>}/>
                    <Route path="welcome" element={<Welcome/>}/>
                    <Route path="main" element={<Main/>}/>
                    <Route path="treeHoleList" element={<TreeHoleList/>}/>
                    <Route path="commentList" element={<CommentList/>}/>
                    <Route path="sortList" element={<SortList/>}/>
                    <Route path="resourceList" element={<ResourceList/>}/>
                    <Route path="resourcePathList" element={<ResourcePathList/>}/>
                    <Route path="userList" element={<UserList/>}/>
                    <Route path="postList" element={<PostList/>}/>
                    <Route path="articleEdit" element={<ArticleEdit/>}/>
                    <Route path="webEdit" element={<WebEdit/>}/>
                    <Route path="loveList" element={<LoveList />} />
                </Route>

                <Route path="/verify" element={<Verify/>}/>
                <Route path='*' element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
};
