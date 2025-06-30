import React, {useEffect, useState} from "react";
import {page} from "@type/page";
import {article} from "@type/article";
import {poetry} from "@type/saying";
import {useAppContext} from "@hooks/useAppContext";
import {ApiResponse} from "@utils/request";
import {sort} from "@type/sort";
import Loader from "@components/common/loader";
import Image from "@components/common/image";
import {useStore} from "@hooks/useStore";
import Printer from "@components/common/printer";
import {ChevronDown} from "lucide-react";
import {getArticleList} from "@api/article";
import {getRandomResource} from "@api/webInfo";
import MyAside from "./MyAside";
import {FaVolumeUp} from "react-icons/fa";
import ArticleList from "./ArticleList";
import Footer from "@components/common/footer";

interface Pagination extends page {
    searchKey: string;
    sortId: number | null;
    articleSearch: string;
}

const Index: React.FC = () => {
    const {common, constant, request} = useAppContext();
    const store = useStore();
    const [articles, setArticles] = useState<article[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        sortId: -1,
        searchKey: '',
        articleSearch: ''
    })
    const [printerInfo, setPrinterInfo] = useState<string>('');
    const [imgError, setImgError] = useState<boolean>(false);

    useEffect(() => {
        getPoetry();
        getArticles();
    }, []);

    const getPoetry = () => {
        request.get<poetry, ApiResponse<poetry>>(constant.poetry, {}, false, true)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    // 设置打印内容
                    setPrinterInfo(result.content);
                }
            })
            .catch((error) => console.error('获取诗词失败：', error.message))
    }

    const getArticles = () => {
        getArticleList(pagination, 'user')
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    if (pagination.pageNumber === 1) {
                        // 第一页时直接设置
                        setArticles(result.records);
                    } else {
                        // 后续页追加
                        setArticles(prev => [...prev, ...result.records]);
                    }
                    setPagination((prev) => ({
                        ...prev,
                        total: result.totalRow,
                    }))
                }
            })
    }

    const selectSort = (sort: sort) => {
        setPagination((prev) => ({
            ...prev,
            sortId: sort.id,
        }))

        // 重置文章列表
        setArticles([]);

        // 获取文章
        getArticles();

        // 平滑滚动到文章部分
        setTimeout(() => {
            const element = document.querySelector('#recent-posts');
            element?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            })
        }, 100)
    }

    const selectArticle = (articleSearch: string) => {
        setPagination((prev) => ({
            ...prev,
            sortId: -1,
            articleSearch: articleSearch
        }))

        // 重置文章列表
        setArticles([]);

        // 获取文章
        getArticles();

        // 平滑滚动到文章部分
        setTimeout(() => {
            const element = document.querySelector('#recent-posts');
            element?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            })
        }, 100)
    }

    useEffect(() => {
        getArticles();
    }, [pagination.sortId, pagination.pageNumber])

    // 获取下一页文章列表
    const getNextArticlesPage = () => {
        setPagination((prev) => ({
            ...prev,
            pageNumber: prev.pageNumber + 1,
        }))
    }

    // 跳转指定位置
    const navigation = (selector: string) => {
        const element = document.querySelector(selector)
        if (element) {
            window.scrollTo({
                top: (element as HTMLElement).offsetTop,
                behavior: "smooth",
            })
        }
    }

    const [imageUrl, setImageUrl] = useState<string>(store.state.webInfo.backgroundImage);

    useEffect(() => {
        if (common.isEmpty(store.state.webInfo.backgroundImage)) {
            getImageUrl().then();
        }
    }, []);

    const getImageUrl = async () => {
        const result = await getRandomResource("cover");
        setImageUrl(result.data);
    }

    return (
        <div className="select-none font-custom">
            <Loader
                loader={
                    <div className="flex items-center justify-center min-h-screen bg-gray-100">
                        <div className="text-center">
                            <div
                                className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading...</p>
                        </div>
                    </div>
                }
                loading={false}>
                {/*首页图片*/}
                {!imgError ? (
                    <Image
                        className="fixed z-[-1] w-screen h-screen before:absolute before:w-full before:h-full before:bg-[rgba(0,0,0,0.2)] before:content-['']"
                        lazy
                        draggable={false}
                        zoomable={false}
                        src={imageUrl}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div slot='error' className='w-full h-full bg-lightGreen fixed z-[-1]'></div>
                )}
                {/*首页文字*/}
                <div
                    className="flex flex-col gap-y-2 justify-center items-center relative h-screen overflow-hidden animate-hideToShow">
                    {/*网站标题*/}
                    <h1 className="text-white text-[40px] text-center">
                        {store.state.webInfo.webTitle.split("").map((char, index) => (
                            <span key={index}>{char}</span>
                        ))}
                    </h1>
                    {/*打字机*/}
                    <div
                        className="text-lg cursor-pointer text-white bg-translucent rounded-[10px] px-[10px] py-2 min-h-[50px] min-w-[30px] max-md:max-w-[350px] leading-normal text-wrap overflow-hidden"
                        onClick={getPoetry}>
                        <Printer printerInfo={printerInfo} afterExecuted={getPoetry}>
                            {(content) => (
                                <span className='font-miniItalics font-bold'>
                                  {content}
                              </span>
                            )}
                        </Printer>
                    </div>
                    {/*隔离图案*/}
                    <div
                        className='bg-bannerWave1 bg-repeat-x h-[84px] absolute w-[200%] bottom-0 z-10 animate-gradientBGSlow'/>
                    <div
                        className='bg-bannerWave2 bg-repeat-x h-[100px] absolute w-[400%] bottom-0 z-[5] animate-gradientBGSlow'/>
                    <ChevronDown size={50}
                                 className="font-bold text-white absolute bottom-[80px] animate-shake z-[15] cursor-pointer"
                                 onClick={() => navigation('#page-content-container')}/>
                </div>

                {/*首页内容*/}
                <div id='page-content-container' className="relative bg-background">
                    <div
                        className="flex flex-col justify-center w-[90%] pt-0  pb-10 mx-auto my-0 max-md:px-5 lg:flex-row max-md:w-full">
                        <div
                            className="w-[calc(30%-40px)] mt-10 mr-10 max-w-[300px] float-right max-lg:w-full max-lg:max-w-none max-lg:float-none max-lg:mb-0 max-lg:mx-auto">
                            <MyAside onSelectSort={selectSort} onSelectArticle={selectArticle}/>
                        </div>
                        <div id='recent-posts' className="w-[70%] max-lg:w-full">
                            <div
                                className="flex p-5 border border-dashed border-lightGray text-greyFont rounded-[10px] max-w-[900px] mx-auto my-10">
                                <FaVolumeUp size={28}
                                            className="text-themeBackground my-auto mx-0 animate-scale-0.8-infinite"/>
                                {/*通知*/}
                                {store.state.webInfo.notices!.map((notice, index) => (
                                    <div key={index} className="ml-5 leading-[30px]">{notice}</div>
                                ))}
                            </div>
                            {/*文章列表*/}
                            <ArticleList articleList={articles}/>
                            <div className="flex justify-center mt-10">
                                {pagination.total !== articles.length ? (
                                    <button
                                        onClick={getNextArticlesPage}
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
                </div>

                {/*页脚*/}
                <div className="bg-background">
                    <Footer/>
                </div>
            </Loader>
        </div>
    );
}

export default Index;
