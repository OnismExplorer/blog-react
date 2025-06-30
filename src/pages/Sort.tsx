import React, {useEffect, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {useStore} from "@hooks/useStore";
import {article} from "@type/article";
import {sort} from "@type/sort";
import {label} from "@type/label";
import TwoPoem from "@components/common/TwoPoem";
import ProTag from "@components/common/proTag";
import Footer from "@components/common/footer";
import {getArticleList} from "@api/article";
import ArticleList from "./ArticleList";
import clsx from "clsx";
import {page} from "@type/page";
import {useLocation} from "react-router-dom";


interface Pagination extends page{
    searchKey: string;
    sortId: number;
    labelId: number | null;
}

const Sort: React.FC = () => {
    const {common, constant} = useAppContext();
    const {state} = useStore();
    const location = useLocation();
    const sortId = common.parseNumber(new URLSearchParams(location.search).get("sortId"));
    const [labelId,setLabelId] = useState<number | null>(common.parseNumber(new URLSearchParams(location.search).get("labelId")));

    // 分页参数
    const [pagination,setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        searchKey: "",
        sortId,
        labelId
    });
    const [articles, setArticles] = useState<article[]>([]);
    const [sort, setSort] = useState<sort>();

    useEffect(() => {
        getSort();
    }, []);

    // 监听labelId和pagination变化，获取文章列表
    useEffect(() => {
        // 只有当sortId和labelId都有值时才获取文章
        if (pagination.sortId) {
            getArticles();
        }
    }, [labelId, pagination.sortId, pagination.pageNumber]);

    const getNextArticles = () => {
        setPagination((prev) => ({
            ...prev,
            pageNumber: prev.pageNumber + 1,
        }));
        // 不需要调用getArticles，useEffect会监听pagination.pageNumber的变化
    }

    const getSort = () => {
        // 从缓存中获取分类信息
        const sortInfo = state.sortInfo;

        if (!common.isEmpty(sortInfo)) {
            const sortArray = sortInfo.filter(f => {
                return f.id === common.parseNumber(sortId);
            });
            if (!common.isEmpty(sortArray)) {
                setSort(sortArray[0]);
            }
        }
    }

    const listArticle = (label: label) => {
        // 重置文章列表
        setArticles([]);
        // 重置分页并设置新的标签ID
        setPagination({
            pageNumber: 1,
            pageSize: 10,
            total: 0,
            searchKey: "",
            sortId: sortId,
            labelId: label.id
        });
        // 更新标签ID
        setLabelId(label.id);
        // 不需要调用getArticles，useEffect会监听labelId和pagination的变化
    }

    const getArticles = () => {
        getArticleList(pagination,'user')
            .then((res) => {
                const result = res.data;
                if(!common.isEmpty(result)) {
                    if (pagination.pageNumber === 1) {
                        // 第一页时直接设置
                        setArticles(result.records);
                    } else {
                        // 后续页追加
                        setArticles(prev => [...prev, ...result.records]);
                    }
                    setPagination((prev) => ({
                        ...prev,
                        total: result.totalRow
                    }))
                }
            })
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* 两句诗 */}
            <div className="animate-slide-in-top">
                <TwoPoem/>
            </div>

            <div className="bg-background py-10 animate-slide-in-bottom flex-grow">
                {/* 标签 */}
                {sort && !common.isEmpty(sort.labels) && (
                    <div className="justify-center max-w-[780px] mx-auto p-5 bg-white shadow-md rounded-lg flex flex-wrap">
                        {sort.labels && sort.labels.map((label:label,index:number) => (
                            <div
                                key={index}
                                onClick={() => listArticle(label)}
                                className={clsx(
                                    "cursor-pointer m-3",
                                    // 添加活跃状态样式
                                    {"animate-scale-1-infinite": !common.isEmpty(labelId) && labelId === label.id}
                                )}
                            >
                                <ProTag
                                    info={`${label.labelName} ${label.countOfLabel}`}
                                    color={
                                        constant.before_color_list[Math.floor(Math.random() * constant.before_color_list.length)]
                                    }
                                    className="m-3"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 文章 */}
                <div className="p-4 my-8 min-h-[100px] mx-auto">
                    <ArticleList articleList={articles}/>
                    <div className="flex justify-center mt-10">
                        {pagination.total !== articles.length ? (
                            <button
                                onClick={getNextArticles}
                                className="font-bold py-[13px] px-[15px] border border-lightGray rounded-[3rem] w-[100px] select-none cursor-pointer text-center hover:border-themeBackground hover:text-themeBackground hover:shadow-box-shadow"
                            >
                                下一页
                            </button>
                        ) : (
                            <span className="text-gray-400 select-none">~~到底啦~~</span>
                        )}
                    </div>
                </div>

            </div>
            {/* 页脚 */}
            <Footer/>
        </div>
    );
}

export default Sort;
