import React, {useState} from 'react';
import {useAppContext} from "@hooks/useAppContext";
import {resourcePath} from "../../type/resourcePath";
import Image from "./image";
import Tooltip from "./tooltip";


interface PhotoProps {
    resourcePathList: resourcePath[];
}

const Photo: React.FC<PhotoProps> = ({resourcePathList}) => {
    const {time} = useAppContext();
    const [imgError, setImgError] = useState(false); // 跟踪图片是否加载失败
    return (
        <div className="flex flex-wrap" style={{display: resourcePathList.length ? 'flex' : 'none'}}>
            {resourcePathList.map((resourcePath, index) => (
                <div
                    key={index}
                    className="shadow-box-mini relative max-sm:h-[380px] md:h-[430px] lg:h-[480px] flex-shrink-0 max-sm:w-full md:w-[calc(50%-10px)] lg:w-[calc(33%-30px)] cursor-pointer bg-white rounded-lg"
                >
                    <div className="shadow-card-image rounded-2xl my-4 mx-auto w-[95%] max-sm:h-[290px] md:h-[340px] lg:h-[380px] overflow-hidden mb-2">
                        {!imgError ? (
                            <Image
                                className="transform transition-all duration-300 ease-in-out hover:scale-110"
                                src={resourcePath.cover}
                                draggable={false}
                                lazy
                                alt={resourcePath.title}
                                onError={() => setImgError(true)} // 图片加载失败时触发
                            />
                        ) : (
                            <div className="bg-gray-200 w-full h-full"/>
                        )
                        }
                    </div>
                    <div className="px-2">
                        <Tooltip content={resourcePath.title} position='bottom'
                                 className="-translate-x-[40%] translate-y-[110%]"
                        >
                            <div className="text-lg  font-semibold text-gray-800 text-ellipsis line-clamp-2">
                                {resourcePath.title}
                            </div>
                        </Tooltip>
                        <div className="absolute bottom-4 text-sm text-gray-500">
                            Date: {time.getDateDiff(resourcePath.createTime!)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Photo;
