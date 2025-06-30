import React, {useEffect, useState} from 'react';
import {useAppContext} from "@hooks/useAppContext";
import {message} from "antd";
import {useInterval} from "@hooks/useInterval";
import {hitokoto, poetry} from "@type/saying";
import {ApiResponse} from "@utils/request";
import {getRandomResource} from "@api/webInfo";

interface HitokotoProps {
    isHitokoto?: boolean;
    className?: string;
}

const TwoPoem: React.FC<HitokotoProps> = ({isHitokoto = true, className = ''}) => {
    const [hitokoto, setHitokoto] = useState<hitokoto>({
        hitokoto: "...",
        from: "..."
    });
    const [poetry, setPoetry] = useState<poetry>({
        content: "...",
        origin: "...",
        author: "...",
        category: "..."
    })
    const {common, constant, request} = useAppContext();
    const [imageUrl, setImageUrl] = useState<string>();

    useEffect(() => {
        getImageUrl().then();
    }, []);

    const getImageUrl = async () => {
        const result = await getRandomResource("cover");
        setImageUrl(result.data);
    }

    const getGuShi = () => {
        request.get<poetry, ApiResponse<poetry>>(constant.poetry)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setPoetry(result);
                }
            })
            .catch((error) => console.error('获取诗词失败：', error.message))
    };

    useInterval(getGuShi, 15000, {
            immediate: true,
            enabled: !isHitokoto && common.isEmpty(hitokoto)
        }
    );

    const getHitokoto = () => {
        // a:动画 b:漫画 d:文学 e:原创 i:诗词 j:网易云 k:哲学
        request.get<hitokoto, ApiResponse<hitokoto>>(constant.hitokoto, {}, false, true)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setHitokoto(result);
                }
            })
            .catch((error) => {
                console.error("获取网络语录失败：", error)

                // 从本地 json 文件中获取
                fetch('@assets/json/hitokoto.json')
                    .then(res => res.json() as Promise<hitokoto[]>)
                    .then((list) => {
                        setHitokoto(list[Math.floor(Math.random() * list.length)]);
                    })
                    .catch((error) => {
                        message.error(error.message).then();
                    });
            });
    };

    useInterval(getHitokoto, 15000, {immediate: true, enabled: isHitokoto});

    return (
        // 外层容器，relative用于定位背景图片，flex居中内容
        <div
            className={`relative flex justify-center items-center pt-[25px] pb-[25px] px-0 animation-hideToShow min-h-[300px] backdrop-blur-md ${className}`}>
            {/* 背景图片，absolute全覆盖，object-cover保证图片完整填充，z-0置于底层 */}
            <img
                className="absolute top-0 left-0 w-full h-full object-cover z-0 select-none rounded-lg"
                src={imageUrl}
                alt="背景图片"
                draggable={false}
            />
            {/* 内容区域，z-10保证浮在图片上方，最大宽度800px，圆角，居中，字体优化 */}
            <div
                className="relative z-10 text-center tracking-wider font-light w-full max-w-[800px] rounded-[10px] bg-white/35 backdrop-blur-md px-4 py-6">
                {/* 诗句来源 */}
                <div>
                    <span className="font-bold py-[5px] px-[10px] text-white text-2xl rounded-[5px]">
                        {!isHitokoto || common.isEmpty(hitokoto) ? poetry.origin : hitokoto.from}
                    </span>
                </div>
                {/* 诗句内容 */}
                <p className="font-custom w-full max-w-[800px] text-white mt-7 text-[1.5em]">
                    {!isHitokoto || common.isEmpty(hitokoto) ? poetry.content : hitokoto.hitokoto}
                </p>
                {/* 作者信息，仅古诗时显示 */}
                {!isHitokoto || common.isEmpty(hitokoto) ? (
                    <p className="font-optima w-full max-w-[800px] text-white my-5 text-[1.1em]">
                        {poetry.author}
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default TwoPoem;
