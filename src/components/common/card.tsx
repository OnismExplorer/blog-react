import React, {useState} from 'react';
import {useAppContext} from "@hooks/useAppContext";
import {resourcePath} from "@type/resourcePath";

type ResourcePath = resourcePath & {
    recommendStatus?: boolean;
}

interface CardProps {
    resourcePathList: ResourcePath[];
    onClickResourcePath: (url: string) => void;
}

const Card: React.FC<CardProps> = ({resourcePathList, onClickResourcePath}) => {
    const [imgError, setImgError] = useState(false); // 跟踪图片是否加载失败
    const {time} = useAppContext(); // 引用自定义上下文
    return (
        <div className={`flex flex-wrap`} style={{display: resourcePathList.length ? 'flex' : 'none'}}>
            {resourcePathList.map((resourcePath) => (
                <div
                    key={resourcePath.id} // 使用唯一标识符而不是索引
                    role="button" // 设置为 button 角色
                    className="relative rounded-lg bg-white bg-opacity-90 overflow-hidden justify-center  mx-auto my-2 h-[300px] flex-shrink-0 cursor-pointer shadow-lg animate-zoomIn duration-800 ease-in-out"
                    onClick={() => onClickResourcePath(resourcePath.url)}
                >
                    <div className="flex justify-center bg-lightGreen items-center w-[300px] h-[180px] overflow-hidden">
                        {!imgError ? (
                            <img
                                className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-110"
                                src={resourcePath.cover}
                                alt={resourcePath.title}
                                draggable={false}
                                onError={() => setImgError(true)} // 设置加载失败时触发
                            />
                        ) : (
                            <div className="flex justify-center items-center h-full bg-lightGreen">
                                <div>遇事不决，可问春风</div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <div
                            className="font-semibold text-lg mb-2 truncate transition-colors duration-200 hover:text-lightGreen">
                            {resourcePath.recommendStatus && <span aria-label="fire">🔥</span>}
                            {resourcePath.title}
                        </div>
                        <div className="text-sm line-clamp-2 leading-relaxed tracking-wide">
                            {resourcePath.introduction}
                        </div>
                        <div className="font-optima font-bold flex flex-wrap text-base text-greyFont mb-2 items-center">
                            <svg viewBox="0 0 1024 1024" width="15" height="15" className="mr-1">
                                <path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
                                      fill="#409EFF"></path>
                                <path
                                    d="M654.222222 256c-17.066667 0-28.444444 11.377778-28.444444 28.444444v56.888889c0 17.066667 11.377778 28.444444 28.444444 28.444445s28.444444-11.377778 28.444445-28.444445v-56.888889c0-17.066667-11.377778-28.444444-28.444445-28.444444zM369.777778 256c-17.066667 0-28.444444 11.377778-28.444445 28.444444v56.888889c0 17.066667 11.377778 28.444444 28.444445 28.444445s28.444444-11.377778 28.444444-28.444445v-56.888889c0-17.066667-11.377778-28.444444-28.444444-28.444444z"
                                    fill="#FFFFFF"></path>
                                <path
                                    d="M725.333333 312.888889H711.111111v28.444444c0 31.288889-25.6 56.888889-56.888889 56.888889s-56.888889-25.6-56.888889-56.888889v-28.444444h-170.666666v28.444444c0 31.288889-25.6 56.888889-56.888889 56.888889s-56.888889-25.6-56.888889-56.888889v-28.444444h-14.222222c-22.755556 0-42.666667 19.911111-42.666667 42.666667v341.333333c0 22.755556 19.911111 42.666667 42.666667 42.666667h426.666666c22.755556 0 42.666667-19.911111 42.666667-42.666667v-341.333333c0-22.755556-19.911111-42.666667-42.666667-42.666667zM426.666667 654.222222h-56.888889c-17.066667 0-28.444444-11.377778-28.444445-28.444444s11.377778-28.444444 28.444445-28.444445h56.888889c17.066667 0 28.444444 11.377778 28.444444 28.444445s-11.377778 28.444444-28.444444 28.444444z m227.555555 0h-56.888889c-17.066667 0-28.444444-11.377778-28.444444-28.444444s11.377778-28.444444 28.444444-28.444445h56.888889c17.066667 0 28.444444 11.377778 28.444445 28.444445s-11.377778 28.444444-28.444445 28.444444z m0-113.777778h-56.888889c-17.066667 0-28.444444-11.377778-28.444444-28.444444s11.377778-28.444444 28.444444-28.444444h56.888889c17.066667 0 28.444444 11.377778 28.444445 28.444444s-11.377778 28.444444-28.444445 28.444444z"
                                    fill="#FFFFFF"></path>
                            </svg>
                            发布于 {time.getDateDiff(resourcePath.createTime!)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Card;
