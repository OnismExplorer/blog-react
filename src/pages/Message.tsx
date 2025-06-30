import React, {useEffect, useRef, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {treeHole} from "@type/treeHole";
import {message} from "antd";
import {useStore} from "@hooks/useStore";
import Footer from "@components/common/footer";
import Comment from "@components/comment/comment";
import Barrage, {BarrageHandle} from "@components/common/barrage";
import {getTreeHoleList, saveTreeHole, getRandomResource} from "@api/webInfo";


const Message: React.FC = () => {
    const [show, setShow] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [barrageList, setBarrageList] = useState<treeHole[]>([]);
    const {common, constant} = useAppContext();
    const {state} = useStore();
    const barrageRef = useRef<BarrageHandle>(null);
    const [hasError, setHasError] = useState<boolean>(false);
    const [containerHeight, setContainerHeight] = useState<number>(window.innerHeight);
    const [imageUrl, setImageUrl] = useState<string>();

    const getImageUrl = () => {
        getRandomResource("cover")
            .then((res) => {
                setImageUrl(res.data);
            });
    }

    useEffect(() => {
        getImageUrl();
        getTreeHole();

        // 添加窗口大小变化监听，更新弹幕容器高度
        const handleResize = () => {
            setContainerHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // 组件卸载时移除监听
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const getTreeHole = () => {
        getTreeHoleList()
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setBarrageList(result);
                }
            })
    }

    const submitMessage = () => {
        if (messageContent.trim() === "") {
            message.warning("你还没写呢~").then();
            return;
        }
        const hole: treeHole = {
            message: messageContent.trim()
        }

        if (!common.isEmpty(state.currentUser) && common.isEmpty(state.currentUser.avatar)) {
            hole.avatar = state.currentUser.avatar;
        } else {
            // 采用随机头像
            getRandomResource('avatar')
                .then((res) => {
                    hole.avatar = res.data;
                })
        }

        saveTreeHole(hole)
            .then((res) => {
                if (!common.isEmpty(res.data)) {
                    setBarrageList((prev) => [
                        ...prev,
                        // 将新添加的留言加入弹幕
                        res.data
                    ])
                    message.success("发射成功~弹幕马上就来").then();
                    barrageRef.current?.addBarrage(res.data)
                }
            })

        // 重置状态
        setMessageContent('');
        setShow(false);
    }

    /**
     * 处理输入框文本变化
     * @param content
     */
    const handleChange = (content: string) => {
        setMessageContent(content)
        if (content.trim().length > 0) {
            setShow(true);
        } else {
            setShow(false);
        }
    }

    return (
        <div className="relative select-none">
            <div className="relative">
                {!hasError ? (
                    <img
                        draggable={false}
                        src={imageUrl}
                        className="w-full h-screen object-cover animate-header-effect"
                        alt="背景图片"
                        onError={() => setHasError(true)}
                    />
                ) : (
                    <div slot="error" className="bg-lightGreen w-screen h-screen fixed z-[-1]"/>
                )}

                {/*输入框*/}
                <div
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white animate-header-effect-ease z-10 w-[360px]">
                    <h2 className="text-center text-white select-none text-2xl mb-4">树洞</h2>
                    <div className="flex items-center justify-center">
                        <input
                            className="font-custom rounded-full border border-white bg-transparent text-white px-2 py-2 placeholder-white w-[70%] focus:outline-none"
                            type="text"
                            placeholder="留下点什么啦~"
                            value={messageContent}
                            onChange={e => handleChange(e.target.value)}
                            maxLength={60}
                        />
                        {show && (
                            <button
                                className="ml-3 cursor-pointer rounded-[1.2rem] border border-white bg-transparent text-white placeholder-white hover:bg-white/20 w-[20%]"
                                onClick={submitMessage}>发射</button>
                        )}
                    </div>
                </div>
                <div className="absolute inset-0 w-full z-[5] h-[calc(100%-50px)]">
                    <Barrage
                        barrageList={barrageList}
                        speed={10}
                        speedVariation={2}
                        height={containerHeight}
                        randomizeInitialPosition={true}
                        containerClassName="z-10"
                    />
                </div>
            </div>

            <div className="bg-background absolute top-[100vh] w-full select-none overflow-hidden">
                <div className="max-w-[800px] my-0 mx-auto py-10 px-5">
                    <Comment source={constant.source} type="message" userId={constant.userId}/>
                </div>
                <Footer/>
            </div>
        </div>
    );
}

export default Message
