import React, {useState, useEffect, useRef} from 'react';
import {Alert, Collapse, Avatar, message} from 'antd';
import TwoPoem from '@components/common/TwoPoem';
import Footer from '@components/common/footer';
import {useAppContext} from '@hooks/useAppContext';
import {page} from "@type/page";
import {getResourcePathList} from "@api/webInfo";
import {FunnyItem, FunnyMap, Funnys} from "@type/funny";
import {getFunnyList} from "@api/webInfo";


// 定义分页参数接口
interface Pagination extends page {
    order: string;
    desc: boolean;
    resourceType: string;
    classify: string;
}

const Funny: React.FC = () => {
    // 状态定义
    const [activeName, setActiveName] = useState<string[]>([]);
    // 获取全局上下文
    const {common} = useAppContext();
    const [funnys, setFunnys] = useState<Funnys[]>([]);
    const [funnyMap, setFunnyMap] = useState<FunnyMap>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 9999,
        order: 'title',
        desc: false,
        resourceType: 'funny',
        classify: ''
    });


    // 组件挂载时获取音乐数据
    useEffect(() => {
        getFunny();
    }, []);

    // 获取音乐分类列表
    const getFunny = () => {
        getFunnyList()
            .then((res) => {
                if (!common.isEmpty(res.data)) {
                    setFunnys(res.data);
                    // 单独设置数据
                    const map: FunnyMap = {};
                    res.data.map((item) => {
                        map[item.classify] = {
                            ...item,
                            data: [], // 初始为空
                        };
                    });
                    setFunnyMap(map);

                    changeFunny(res.data[0].classify);
                }
            })
    };

    // 获取指定分类的音乐列表
    const listFunny = () => {
        getResourcePathList(pagination,false)
            .then((res) => {
                if (!common.isEmpty(res.data) && !common.isEmpty(res.data.records)) {
                    setFunnyMap(prev => ({
                        ...prev,
                        [res.data.records[0].classify]: {
                            ...prev[res.data.records[0].classify],
                            // 更新数据
                            data: res.data.records
                        }
                    }))
                }
                setPagination(prev => ({...prev, classify: ''}));
            })
    };

    // 切换音乐分类
    const changeFunny = (classify: string) => {
        funnys.forEach(funny => {
            if (funny.classify == classify && common.isEmpty(funnyMap[classify].data)) {
                setPagination(prev => ({...prev, classify}));
                listFunny();
            }
        })
    };

    // 播放音乐
    const playSound = (funny: FunnyItem) => {
        if (!audioRef.current) {
            // 第一次，直接新建 Audio
            audioRef.current = new Audio(funny.url);
            audioRef.current.play().then(() => message.success(`正在播放 ${funny.title}`));
            return;
        }

        // 如果 src 不同，切换音源并播放（不做暂停/恢复）
        const currentSrc = audioRef.current.src;
        // 用 endsWith 或 includes 来对比相对路径
        if (!currentSrc.endsWith(funny.url)) {
            audioRef.current.src = funny.url;
            audioRef.current.load();
            audioRef.current.play().then(() => () => message.success(`正在播放 ${funny.title}`));
            return;
        }

        // 到这里说明是同一个 src，直接切换 播放 <-> 暂停
        if (audioRef.current.paused) {
            audioRef.current.play().then(() => message.success(`正在播放 ${funny.title}`));
        } else {
            audioRef.current.pause();
            message.info(`已暂停播放 ${funny.title}`).then();
        }
    };


    return (
        <div className="bg-background select-none">
            {/* 两句诗 */}
            <div className="animate-slideTop">
                <TwoPoem/>
            </div>

            <Alert
                message="温馨提示"
                description="点击封面播放音乐，再次点击暂停播放"
                type="info"
                showIcon
                className="mx-auto animate-slide-top font-comic text-[16px]"
            />

            <div className="bg-background py-10 px-0 animate-slideBottom">
                {!common.isEmpty(funnys) && (
                    <div
                        className="bg-maxMaxLightGray w-[95%] rounded-[10px] max-w-[1600px] my-0 mx-auto py-10 px-5 pb-20">
                        {funnys.map((item, index) => (
                            <div key={index}>
                                <div className="flex">
                  <span className="animate-rotate">
                    <svg viewBox="0 0 1024 1024" width="28" height="28">
                      <path
                          d="M502.272 948.224l-427.008-427.008c-1.536-1.536-1.536-3.584 0-4.608l427.008-427.008c1.536-1.536 3.584-1.536 4.608 0l427.008 427.008c1.536 1.536 1.536 3.584 0 4.608L506.88 948.224c-1.536 1.024-3.584 1.024-4.608 0z"
                          fill="#C9E6FF"
                      ></path>
                      <path
                          d="M504.32 956.416c-2.56 0-5.632-1.024-7.68-3.072l-427.008-427.008c-4.096-4.096-4.096-11.264 0-15.36L496.64 83.456c4.096-4.096 11.264-4.096 15.36 0l427.008 427.008c4.096 4.096 4.096 11.264 0 15.36L512 953.344c-2.048 2.048-4.608 3.072-7.68 3.072z m-420.864-437.76l420.864 420.864 420.864-420.864L504.32 97.28l-420.864 421.376z"
                          fill="#2E66FF"
                      ></path>
                      <path
                          d="M497.152 97.792l13.312 414.208 395.264-395.264c5.632-5.632 2.048-15.872-6.144-16.384L506.88 88.064c-5.632-0.512-9.728 4.096-9.728 9.728z"
                          fill="#FFFFFF"
                      ></path>
                      <path
                          d="M503.296 529.92l-13.824-432.128c0-4.608 1.536-9.216 5.12-12.8s7.68-5.12 12.8-5.12l392.704 12.8c7.168 0 12.8 4.608 15.36 10.752 2.56 6.656 1.024 13.312-3.584 18.432l-408.576 408.064z m1.536-432.64l12.8 396.8 382.464-382.464c0.512-0.512 0.512-1.024 0.512-2.048-0.512-0.512-1.024-1.024-1.536-1.024l-392.704-12.8c-0.512 0-1.024 0.512-1.536 0.512v1.024z"
                          fill="#2E66FF"
                      ></path>
                      <path
                          d="M522.24 946.688L508.416 532.48l-395.264 395.264c-5.632 5.632-2.048 15.872 6.144 16.384l392.704 12.8c5.632 0 10.24-4.608 10.24-10.24z"
                          fill="#FFFFFF"
                      ></path>
                      <path
                          d="M512.512 964.096h-0.512l-392.704-12.8c-7.168 0-12.8-4.608-15.36-10.752-2.56-6.656-1.024-13.312 3.584-18.432l407.552-407.552 13.824 432.128c0 4.608-1.536 9.216-5.12 12.8-2.048 3.072-6.656 4.608-11.264 4.608z m-11.264-413.696l-382.464 382.464c-0.512 0.512-0.512 1.024-0.512 2.048 0.512 0.512 1.024 1.024 1.536 1.024l392.704 12.8c0.512 0 1.024-0.512 1.536-0.512 0 0 0.512-0.512 0.512-1.536l-13.312-396.288z"
                          fill="#2E66FF"
                      ></path>
                      <path
                          d="M931.84 509.952l-414.208 13.312 395.264 395.264c5.632 5.632 15.872 2.048 16.384-6.144l12.8-392.704c0-5.632-4.608-10.24-10.24-9.728z"
                          fill="#FFB5EC"
                      ></path>
                      <path
                          d="M919.552 929.28c-4.608 0-8.704-1.536-11.776-5.12l-407.552-407.552 432.128-13.824c4.608 0 9.216 1.536 12.8 5.12s5.12 8.192 5.12 12.8l-12.8 392.704c0 7.168-4.608 12.8-10.752 15.36-3.072 0-5.12 0.512-7.168 0.512z m-384-398.848l382.464 382.464c0.512 0.512 1.024 0.512 2.048 0.512 0.512-0.512 1.024-1.024 1.024-1.536l12.8-392.704c0-0.512-0.512-1.024-0.512-1.536 0 0-1.024-0.512-1.536-0.512l-396.288 13.312z"
                          fill="#2E66FF"
                      ></path>
                      <path
                          d="M76.8 526.848l414.208-13.312-394.752-395.264c-5.632-5.632-15.872-2.048-16.384 6.144L67.072 517.12c0 5.632 4.096 10.24 9.728 9.728z"
                          fill="#FFF152"
                      ></path>
                      <path
                          d="M76.8 534.528c-4.608 0-8.704-2.048-12.288-5.12-3.584-3.584-5.12-8.192-5.12-12.8l12.8-392.704c0-7.168 4.608-12.8 10.752-15.36 6.656-2.56 13.312-1.024 18.432 3.584l407.552 407.552-432.128 13.824v1.024z m12.8-411.136h-0.512c-0.512 0.512-1.024 1.024-1.024 1.536l-12.8 392.704c0 0.512 0.512 1.024 0.512 1.536 0 0 0.512 0.512 1.536 0.512L474.112 506.88 90.624 123.904c-0.512-0.512-1.024-0.512-1.024-0.512z"
                          fill="#2E66FF"
                      ></path>
                    </svg>
                  </span>
                                    <span className="text-fontColor text-[28px] font-bold ml-3">音乐库</span>
                                </div>
                                <div className="my-5 mb-10">
                                    <Collapse
                                        accordion
                                        activeKey={activeName}
                                        expandIcon={() => null} // 隐藏下拉按钮
                                        onChange={(key) => {
                                            setActiveName(key);
                                            changeFunny(item.classify);
                                        }}
                                        className="border-none rounded-[10px] overflow-hidden"
                                    >
                                        <Collapse.Panel
                                            key={index}
                                            header="盗琴音"
                                            showArrow
                                            className="font-miniItalics [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-header]:text-[20px] [&_.ant-collapse-header]:font-bold [&_.ant-collapse-header]:bg-maxMaxLightGray [&_.ant-collapse-header]:text-fontColor [&_.ant-collapse-header]:p-10 [&_.ant-collapse-content]:bg-maxMaxLightGray"
                                        >
                                            {!common.isEmpty(funnyMap[item.classify].data) && (
                                                <div className="animate-slideBottom flex flex-wrap ml-5">
                                                    {funnyMap[item.classify].data.map((funny, i) => (
                                                        <div key={i} className="w-[150px]">
                                                            <Avatar
                                                                className="flex justify-center items-center cursor-pointer transition-all duration-500 select-none hover:rotate-[360deg] mx-auto my-5"
                                                                size={110}
                                                                src={funny.cover}
                                                                onClick={() => playSound(funny)}
                                                            />
                                                            <div
                                                                className="text-center mx-[10px] text-[18px] font-bold whitespace-nowrap text-ellipsis overflow-hidden hover:text-clip hover:overflow-visible">
                                                                {funny.title}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Collapse.Panel>
                                    </Collapse>
                                    <hr className="relative my-[30px] mb-[100px] border-2 border-dashed border-lightGreen overflow-visible before:content-['❄'] before:absolute before:top-[-14px] before:left-[5%] before:text-lightGreen before:text-[30px] before:leading-[1] before:transition-all before:duration-1000 before:ease-in-out hover:before:left-[calc(95%-20px)]"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 页脚 */}
            <Footer/>
        </div>
    );
};

export default Funny;
