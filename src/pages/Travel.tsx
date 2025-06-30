import React, {useEffect, useState} from "react";
import {page} from "@type/page";
import {useAppContext} from "@hooks/useAppContext";
import Footer from "@components/common/footer";
import {message} from "antd";
import Photo from "@components/common/photo";
import {resourcePath} from "@type/resourcePath";
import ProTag from "@components/common/proTag";
import {getResourcePathList} from "@api/webInfo";
import {getTravelPhoto} from "@api/webInfo";


interface PhotoPagination extends page{
    resourceType:string;
    classify:string;
}

export interface PhotoTitle {
    classify:string;
    count:number;
}


const Travel: React.FC = () => {
    const {common,constant} = useAppContext();
    const [photoPagination,setPhotoPagination] = useState<PhotoPagination>({
        pageNumber: 1,
        pageSize:10,
        total:0,
        resourceType:'lovePhoto',
        classify:'',
    })
    const [photoTitleList,setPhotoTitleList] = useState<PhotoTitle[]>([])
    const [photoList,setPhotoList] = useState<resourcePath[]>([])

    useEffect(() => {
        getPhotoTitles();
    }, []);

    const getPhotoTitles = ()=> {
        getTravelPhoto()
            .then((res) => {
                const result = res.data;
                if(!common.isEmpty(result)) {
                    setPhotoTitleList(result);
                    setPhotoPagination((prev) => ({
                        ...prev,
                        classify:result[0].classify
                    }))
                }
            })
            .catch((error)=> {
                message.error(error.message)
                    .then(()=>console.error('获取旅拍分类失败：',error.message));
            })
    }

    const changePhotoTitle = (classify:string) => {
        if(classify !== photoPagination.classify) {
            setPhotoPagination((prev) => ({
                ...prev,
                classify:classify
            }))
        }
    }

    const getNextPhotos = ()=> {
        setPhotoPagination((prev) => ({
            ...prev,
            // 页码加一
            pageNumber: prev.pageNumber + 1,
        }))
        
    }

    // 监听分页中条件 pageNumber、classify 变化
    useEffect(() => {
        changePhoto();
    }, [photoPagination.pageNumber,photoPagination.classify]);

    const changePhoto = ()=>{
        getResourcePathList(photoPagination,false)
            .then((res) => {
                const result = res.data;
                if(!common.isEmpty(result)) {
                    setPhotoList(result.records);
                    setPhotoPagination((prev) => ({
                        ...prev,
                        total: result.totalRow
                    }))
                }
            })
    }

    return (
        <div>
            <div className="px-6 py-4 bg-favoriteBg">
                {/* 封面 */}
                <div
                    className="relative mx-auto mt-[60px] mb-[30px] h-[550px] overflow-hidden rounded-[20px] max-w-[1350px] text-white select-none animate-slide-top">
                    {/* 背景视频 */}
                    <video
                        className="w-full h-full object-cover bg-lightGreen"
                        autoPlay
                        muted
                        loop
                        src={constant.travelVideo}
                    />
                    <div className="absolute left-5 top-5">
                        {/* 标题 */}
                        <div className="m-2.5">
                            <div className="text-lg">旅拍集</div>
                            <div className="text-4xl font-bold leading-normal mt-5">这里是我的旅拍哦</div>
                        </div>
                    </div>
                    <div className="absolute text-lg left-5 bottom-10 m-2.5">
                        每一张照片都是一次美好的记忆。
                    </div>
                </div>

                <div className="mx-auto max-w-[1350px] animate-slide-bottom">
                    {/* 标签 */}
                    {!common.isEmpty(photoTitleList) && (
                        <div className="max-w-[1000px] justify-center mx-auto my-[50px] p-5 shadow-lg rounded-[10px] flex flex-wrap">
                            {photoTitleList.map((item, index) => (
                                <div
                                    key={index}
                                    className={photoPagination.classify === item.classify ? 'animate-scale-1-infinite' : ''}
                                    onClick={() => changePhotoTitle(item.classify)}
                                >
                                    <ProTag
                                        info={`${item.classify} ${item.count}`}
                                        color={constant.before_color_list[Math.floor(Math.random() * constant.before_color_list.length)]}
                                        className="m-3"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center text-3xl m-1 font-bold leading-[80px] tracking-wider">
                        {photoPagination.classify}
                    </div>

                    <Photo resourcePathList={photoList}/>

                    <div className="flex justify-center mt-10">
                        {photoPagination.total !== photoList.length ? (
                            <div
                                onClick={getNextPhotos}
                                className="py-3 px-4 border border-lightGray rounded-[3rem] text-greyFont w-[100px] select-none cursor-pointer text-center"
                            >
                                下一页
                            </div>
                        ) : (
                            <div className="text-gray-400 select-none">~~到底啦~~</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 页脚 */}
            <div className="bg-favoriteBg">
                <Footer/>
            </div>
        </div>
    );
}

export default Travel
