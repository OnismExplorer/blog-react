import {resourcePath} from "@type/resourcePath";
import React, {useState, useEffect} from "react";
import {useAppContext} from "@hooks/useAppContext";
import Footer from "@components/common/footer";
import {getCollectList} from "@api/webInfo";

type Collects = Record<string, resourcePath[]>

const Favorite: React.FC = () => {
    const [card] = useState<number>(1);
    const [collects, setCollects] = useState<Collects>({});
    const {common, constant} = useAppContext();

    // 打开网页
    const openUrl = (url: string) => {
        window.open(url, '_blank');
    }

    useEffect(() => {
        fetchCollects();
    }, []);

    const fetchCollects = () => {
        getCollectList()
            .then((res) => {
                if (!common.isEmpty(res)) {
                    setCollects(res.data);
                }
            })
    }


    return (
        <div className="font-optima bg-favoriteBg">
            {/* Header */}
            <div
                className="relative max-w-6xl mx-auto mt-16 mb-6 rounded-2xl overflow-hidden h-[550px] animate-slide-top">
                <video
                    className="w-full h-full object-cover bg-lightGreen"
                    autoPlay
                    muted
                    loop // 循环播放
                    src={constant.favoriteVideo}
                />

                <div className="absolute top-0 left-0 p-5 text-white">
                    <div className="space-y-2">
                        <div className="text-lg font-bold">记录</div>
                        <div className="text-4xl font-bold leading-snug">百宝箱</div>
                    </div>
                    <div className="flex flex-wrap mt-16">
                        <div
                            className="relative w-60 h-32 m-2 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform"
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-40"/>
                            <div className="absolute top-5 left-6">
                                <div className="text-2xl font-bold">收藏夹</div>
                                <div className="mt-2 font-semibold">将 onism.cn 添加到您的收藏夹吧</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="py-8 max-w-6xl mx-auto animate-slide-bottom">
                {card === 1 && Object.keys(collects).length > 0 && (
                    Object.entries(collects).map(([category, items]) => (
                        <div key={category} className="mt-8">
                            <div className="text-2xl font-bold mb-4">{category}</div>
                            <div className="flex flex-wrap -mx-2">
                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => openUrl(item.url)}
                                        className="justify-center xs:w-1/2 sm:w-1/3 lg:w-1/4 px-2 mb-4"
                                    >
                                        <div
                                            className="flex  h-24 p-3 rounded-lg shadow-lg bg-background cursor-pointer hover:bg-blue-600 hover:text-white transition-all duration-300 overflow-hidden group">
                                            <img
                                                src={item.cover}
                                                alt={item.title}
                                                className="w-[58px] h-[58px] bg-favoriteBg items-center object-contain mt-[8px] mr-4 rounded-full border-2 border-gray-600 shadow-md transition-all duration-500 group-hover:animate-image-disappear"
                                            />
                                            <div
                                                className="flex-1 overflow-hidden transition-all duration-300 group-hover:animate-content-expand">
                                                <div className="text-lg font-semibold truncate">{item.title}</div>
                                                <div className="text-sm mt-1 line-clamp-2">{item.introduction}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <Footer/>
        </div>
    )
}

export default Favorite
