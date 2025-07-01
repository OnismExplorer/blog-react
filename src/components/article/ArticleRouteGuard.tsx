import React, { useState, useEffect } from 'react';
import { useSearchParams, Outlet } from 'react-router-dom';
import { getArticleById } from '@api/article';
import { article } from '@type/article';
import NotFound from '@pages/error/NotFound';

const ArticleRouteGuard: React.FC = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading');
    const [articleData, setArticleData] = useState<article | null>(null);

    useEffect(() => {
        // 每当 ID 更改时重置状态以防止显示过时的数据
        setStatus('loading');
        setArticleData(null);

        // 检查 URL 中是否存在 ID
        if (!id) {
            setStatus('not-found');
            return;
        }

        // 获取文章
        getArticleById(id, false)
            .then(res => {
                if (res.data) {
                    // 设置数据并更新状态
                    setArticleData(res.data);
                    setStatus('ready');
                } else {
                    // 文章不存在
                    setStatus('not-found');
                }
            })
            .catch(error => {
                console.error('获取文章失败:', error);
                setStatus('not-found');
            });
    }, [id]); // 每次 URL 中的 'id' 更改时，重新运行此逻辑

    if (status === 'not-found') {
        return <NotFound />;
    }

    // 如果找到文章，则通过 Outlet 渲染实际的子路由 （Article） 并传递获取的数据
    return <Outlet context={articleData} />;
};

export default ArticleRouteGuard;
