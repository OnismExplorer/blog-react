import React, {useEffect, useRef, useState} from "react";
import {page} from "@type/page";
import {article} from "@type/article";
import {sort} from "@type/sort";
import {useAppContext} from "@hooks/useAppContext";
import {useStore} from "@hooks/useStore";
import {Avatar, Modal} from "antd";
import {CalendarIcon, FolderOpen, Star} from "lucide-react";
import {GiOpenBook} from "react-icons/gi";
import {useNavigate} from "react-router-dom";
import Image from "@components/common/image";
import {webInfo} from "@type/webInfo";
import {getArticleList} from "@api/article";
import {handleGetMusic} from "@api/webInfo";
import MusicCover from "@components/music/musicCover";
import {music} from "../type/webInfo";

interface Pagination extends page {
    recommendStatus: boolean;
}


interface AsideProps {
    onSelectSort?: (sort: sort) => void;
    onSelectArticle?: (articleSearch: string) => void;
}

const MyAside: React.FC<AsideProps> = ({
                                           onSelectSort,
                                           onSelectArticle
                                       }) => {
    const {common, constant} = useAppContext();
    // 推荐文章
    const [recommendArticles, setRecommendArticles] = useState<article[]>([])
    const [showAdmireDialog, setShowAdmireDialog] = useState<boolean>(false)
    const store = useStore();
    const [sortInfo, setSortInfo] = useState<sort[]>(store.state.sortInfo);
    const [webInfo, setWebInfo] = useState<webInfo>(store.state.webInfo);
    const navigate = useNavigate();
    const [isImgError, setIsImgError] = useState<boolean>(false);
    const [articleSearch, setArticleSearch] = useState<string>("");

    // 是否在播放
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    // 当前音乐
    const [currentMusic, setCurrentMusic] = useState<music>({
        title: "",
        author: "",
        cover: "",
        url: ""
    });
    // 当前播放时间
    const [currentTime, setCurrentTime] = useState<number>(0)
    // 音乐时长
    const [audioDuration, setAudioDuration] = useState<number>(0)
    // 最后播放时长
    const [lastPlayTime, setLastPlayTime] = useState<number>(0)
    // 播放按钮图片
    const [playButtonImage, setPlayButtonImage] = useState<string>(constant.playMusicImage)
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    // 音乐封面动画方向
    const [coverDirection, setCoverDirection] = useState<'left' | 'right'>('right')

    useEffect(() => {
        setSortInfo(store.state.sortInfo);
        setWebInfo(store.state.webInfo);
        // 获取文章
        getRecommendArticles();
    }, []);


    const handleSelectSort = (sort: sort) => {
        if (onSelectSort) {
            onSelectSort(sort);
        }
    }

    // 处理文章搜索
    const handleSearch = () => {
        if (onSelectArticle) {
            onSelectArticle(articleSearch);
        }
    }

    const getRecommendArticles = () => {
        // 封装参数
        const pagitation: Pagination = {
            pageNumber: 1,
            pageSize: 5,
            recommendStatus: true
        }

        // 发送请求
        getArticleList(pagitation, 'user')
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setRecommendArticles(result.records);
                }
            })
    }

    // 前往微言
    const forwardWeiYan = () => {
        window.location.replace("/weiYan");
    }

    /**
     * 获取音乐
     */
    const getMusic = async () => {
        // 调用上面定义的函数，拿到公共响应结构
        const result = await handleGetMusic();
        setCurrentMusic(result.data);
    }

    // 更新音乐总时间
    const updateAudioDuration = () => {
        const audio = audioRef.current;
        if (audio) {
            setAudioDuration(audio.duration);
        }
    }

    // 初始化/更新音乐数据
    useEffect(() => {
        getMusic().then();
        const audio = audioRef.current
        if (audio) {
            setCurrentTime(audio.currentTime)
            setAudioDuration(audio.duration)
            audio.addEventListener("loadedmetadata", updateAudioDuration)
            playSong();
            return () => {
                audio.removeEventListener("loadedmetadata", updateAudioDuration)
            }
        }
    }, []);

    const playMusic = async () => {
        await getMusic();
        playSong();
    }

    // 开始播放
    const playSong = () => {
        const audio = audioRef.current;
        if (audio && !common.isEmpty(currentMusic.url)) {
            // 如果有上次播放时间，则直接跳转至上次播放时间继续播放
            audio.src = currentMusic.url;
            if (lastPlayTime > 0) {
                audio.currentTime = lastPlayTime;
                setLastPlayTime(0);
            }
            audio.oncanplaythrough = () => {
                // 防止多次触发事件
                audio.oncanplaythrough = null
                audio.play().then(() => {
                    setIsPlaying(true);
                    setPlayButtonImage(constant.pauseMusicImage);
                }).catch(() => playMusic()) // 跳过无法播放的音乐，播放下一首
            };
            audio.onerror = () => playMusic();  // 跳过无法播放的音乐，播放下一首
            audio.onended = () => playMusic();

            audio.load(); // 主动加载音乐以触发时间
        }
    }

    // 暂停播放
    const pauseSong = () => {
        const audio = audioRef.current;
        if (audio) {
            // 记录暂停时的播放时间
            setLastPlayTime(audio.currentTime);
            audio.pause();
            setIsPlaying(false);
            // 设置播放按钮图片
            setPlayButtonImage(constant.playMusicImage);
        }
    }

    // 切换播放状态：暂停/播放
    const togglePlay = () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    // 更新当前时间
    const updateCurrentTime = (event: React.SyntheticEvent<HTMLAudioElement>) => {
        if (!isSeeking) {
            const target = event.currentTarget;
            setCurrentTime(target.currentTime);
        }
    };

    return (
        <aside className="space-y-10 select-none p-3">
            {/*网站信息*/}
            <div
                className="flex animate-gradientBG flex-col items-center rounded-[10px] relative overflow-hidden transition-all duration-300 shadow-article hover:shadow-article-hover"
                style={{
                    background: 'linear-gradient(-45deg, #e8d8b9, #eccec5, #a3e9eb, #bdbdf0, #eec1ea)',
                    backgroundSize: '400% 400%'
                }}
            >
                <Avatar
                    size={120}
                    src={webInfo.avatar}
                    className="mt-5 cursor-pointer select-none transition-all duration-300 hover:rotate-[360deg]"
                />
                <div className="z-10 text-2xl font-bold mx-0 my-5">{webInfo.webName}</div>
                <div className="z-10 w-[80%] flex flex-row justify-around">
                    <div className="z-10 flex flex-col items-center justify-around">
                        <span>文章</span>
                        <span className="mt-3">{store.getters.articleTotal}</span>
                    </div>
                    <div className="z-10 flex flex-col items-center justify-around">
                        <span>分类</span>
                        <span className="mt-3">{sortInfo.length}</span>
                    </div>
                    <div className="z-10 flex flex-col items-center justify-around">
                        <span>访问量</span>
                        <span className="mt-3">{webInfo.historyAllCount}</span>
                    </div>
                </div>
                <a
                    className="relative mt-3 mb-6 w-[65%] h-[35px] rounded-[1rem] text-white cursor-pointer overflow-hidden z-[1] bg-lightGreen
             flex items-center justify-center gap-x-1
             before:content-[''] before:absolute before:inset-0 before:rounded-[1rem] before:z-[-1] before:bg-gradualRed
             before:scale-x-0 before:origin-left before:transition-transform before:duration-[500ms]
             before:ease-[cubic-bezier(0.45,1.64,0.47,0.66)]
             hover:before:scale-x-100"
                    onClick={forwardWeiYan}
                >
                    <Star className="w-4 h-4"/>
                    微言
                </a>
            </div>

            {/*搜索*/}
            <div
                className="p-4 rounded-[10px] mt-10 animate-hideToShow transition-all duration-300 shadow-article hover:shadow-article-hover">
                <div className="text-lightGreen text-base font-bold mb-3">搜索</div>
                <div className="flex">
                    <input
                        className="py-0 px-4 h-8 w-[calc(100%-50px)] outline-none border-2 border-lightGreen border-r-0 rounded-l-[40px] text-maxGreyFont bg-white"
                        type="text"
                        value={articleSearch}
                        onChange={(e) => setArticleSearch(e.target.value)}
                        placeholder="搜索文章"
                        maxLength={32}
                    />
                    <div
                        className="h-8 w-[50px] border-2 border-lightGreen border-l-0 rounded-r-[40px] bg-white cursor-pointer"
                        onClick={handleSearch}>
                        <svg style={{marginTop: "3.5px", marginLeft: "18px"}} viewBox="0 0 1024 1024" width="20"
                             height="20">
                            <path
                                d="M51.2 508.8c0 256.8 208 464.8 464.8 464.8s464.8-208 464.8-464.8-208-464.8-464.8-464.8-464.8 208-464.8 464.8z"
                                fill="#51C492"></path>
                            <path
                                d="M772.8 718.4c48-58.4 76.8-132.8 76.8-213.6 0-186.4-151.2-337.6-337.6-337.6-186.4 0-337.6 151.2-337.6 337.6 0 186.4 151.2 337.6 337.6 337.6 81.6 0 156-28.8 213.6-76.8L856 896l47.2-47.2-130.4-130.4zM512 776c-149.6 0-270.4-121.6-270.4-271.2S363.2 233.6 512 233.6c149.6 0 271.2 121.6 271.2 271.2C782.4 654.4 660.8 776 512 776z"
                                fill="#FFFFFF"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/*推荐文章*/}
            {!common.isEmpty(recommendArticles) && (
                <div className="p-6 rounded-[10px] mt-10 animate-hideToShow shadow-article">
                    <div className="text-[18px] mb-5 flex flex-row items-center gap-x-1">
                        <GiOpenBook className="text-red-500 mr-[5px] animate-scale-1.5-infinite" size={30}/>
                        <span>推荐文章</span>
                    </div>
                    {recommendArticles.map((article, index) => (
                        <div className="cursor-pointer"
                             key={index}
                             onClick={() => navigate(`/article?id=${article.id}`)}
                        >
                            <div className="flex cursor-pointer">
                                <div className="w-2/5 rounded-[0.2rem] mr-2 overflow-hidden">
                                    {!isImgError ? (
                                        <Image lazy
                                               draggable={false}
                                               zoomable={false}
                                               title={article.articleTitle}
                                               src={article.articleCover}
                                               onError={() => setIsImgError(true)}
                                        />
                                    ) : (
                                        <div slot="error" className="w-full h-full">
                                            <div
                                                className="bg-themeBackground text-white p-[10px] text-center w-full h-full">
                                                {article.username}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="w-3/5 whitespace-nowrap text-ellipsis overflow-hidden text-center">
                                    {article.articleTitle}
                                </div>
                            </div>
                            <div className="mt-2 mb-5 text-greyFont text-sm flex gap-x-1 items-center">
                                <CalendarIcon size={20}/>
                                <span>{article.createTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/*赞赏*/}
            <div
                className="shadow-box-mini bg-springBg flex flex-col bg-no-repeat bg-cover bg-center p-[25px] rounded-[10px] animate-hideToShow mt-10 ">
                <div className="font-bold mb-5 text-right text-base font-comic lg:h-[250px] max-md:h-[300px]">联系方式
                </div>
                <div
                    className="px-[10px] py-[10px] bottom-0 bg-maxLightRed rounded-[3rem] w-[56px] text-white cursor-pointer text-center mt-[50px] mx-auto transition-all duration-1000 hover:scale-125"
                    onClick={() => setShowAdmireDialog(true)}>打赏
                </div>
            </div>

            {/*赞赏对话框*/}
            <Modal
                open={showAdmireDialog}
                onCancel={() => setShowAdmireDialog(false)}
                title={<span className="font-comic text-[20px] sm:text-[24px]">赞赏码</span>}
                width="100%"
                footer={null}
                centered
                destroyOnClose
                style={{textAlign: "center"}}
                className="max-w-[95vw] sm:max-w-[500px]"
            >
                <div
                    className="aspect-[1]  w-2/3 mt-0 mb-2.5 mx-auto rounded-[10px] bg-admireImage bg-no-repeat bg-cover bg-center"></div>
                <div className="text-sm text-maxGreyFont leading-normal m-[5px]">感谢老铁送来的 666</div>
                <div className="text-sm text-maxGreyFont leading-normal m-[5px]">如有侵权行为，请及时联系博主删除和修改
                </div>
            </Modal>

            {/*速览*/}
            {sortInfo.map((sort, index) => (
                <div key={index} style={{background: constant.sortColor[index % constant.sortColor.length]}}
                     onClick={() => handleSelectSort(sort)}
                     className="shadow-box-mini relative pt-5 px-[25px] pb-10 rounded-[10px] animate-hideToShow mt-10 cursor-pointer text-white">
                    <div>速览</div>
                    <div
                        className="font-bold text-lg mt-[30px] whitespace-nowrap text-ellipsis overflow-hidden after:top-[105px] after:transition-all after:duration-300 after:w-0 hover:after:w-[25px] after:left-[26px] after:h-0.5 after:bg-white after:content-[''] after:rounded-[1px] after:absolute">{sort.sortName}</div>
                    <div
                        className="font-bold mt-[15px] whitespace-nowrap text-ellipsis overflow-hidden">{sort.sortDescription}</div>
                </div>
            ))}

            {/*分类*/}
            <div className="shadow-article mt-10 pt-[25px] px-[25px] pb-[5px] rounded-[10px] animate-hideToShow">
                <div className="tex-base mb-5 flex flex-row items-center">
                    <FolderOpen className="text-red-500 mr-[5px] animate-scale-1-infinite"/>
                    <span>分类</span>
                </div>
                {sortInfo.map((sort, index) => (
                    <div key={index}
                         className="rounded-2xl mb-[15px] leading-[30px] transition-all duration-300 hover:bg-themeBackground hover:py-0.5 hover:px-[15px] hover:cursor-pointer hover:text-white"
                         onClick={() => navigate(`/sort?sortId=${sort.id}`)}>
                        {sort.sortName.split("").map((char, i) => (
                            <span key={i}>{char}</span>
                        ))}
                    </div>
                ))}
            </div>

            {/*音乐播放器*/}
            <div
                className="relative w-full max-w-[300px] m-auto p-4 rounded-lg bg-sliderTrack shadow-music-player text-center">
                <h1 className='text-lg my-3 mx-0 font-custom'>{common.isEmpty(currentMusic.title) ? 'music' : currentMusic.title + ' ' + currentMusic.author}</h1>
                <div className="ml-3 mb-3">
                    <MusicCover
                        src={currentMusic.cover}
                        size={240}
                        direction={coverDirection}
                    />
                </div>

                <input
                    type="range"
                    className="level"
                    min={0}
                    max={audioDuration}
                    value={isSeeking ? seekValue : currentTime}
                    onMouseDown={() => setIsSeeking(true)}
                    onMouseUp={(e) => {
                        const value = parseFloat((e.target as HTMLInputElement).value);
                        setCurrentTime(value);
                        audioRef.current!.currentTime = value;
                        setIsSeeking(false);
                    }}
                    onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setSeekValue(value);
                    }}
                />

                {/*按钮*/}
                <div className='flex justify-center items-center my-3 mx-0'>
                    {/*上一首*/}
                    <button onClick={() => {playMusic().then();setCoverDirection('left')}}
                            className="w-[50px] h-[50px] rounded-[50px] bg-sliderTrack shadow-music-slider border-none my-0 mx-4 active:bg-sliderTrack active:shadow-music-active-button">
                        <Image src={constant.prevMusicImage} draggable={false} zoomable={false} alt={'上一首'}/>
                    </button>
                    {/*播放键*/}
                    <button onClick={togglePlay}
                            className="w-[50px] h-[50px] rounded-[50px] bg-sliderTrack shadow-music-slider border-none my-0 mx-4 active:bg-sliderTrack active:shadow-music-active-button">
                        <Image src={playButtonImage} alt={"播放/暂停"} draggable={false} zoomable={false}/>
                    </button>
                    {/*下一首*/}
                    <button onClick={() => {playMusic().then();setCoverDirection('right')}}
                            className="w-[50px] h-[50px] rounded-[50px] bg-sliderTrack shadow-music-slider border-none my-0 mx-4 active:bg-sliderTrack active:shadow-music-active-button">
                        <Image src={constant.nextMusicImage} alt={"下一首"} draggable={false} zoomable={false}/>
                    </button>
                </div>
                <audio ref={audioRef} src={currentMusic.url} onTimeUpdate={updateCurrentTime}/>
            </div>
        </aside>
    )
}

export default MyAside
