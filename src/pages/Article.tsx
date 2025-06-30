import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Collapse, DatePicker, message, Modal} from "antd";
import Footer from "@components/common/footer";
import Comment from "@components/comment/comment";
import Process from "@components/common/Process";
import CommentBox from "@components/comment/commentBox";
import {useAppContext} from "@hooks/useAppContext";
import {article} from "@type/article";
import "highlight.js/styles/atom-one-dark.css";
import {Markdown} from "@components/code/Markdown";
import {useStore} from "@hooks/useStore";
import {weiYan} from "@type/weiYan";
import {getArticleById} from "@api/article";
import {deleteWeiYan, saveNews, getNewList} from "@api/weiYan";
import {page} from "@type/page";
import {getDownloadUrl} from "@api/resource";

export default function Article() {
    // 获取文章 id
    const id = new URLSearchParams(location.search).get("id");
    const navigate = useNavigate();
    const [article, setArticle] = useState<article>();
    const [markdownText, setMarkdownText] = useState('');
    const [weiYanList, setWeiYanList] = useState<weiYan[]>([]);
    const [weiYanDialogVisible, setWeiYanDialogVisible] = useState(false);
    const [newsTime, setNewsTime] = useState("");
    const {common} = useAppContext();
    const {state} = useStore();
    const [, setIsMobile] = useState(false);
    const [isTocOpen, setIsTocOpen] = useState(false);
    // 使用 ref 来存储滚动相关的状态，避免频繁重渲染
    const scrollStateRef = useRef({
        ticking: false,
        lastScrollTime: 0
    });

    useEffect(() => {
        // 获取文章
        getArticle();
        // 获取下载地址
        getDownloadUrl()
            .then((res) => {
                sessionStorage.setItem('qiniuDownload', res);
            })
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // 计算文章字数和预计阅读时间
    const readingStats = useMemo(() => {
        if (!markdownText) {
            return {wordCount: 0, readingTime: 0};
        }

        // 去除代码块、HTML标签、图片等不计入阅读时间的内容
        const text = markdownText
            .replace(/```[\s\S]*?```/g, '')       // 移除代码块
            .replace(/`[^`]*`/g, '')              // 移除行内代码
            .replace(/<[^>]*>/g, '')             // 移除 HTML 标签
            .replace(/!\[.*?]\(.*?\)/g, '')       // 移除图片
            .replace(/\[(.*?)]\(.*?\)/g, '$1')   // 保留链接文本
            .replace(/^#+\s/gm, '')              // 移除标题标记
            .replace(/^>\s?/gm, '')              // 移除块引用标记
            .replace(/^[*\\-]\s*|^\d+\.\s*/gm, '') // 移除列表标记
            .replace(/[#*_\-~>|=+]/g, '')       // 移除其他 Markdown 语法符号
            .replace(/\s+/g, '')                   // 移除所有空白字符，方便计算字数
            .trim();

        const wordCount = text.length;
        // 假设平均阅读速度为每分钟 400 字, 最少为 1 分钟
        const readingTime = Math.max(1, Math.ceil(wordCount / 400));

        return {wordCount, readingTime};
    }, [markdownText]);


    // 优化目录生成，使用更精确的缓存依赖
    const toc = useMemo(() => {
        if (!markdownText) return [];

        // 1. 在查找标题前移除代码块
        const textWithoutCodeBlocks = markdownText.replace(/```[\s\S]*?```/g, "");

        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const tocList: { level: number; text: string; id: string }[] = [];
        let match;

        // 在处理过的文本中查找标题
        while ((match = headingRegex.exec(textWithoutCodeBlocks)) !== null) {
            const level = match[1].length;
            const text = match[2].replace(/[`*_[\]]/g, ""); // 去除部分md符号
            // Ensure IDs are valid CSS selectors and unique
            const baseId = text
                .toLowerCase()
                // 允许任何 Unicode 字符或数字
                .replace(/[^\p{L}\p{N}\s-]/gu, "")
                .replace(/\s+/g, "-");
            let id = baseId;
            let counter = 1;
            // Ensure uniqueness if multiple headers have the same text
            while (
                tocList.some((item) => item.id === id) ||
                document.getElementById(id)
                ) {
                id = `${baseId}-${counter}`;
                counter++;
            }
            tocList.push({level, text, id});
        }
        return tocList;
    }, [markdownText]);


    // 渲染目录 - 根据设备类型渲染不同样式
    const Toc = () => {
        // 当前高亮的目录项 id
        const [activeId, setActiveId] = useState<string>("");
        // 展开的目录项 ids
        const [expandedIds, setExpandedIds] = useState<string[]>([]);
        // 最大显示层级
        const [maxInitialLevel, setMaxInitialLevel] = useState(2);

        // 根据目录数量自动调整初始显示层级
        useEffect(() => {
            // 计算一级标题数量
            const level1Count = toc.filter(item => item.level === 1).length;
            // 如果一级标题较多(超过5个)，则只显示一级
            setMaxInitialLevel(level1Count > 5 ? 1 : 2);
        }, []);

        // 使用 useCallback 优化滚动处理函数
        const handleScroll = useCallback(() => {
            // 获取所有标题元素
            const headingElements = toc.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
            if (headingElements.length === 0) return;

            // 获取滚动位置
            const scrollPosition = window.scrollY || document.documentElement.scrollTop;
            // 计算当前可视区域内的标题
            let currentId = toc.length > 0 ? toc[0].id : "";

            for (let i = 0; i < headingElements.length; i++) {
                const el = headingElements[i];
                if (el.offsetTop - 80 <= scrollPosition) {
                    currentId = el.id;
                } else {
                    break;
                }
            }

            // 设置当前高亮项
            setActiveId(currentId);

            // 自动展开当前标题的父级目录
            if (currentId) {
                const currentItem = toc.find(item => item.id === currentId);
                if (currentItem) {
                    // 找出所有需要展开的父级目录
                    const parentIds = toc
                        .filter(item => item.level < currentItem.level)
                        .map(item => item.id);

                    // 合并当前ID和父级IDs
                    setExpandedIds(prevIds => {
                        const merged = new Set(prevIds);
                        merged.add(currentId);
                        parentIds.forEach(id => merged.add(id));
                        return Array.from(merged);
                    });
                }
            }
        }, []);

        // 优化滚动事件监听，使用节流和 RAF
        useEffect(() => {
            const onScroll = () => {
                const now = Date.now();
                // 限制滚动事件处理频率到 60fps
                if (now - scrollStateRef.current.lastScrollTime < 16) return;

                if (!scrollStateRef.current.ticking) {
                    window.requestAnimationFrame(() => {
                        handleScroll();
                        scrollStateRef.current.ticking = false;
                        scrollStateRef.current.lastScrollTime = Date.now();
                    });
                    scrollStateRef.current.ticking = true;
                }
            };

            // 使用 passive 监听器优化性能
            window.addEventListener("scroll", onScroll, {passive: true});
            return () => window.removeEventListener("scroll", onScroll);
        }, [handleScroll]);

        // 优化目录点击事件
        const handleTocClick = useCallback((id: string) => {
            const el = document.getElementById(id);
            if (el) {
                // 计算元素到视口顶部的距离
                const rect = el.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // 使用更平滑的滚动，减少卡顿
                window.scrollTo({
                    top: scrollTop + rect.top - 20,
                    behavior: "smooth"
                });

                // 设置当前活动项
                setActiveId(id);
            }
            setIsTocOpen(false);
        }, []);

        // 使用 useMemo 优化渲染性能
        const hasChildren = useCallback((item: { level: number; id: string }) => {
            const itemIndex = toc.findIndex(i => i.id === item.id);
            if (itemIndex === -1 || itemIndex === toc.length - 1) return false;

            return toc[itemIndex + 1].level > item.level;
        }, []);

        // 获取有子项的目录ID
        const parentItemIds = useMemo(() =>
                toc.filter(item => hasChildren(item)).map(item => item.id),
            [hasChildren]);

        // 检查是否有任何目录被展开
        const isAnyParentExpanded = useMemo(() =>
                parentItemIds.some(id => expandedIds.includes(id)),
            [parentItemIds, expandedIds]);

        // 切换全部展开/收起
        const handleToggleAll = useCallback(() => {
            if (isAnyParentExpanded) {
                setExpandedIds([]); // 收起所有
            } else {
                setExpandedIds(parentItemIds); // 展开所有父级
            }
        }, [isAnyParentExpanded, parentItemIds]);


        // 处理目录展开/折叠
        const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // 获取当前项
            const currentItem = toc.find(item => item.id === id);
            if (!currentItem) return;

            setExpandedIds(prev => {
                // 如果当前项已展开，则关闭它
                if (prev.includes(id)) {
                    return prev.filter(item => item !== id);
                } else {
                    return [...prev, id];
                }
            });
        }, []);

        // 获取子项
        const getChildren = useCallback((item: { level: number; id: string }) => {
            const itemIndex = toc.findIndex(i => i.id === item.id);
            if (itemIndex === -1) return [];

            const children: typeof toc = [];
            for (let i = itemIndex + 1; i < toc.length; i++) {
                if (toc[i].level <= item.level) break;
                if (toc[i].level === item.level + 1) {
                    children.push(toc[i]);
                }
            }
            return children;
        }, []);

        // 使用 React.memo 优化目录项渲染
        const renderTocItem = useCallback((item: { level: number; text: string; id: string }, isChild = false) => {
            const hasChildItems = hasChildren(item);
            const isExpanded = expandedIds.includes(item.id);
            const isActive = activeId === item.id;
            const shouldShow = item.level <= maxInitialLevel || isChild || expandedIds.some(id => {
                const expandedItem = toc.find(i => i.id === id);
                return expandedItem && item.level === expandedItem.level + 1;
            });

            if (!shouldShow) return null;

            return (
                <li key={item.id} className={`my-1 ${isChild ? 'ml-4' : ''} `}>
                    <div className="flex items-center">
                        {hasChildItems && (
                            <button
                                onClick={(e) => toggleExpand(item.id, e)}
                                className="w-4 h-4 mr-1 flex items-center justify-center text-gray-500 hover:text-blue-500 focus:outline-none"
                            >
                                <svg
                                    className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        )}
                        <a
                            href={`#${item.id}`}
                            className={`font-bold font-optima text-[17px] block py-1 truncate transition-colors duration-200 ${isActive ? 'text-blue-600 font-bold dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleTocClick(item.id);
                            }}
                        >
                            {item.text}
                        </a>
                    </div>

                    {hasChildItems && isExpanded && (
                        <ul className="mt-1 border-l border-gray-200 dark:border-gray-700">
                            {getChildren(item).map(child => renderTocItem(child, true))}
                        </ul>
                    )}
                </li>
            );
        }, [activeId, expandedIds, maxInitialLevel, hasChildren, getChildren, toggleExpand, handleTocClick]);

        // 优化桌面端悬浮目录
        const DesktopToc = useMemo(() => {
            // 获取顶层目录项
            const topLevelItems = toc.filter(item => item.level === 1);

            return (
                <nav
                    className="select-none hidden md:block fixed top-24 right-3 w-64 overflow-auto max-h-[70vh] bg-background shadow-lg rounded-lg p-4 z-50 border border-gray-200 dark:border-gray-700 opacity-75 overflow-y-auto scrollbar-none"
                    style={{
                        // 使用 transform3d 开启硬件加速
                        transform: 'translate3d(0, 0, 0)',
                        willChange: 'transform'
                    }}
                >
                    <div
                        className="font-bold text-[20px] mt-2 mb-2 text-gray-700 dark:text-gray-300 flex items-center">
                        <span>目录</span>
                        {parentItemIds.length > 0 && (
                            <button
                                onClick={handleToggleAll}
                                className="text-[16px] text-gray-500 hover:text-blue-500 ml-5 focus:outline-none"
                            >
                                {isAnyParentExpanded ? '收起全部' : '展开全部'}
                            </button>
                        )}
                    </div>
                    <ul className="space-y-1">
                        {topLevelItems.length > 0
                            ? topLevelItems.map(item => renderTocItem(item))
                            : toc.filter(item => item.level <= maxInitialLevel).map(item => renderTocItem(item))
                        }
                    </ul>
                </nav>
            );
        }, [renderTocItem, maxInitialLevel, parentItemIds, isAnyParentExpanded, handleToggleAll]);

        // 优化移动端底部下拉目录
        const MobileToc = useMemo(() => (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <button
                    onClick={() => setIsTocOpen(!isTocOpen)}
                    className="w-full bg-blue-600 text-white py-2 text-center font-semibold shadow-md"
                    style={{
                        // 使用 transform3d 开启硬件加速
                        transform: 'translate3d(0, 0, 0)'
                    }}
                >
                    {isTocOpen ? "关闭目录" : "查看目录"}
                </button>
                {isTocOpen && (
                    <nav
                        className="bg-white dark:bg-gray-800 shadow-lg max-h-[50vh] overflow-auto p-4 border-t border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                        style={{
                            // 使用 transform3d 开启硬件加速
                            transform: 'translate3d(0, 0, 0)',
                            willChange: 'transform'
                        }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-700 dark:text-gray-300">目录</span>
                            {parentItemIds.length > 0 &&
                                <button
                                    onClick={handleToggleAll}
                                    className="text-xs text-gray-500 hover:text-blue-500 focus:outline-none"
                                >
                                    {isAnyParentExpanded ? '收起全部' : '展开全部'}
                                </button>
                            }
                        </div>
                        <ul>
                            {toc.filter(item => item.level === 1).length > 0
                                ? toc.filter(item => item.level === 1).map(item => renderTocItem(item))
                                : toc.filter(item => item.level <= maxInitialLevel).map(item => renderTocItem(item))
                            }
                        </ul>
                    </nav>
                )}
            </div>
        ), [renderTocItem, maxInitialLevel, parentItemIds, isAnyParentExpanded, handleToggleAll]);

        return (
            <>
                {DesktopToc}
                {MobileToc}
            </>
        );
    };

    // 获取文章数据
    const getArticle = useCallback(() => {
        getArticleById(id, false)
            .then((res) => {
                if (!common.isEmpty(res.data)) {
                    setArticle(res.data);
                    setMarkdownText(res.data.articleContent);
                    getNews();
                }
            })
    }, [common, id]);

    // 获取最新进展
    const getNews = useCallback(() => {
        const pagination: page & { source: string | null } = {
            pageNumber: 1,
            pageSize: 9999,
            source: id
        }

        getNewList(pagination)
            .then((res) => {
                const data = res.data;
                if (!common.isEmpty(data)) {
                    const processedRecords = data.records.map((c: weiYan) => ({
                        ...c,
                        // 图片正则
                        content: common.pictureReg(
                            // 表情正则
                            common.faceReg(
                                c.content
                                    // 换行替换
                                    .replace(/\n{2,}/g, '<div style="height: 12px"></div>')
                                    .replace(/\n/g, "<br/>")
                            )
                        ),
                    }));
                    setWeiYanList(processedRecords);
                }
            })
    }, [common, id]);

    // 删除树洞
    const handleDeleteTreeHole = useCallback((id: number | null) => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
        }

        Modal.confirm({
            title: "提示",
            content: "确认删除？",
            type: "success",
            centered: true,
            onOk() {
                deleteWeiYan(id)
                    .then(() => {
                        message.success("删除成功!").then();
                        getNews();
                    })
            },
            onCancel: () => {
                message.success("已取消删除!").then();
            },
        });
    }, [common, state.currentUser, getNews]);

    // 提交微言
    const submitWeiYan = useCallback(async (content: string) => {
        const param: weiYan = {
            id: null,
            content,
            createTime: newsTime,
            source: id,
        }
        saveNews(param)
            .then(() => {
                setWeiYanDialogVisible(false);
                setNewsTime("");
                getNews();
            })
    }, [newsTime, id, getNews]);

    if (!article) return null;

    return (
        <article className="bg-background mx-auto">
            {/* 封面 */}
            <div className="h-[280px] relative animate-slide-top overflow-hidden">
                {(!common.isEmpty(article.articleCover) && (
                    <img
                        src={article.articleCover || ""}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                        alt={"文章封面"}
                    />
                )) || (
                    <div slot="error" className="w-full h-full">
                        <div className="absolute w-full h-full bg-miniMask conent-['']"></div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"/>

                {/* 文章信息 */}
                <div
                    className="relative z-10 max-w-4xl mx-auto h-full flex flex-col justify-end pb-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-3xl sm:text-4xl font-semibold text-white drop-shadow-md">
                        {article.articleTitle}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-200 space-x-4 select-none flex-wrap">
                        {/* 作者 */}
                        <div className="flex items-center space-x-1">
                            <svg
                                height="14"
                                style={{verticalAlign: "-2px"}}
                                viewBox="0 0 1024 1024"
                                width="14"
                            >
                                <path
                                    d="M510.4 65.5l259.69999999 0 1e-8 266.89999999c0 147.50000001-116.2 266.89999999-259.7 266.90000001-143.4 0-259.7-119.5-259.7-266.90000001 0.1-147.5 116.3-266.9 259.7-266.89999999z"
                                    fill="#FF9FCF"
                                ></path>
                                <path
                                    d="M698.4 525.2l-13 0c53-48.4 86.5-117.8 86.5-195.20000001 0-10.2-0.7-20.3-1.8-30.19999999C613.8 377.50000001 438.6 444.9 266 437.7c15 33.4 36.7 63.1 63.5 87.5l-5.3 0c-122.6 0-225.5 88.1-248.8 204.1C340 677.2 597.7 609.2 862.2 585.7c-44.3-37.6-101.5-60.5-163.8-60.5z"
                                    fill="#FF83BB"
                                ></path>
                                <path
                                    d="M862.2 585.7C597.7 609.2 340 677.2 75.4 729.3c-3.2 16.1-5 32.6-5 49.6 0 99.8 81.7 181.5 181.5 181.5l518.6 0c99.8 0 181.5-81.7 181.5-181.5 0.1-77.2-35-146.5-89.8-193.2z"
                                    fill="#FF5390"
                                ></path>
                                <path
                                    d="M770.1 299.8C755.1 168 643.3 65.5 507.4 65.5c-146.1 0-264.5 118.4-264.5 264.5 0 38.4 8.3 74.8 23.1 107.7 172.6 7.2 347.8-60.2 504.1-137.9z"
                                    fill="#FF9FCF"
                                ></path>
                                <path
                                    d="M436.4 282.1c0 24.1-19.6 43.7-43.7 43.7S349 306.2 349 282.1s19.6-43.7 43.7-43.7c24.19999999 0 43.7 19.6 43.7 43.7z"
                                    fill="#FFFFFF"
                                ></path>
                                <path
                                    d="M625 282.1m-43.7 0a43.7 43.7 0 1 0 87.4 0 43.7 43.7 0 1 0-87.4 0Z"
                                    fill="#FFFFFF"
                                ></path>
                            </svg>
                            <span className="flex items-center">{article.username}</span>
                        </div>
                        <span>·</span>

                        {/* 创建时间 */}
                        <div className="flex items-center space-x-1">
                            <svg
                                height="14"
                                style={{verticalAlign: "-2px"}}
                                viewBox="0 0 1024 1024"
                                width="14"
                            >
                                <path
                                    d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
                                    fill="#409EFF"
                                ></path>
                                <path
                                    d="M654.222222 256c-17.066667 0-28.444444 11.377778-28.444444 28.444444v56.888889c0 17.066667 11.377778 28.444444 28.444444 28.444445s28.444444-11.377778 28.444445-28.444445v-56.888889c0-17.066667-11.377778-28.444444-28.444445-28.444444zM369.777778 256c-17.066667 0-28.444444 11.377778-28.444445 28.444444v56.888889c0 17.066667 11.377778 28.444444 28.444445 28.444445s28.444444-11.377778 28.444444-28.444445v-56.888889c0-17.066667-11.377778-28.444444-28.444444-28.444444z"
                                    fill="#FFFFFF"
                                ></path>
                                <path
                                    d="M725.333333 312.888889H711.111111v28.444444c0 31.288889-25.6 56.888889-56.888889 56.888889s-56.888889-25.6-56.888889-56.888889v-28.444444h-170.666666v28.444444c0 31.288889-25.6 56.888889-56.888889 56.888889s-56.888889-25.6-56.888889-56.888889v-28.444444h-14.222222c-22.755556 0-42.666667 19.911111-42.666667 42.666667v341.333333c0 22.755556 19.911111 42.666667 42.666667 42.666667h426.666666c22.755556 0 42.666667-19.911111 42.666667-42.666667v-341.333333c0-22.755556-19.911111-42.666667-42.666667-42.666667zM426.666667 654.222222h-56.888889c-17.066667 0-28.444444-11.377778-28.444445-28.444444s11.377778-28.444444 28.444445-28.444445h56.888889c17.066667 0 28.444444 11.377778 28.444444 28.444445s-11.377778 28.444444-28.444444 28.444444z m227.555555 0h-56.888889c-17.066667 0-28.444444-11.377778-28.444445-28.444444s11.377778-28.444444 28.444444-28.444444h56.888889c17.066667 0 28.444444 11.377778 28.444445 28.444445s-11.377778 28.444444-28.444445 28.444444z m0-113.777778h-56.888889c-17.066667 0-28.444444-11.377778-28.444444-28.444444s11.377778-28.444444 28.444444-28.444444h56.888889c17.066667 0 28.444444 11.377778 28.444445 28.444444s-11.377778 28.444444-28.444445 28.444444z"
                                    fill="#FFFFFF"
                                ></path>
                            </svg>
                            <span>{article.createTime}</span>
                        </div>
                        <span>·</span>

                        {/* 浏览量 */}
                        <div className="flex items-center space-x-1">
                            <svg
                                height="14"
                                style={{verticalAlign: "-2px"}}
                                viewBox="0 0 1024 1024"
                                width="14"
                            >
                                <path
                                    d="M14.656 512a497.344 497.344 0 1 0 994.688 0 497.344 497.344 0 1 0-994.688 0z"
                                    fill="#FF0000"
                                ></path>
                                <path
                                    d="M374.976 872.64c-48.299-100.032-22.592-157.44 14.421-211.37 40.448-58.966 51.115-117.611 51.115-117.611s31.659 41.386 19.115 106.005c56.149-62.72 66.816-162.133 58.325-200.405 127.317 88.746 181.59 281.002 108.181 423.381C1016 652.501 723.093 323.2 672.277 285.867c16.939 37.333 20.054 100.032-14.101 130.474-58.027-219.84-201.664-265.002-201.664-265.002 16.96 113.536-61.781 237.397-137.344 330.24-2.816-45.163-5.632-76.544-29.483-119.808-5.333 82.176-68.373 149.269-85.29 231.445-22.912 111.637 17.237 193.173 170.581 279.424z"
                                    fill="#FFFFFF"
                                ></path>
                            </svg>
                            <span>{article.viewCount}</span>
                        </div>
                        <span>·</span>

                        {/* 评论数 */}
                        <div className="flex items-center space-x-1">
                            <svg
                                height="14"
                                style={{verticalAlign: "-2px"}}
                                viewBox="0 0 1024 1024"
                                width="14"
                            >
                                <path
                                    d="M113.834667 291.84v449.194667a29.013333 29.013333 0 0 0 28.842666 29.013333h252.928v90.453333l160.597334-90.453333h252.928a29.013333 29.013333 0 0 0 29.013333-29.013333V291.84a29.013333 29.013333 0 0 0-29.013333-29.013333h-665.6a29.013333 29.013333 0 0 0-29.696 29.013333z"
                                    fill="#FFDEAD"
                                ></path>
                                <path
                                    d="M809.130667 262.826667h-665.6a29.013333 29.013333 0 0 0-28.842667 29.013333v40.106667a29.013333 29.013333 0 0 1 28.842667-29.013334h665.6a29.013333 29.013333 0 0 1 29.013333 29.013334V291.84a29.013333 29.013333 0 0 0-29.013333-29.013333z"
                                    fill="#FFF3DB"
                                ></path>
                                <path
                                    d="M556.202667 770.048h252.928a29.013333 29.013333 0 0 0 29.013333-29.013333V362.837333s-59.733333 392.533333-724.309333 314.709334v63.488a29.013333 29.013333 0 0 0 28.842666 29.013333h253.098667v90.453333z"
                                    fill="#F2C182"
                                ></path>
                                <path
                                    d="M619.008 632.32l101.888-35.157333-131.754667-76.117334 29.866667 111.274667zM891.904 148.992a61.44 61.44 0 0 0-84.138667 22.528l-19.968 34.133333 106.666667 61.610667 19.968-34.133333a61.781333 61.781333 0 0 0-22.528-84.138667z"
                                    fill="#69BAF9"
                                ></path>
                                <path
                                    d="M775.338667 198.775467l131.669333 76.032-186.026667 322.218666-131.6864-76.032z"
                                    fill="#F7FBFF"
                                ></path>
                                <path
                                    d="M775.168 198.826667l-5.290667 9.216 59.221334 34.133333a34.133333 34.133333 0 0 1 12.458666 46.592l-139.946666 242.346667a34.133333 34.133333 0 0 1-46.762667 12.629333l-59.050667-34.133333-6.656 11.434666 88.746667 51.2L720.896 597.333333l186.026667-322.56z"
                                    fill="#D8E3F0"
                                ></path>
                                <path
                                    d="M616.448 622.592l2.56 9.728 101.888-35.157333-44.885333-25.941333-59.562667 51.370667zM891.904 148.992c-1.024 0-2.218667-0.853333-3.242667-1.536A61.610667 61.610667 0 0 1 887.466667 204.8l-19.968 34.133333-73.728-42.496-5.12 8.704 106.666666 61.610667 19.968-34.133333a61.781333 61.781333 0 0 0-23.381333-83.626667z"
                                    fill="#599ED4"
                                ></path>
                                <path
                                    d="M265.898667 417.621333H494.933333a17.066667 17.066667 0 1 0 0-34.133333H265.898667a17.066667 17.066667 0 1 0 0 34.133333zM265.898667 533.504H494.933333a17.066667 17.066667 0 0 0 0-34.133333H265.898667a17.066667 17.066667 0 0 0 0 34.133333z"
                                    fill="#3D3D63"
                                ></path>
                                <path
                                    d="M959.488 354.645333a99.84 99.84 0 0 0-23.722667-127.488 78.677333 78.677333 0 0 0-142.848-64.170666l-11.605333 20.138666a17.066667 17.066667 0 0 0-20.821333 7.168l-32.085334 55.466667H142.677333a46.250667 46.250667 0 0 0-45.909333 46.08v449.194667a46.08 46.08 0 0 0 45.909333 46.08h236.032v73.386666a17.066667 17.066667 0 0 0 8.362667 14.848 17.066667 17.066667 0 0 0 8.704 2.218667 17.066667 17.066667 0 0 0 8.362667-2.218667l156.672-88.234666h248.32a46.08 46.08 0 0 0 46.08-46.08V398.677333L921.6 283.306667a17.066667 17.066667 0 0 0-4.266667-21.504l1.877334-3.413334a65.365333 65.365333 0 0 1 10.410666 79.189334l-53.077333 91.989333a56.832 56.832 0 0 0 20.821333 77.653333 17.066667 17.066667 0 0 0 24.234667-6.314666 17.066667 17.066667 0 0 0-6.997333-23.04 23.04 23.04 0 0 1-8.362667-31.061334z m-138.410667 386.389334a11.946667 11.946667 0 0 1-11.946666 11.946666H556.202667a17.066667 17.066667 0 0 0-8.362667 2.218667l-134.997333 76.117333v-61.269333a17.066667 17.066667 0 0 0-17.066667-17.066667H142.677333a11.946667 11.946667 0 0 1-11.776-11.946666V291.84a11.946667 11.946667 0 0 1 11.776-11.946667h565.930667L574.464 512a17.066667 17.066667 0 0 0-1.706667 12.970667L597.333333 615.253333H265.898667a17.066667 17.066667 0 1 0 0 34.133334h352.938666a17.066667 17.066667 0 0 0 5.802667 0l102.4-35.328a17.066667 17.066667 0 0 0 9.216-7.509334l85.333333-147.968z m-204.8-184.661334l63.829334 36.864-49.322667 17.066667z m206.848-170.666666v1.365333l-108.373333 186.709333-102.4-59.050666L781.482667 221.866667l102.4 59.050666z m76.458667-161.28L887.466667 244.224l-76.970667-44.373333 11.264-19.797334a44.544 44.544 0 1 1 77.141333 44.544z"
                                    fill="#3D3D63"
                                ></path>
                            </svg>
                            <span>{article.commentCount}</span>
                        </div>
                        <span>·</span>

                        {/* 点赞数 */}
                        <div className="flex items-center space-x-1">
                            <svg
                                height="14"
                                style={{verticalAlign: "-2px"}}
                                viewBox="0 0 1024 1024"
                                width="14"
                            >
                                <path
                                    d="M510.671749 348.792894S340.102978 48.827055 134.243447 254.685563C-97.636714 486.565724 510.671749 913.435858 510.671749 913.435858s616.107079-419.070494 376.428301-658.749272c-194.095603-194.096626-376.428302 94.106308-376.428301 94.106308z"
                                    fill="#FF713C"
                                ></path>
                                <path
                                    d="M510.666632 929.674705c-3.267417 0-6.534833-0.983397-9.326413-2.950192-16.924461-11.872399-414.71121-293.557896-435.220312-529.448394-5.170766-59.482743 13.879102-111.319341 56.643068-154.075121 51.043536-51.043536 104.911398-76.930113 160.095231-76.930114 112.524796 0 196.878996 106.48115 228.475622 153.195078 33.611515-45.214784 122.406864-148.20646 234.04343-148.20646 53.930283 0 105.46603 24.205285 153.210428 71.941496 45.063335 45.063335 64.954361 99.200326 59.133795 160.920016C935.306982 641.685641 536.758893 915.327952 519.80271 926.859589a16.205077 16.205077 0 0 1-9.136078 2.815116zM282.857183 198.75574c-46.253440 0-92.396363 22.682605-137.127124 67.413365-36.149315 36.157501-51.614541 78.120218-47.25321 128.291898 17.575284 202.089671 352.199481 455.119525 412.332023 499.049037 60.434417-42.86732 395.406538-289.147446 414.567947-492.458945 4.933359-52.344159-11.341303-96.465029-49.759288-134.88199-41.431621-41.423435-85.24243-62.424748-130.242319-62.424748-122.041544 0-220.005716 152.203494-220.989114 153.742547-3.045359 4.806469-8.53335 7.883551-14.101159 7.534603a16.257266 16.257266 0 0 1-13.736863-8.184403c-0.902556-1.587148-91.569532-158.081365-213.690893-158.081364z"
                                    fill="#885F44"
                                ></path>
                            </svg>
                            <span>{article.likeCount}</span>
                        </div>
                        <span>·</span>
                        {/* 字数和阅读时间 */}
                        <div className="flex items-center space-x-1">
                            <span>
                                {`文章 ${readingStats.wordCount} 字, 预计阅读 ${readingStats.readingTime} 分钟`}
                            </span>
                        </div>
                    </div>
                </div>
                {!common.isEmpty(state.currentUser) &&
                    state.currentUser.id === article.userId && (
                        <div
                            className="absolute bottom-[10px] right-[20%] z-[10] cursor-pointer animate-scale-1-infinite"
                            onClick={() => setWeiYanDialogVisible(true)}
                        >
                            <svg height="30" viewBox="0 0 1024 1024" width="30">
                                <path
                                    d="M0 0h1024v1024H0V0z"
                                    fill="#202425"
                                    opacity=".01"
                                ></path>
                                <path
                                    d="M989.866667 512c0 263.918933-213.947733 477.866667-477.866667 477.866667S34.133333 775.918933 34.133333 512 248.081067 34.133333 512 34.133333s477.866667 213.947733 477.866667 477.866667z"
                                    fill="#FF7744"
                                ></path>
                                <path
                                    d="M512 221.866667A51.2 51.2 0 0 1 563.2 273.066667v187.733333H750.933333a51.2 51.2 0 0 1 0 102.4h-187.733333V750.933333a51.2 51.2 0 0 1-102.4 0v-187.733333H273.066667a51.2 51.2 0 0 1 0-102.4h187.733333V273.066667A51.2 51.2 0 0 1 512 221.866667z"
                                    fill="#FFFFFF"
                                ></path>
                            </svg>
                        </div>
                    )}
            </div>

            {/* 文章内容 */}
            <div className="bg-background container mx-auto px-1 py-4 lg:py-10 lg:px-10">
                <div className="my-0 m-auto py-10 px-5  animate-slide-bottom">
                    {/* 最新进展 */}
                    {!common.isEmpty(weiYanList) && (
                        <div className="mt-0 mx-0 mb-10">
                            <Collapse
                                accordion
                                ghost
                                expandIcon={() => null}
                                defaultActiveKey={["1"]}
                                className="border-0 mb-4 bg-background"
                                items={[{
                                    key: "1",
                                    label: (
                                        <div
                                            className="font-optima border-0 text-[20px] bg-background text-lightGreen"
                                        >
                                            最新进展
                                        </div>
                                    ),
                                    children: (
                                        <Process
                                            treeHoleList={weiYanList}
                                            onDeleteTreeHole={handleDeleteTreeHole}
                                        />
                                    )
                                }]}
                            />
                            <hr
                                className="
      relative
      mx-auto
      mt-[10px]
      mb-[60px]
      w-full
      border-2
      border-dashed
      border-lightGreen
      overflow-visible
      before:content-['❄']
      before:absolute
      before:top-[-17px]
      before:left-[2%]
      before:text-2xl
      before:leading-[1]
      before:text-lightGreen
      before:transition-all-1s
      hover:before:left-[calc(95%-20px)]
    "
                            />
                        </div>
                    )}

                    {/* 文章内容 */}
                    <div className={`relative dark:prose-invert`}>
                        <div>
                            <Markdown markdownText={markdownText}></Markdown>
                        </div>
                    </div>

                    {/* 最后更新时间 */}
                    <div className="font-optima text-sm text-gray-500 mt-4">
                        文章最后更新于 {article.updateTime}
                    </div>

                    {/* 分类 */}
                    <div className="mt-4 mb-3">
            <span
                className="font-optima text-blue-500 cursor-pointer"
                onClick={() =>
                    navigate(
                        `/sort?sortId=${article.sortId}&labelId=${article.labelId}`
                    )
                }
            >
              {article.sort?.sortName} ▶ {article.label?.labelName}
            </span>
                    </div>

                    {/* 作者信息 */}
                    <blockquote
                        className="font-optima border-l-4 border-sky-400 bg-sky-50 rounded px-4 py-3 text-gray-700 text-sm">
                        <div>作者：{article.username}</div>
                        <div>版权声明：转载请注明文章出处</div>
                    </blockquote>

                    {/* 评论 */}
                    {article.commentStatus && (
                        <Comment
                            source={article.id!}
                            type="article"
                            userId={article.userId!}
                        />
                    )}
                </div>
            </div>
            {/*目录*/}
            <Toc/>

            <div className="bg-background">
                <Footer/>
            </div>

            {/* 最新进展弹窗 */}
            <Modal
                title={<span className='font-custom text-base'>最新进展</span>}
                open={weiYanDialogVisible}
                onCancel={() => setWeiYanDialogVisible(false)}
                footer={null}
                style={{textAlign: 'center'}}
                destroyOnClose
                width={400}
                centered
            >
                <div className="flex justify-center items-center text-center mb-5">
                    <DatePicker
                        format={{
                            format: "YYYY-MM-DD HH:mm:ss",
                            type: 'mask'
                        }}
                        placeholder="选择日期时间"
                        onChange={(_, dateString) => setNewsTime(dateString.toString())}
                    />
                </div>
                <CommentBox disableGraffiti={true} onSubmitComment={submitWeiYan}/>
            </Modal>
        </article>
    );
}
