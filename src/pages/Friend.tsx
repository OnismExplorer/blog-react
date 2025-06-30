import React, {useEffect, useState} from 'react';
import {Input, message} from 'antd';
import {useAppContext} from '@hooks/useAppContext';
import Footer from '@components/common/footer';
import Card from '@components/common/card';
import ProButton from '@components/common/proButton';
import {resourcePath} from '@type/resourcePath';
import {useStore} from "@hooks/useStore";
import {page} from "@type/page";
import {getResourcePathList} from "@api/webInfo";
import {saveFriend} from "@api/webInfo";
import Image from "@components/common/image";

// 友链表单类型定义
interface FriendForm {
    title: string;
    introduction: string;
    cover: string;
    url: string;
}

interface Pagination extends page {
    desc: boolean,
    resourceType: string
}

const Friend: React.FC = () => {
    // 状态定义
    const [friendList, setFriendList] = useState<resourcePath[]>([]);
    const [friend, setFriend] = useState<FriendForm>({
        title: '',
        introduction: '',
        cover: '',
        url: ''
    });
    const pagination: Pagination = (
        {
            pageNumber: 1,
            pageSize: 9999,
            desc: false,
            resourceType: 'friendUrl'
        }
    )

    // 获取全局上下文
    const {common, constant} = useAppContext();
    const {state} = useStore();

    // 组件挂载时获取友链列表
    useEffect(() => {
        getFriends().then();
    }, []); // 空数组：只有在首次渲染时才会执行

    // 点击信封展开表单
    const clickLetter = () => {
        const formWrap = document.querySelector('.form-wrap') as HTMLElement;
        if (formWrap) {
            // 根据屏幕宽度设置不同的高度，确保在移动端有足够空间显示完整表单和按钮
            if (document.body.clientWidth < 480) {
                formWrap.style.height = '880px'; // 增加移动端高度确保表单完全展示
                formWrap.style.top = '-150px'; // 调整顶部位置，避免表单超出视口

                // 调整信封底部图片位置，确保不遮挡表单内容
                const afterImg = document.querySelector('.after-img') as HTMLElement;
                if (afterImg) {
                    afterImg.style.bottom = '50px'; // 移动底部图片位置
                }
            } else if (document.body.clientWidth < 700) {
                formWrap.style.height = '780px';
                formWrap.style.top = '-80px';

                // 调整信封底部图片位置
                const afterImg = document.querySelector('.after-img') as HTMLElement;
                if (afterImg) {
                    afterImg.style.bottom = '25px';
                }
            } else {
                formWrap.style.height = '930px';
                formWrap.style.top = '-200px';

                // 调整信封底部图片位置
                const afterImg = document.querySelector('.after-img') as HTMLElement;
                if (afterImg) {
                    afterImg.style.bottom = '-2px';
                }
            }
        }
    };

    // 表单输入处理
    const handleInputChange = (field: keyof FriendForm, value: string) => {
        setFriend(prev => ({...prev, [field]: value}));
    };

    // 提交友链
    const submitFriend = () => {
        if (common.isEmpty(state.currentUser)) {
            message.error('请先登录！').then();
            return;
        }

        // 表单验证
        if (friend.title.trim() === '') {
            message.warning('你还没写名称呢~').then();
            return;
        }
        if (friend.introduction.trim() === '') {
            message.warning('你还没写简介呢~').then();
            return;
        }
        if (friend.cover.trim() === '') {
            message.warning('你还没设置封面呢~').then();
            return;
        }
        if (friend.url.trim() === '') {
            message.warning('你还没写网址呢~').then();
            return;
        }

        saveFriend(friend)
            .then(() => {
                const formWrap = document.querySelector('.form-wrap') as HTMLElement;
                if (formWrap) {
                    // 重置表单状态
                    formWrap.style.height = '447px';
                    formWrap.style.top = '0';

                    // 重置信封底部图片位置
                    const afterImg = document.querySelector('.after-img') as HTMLElement;
                    if (afterImg) {
                        afterImg.style.bottom = '-2px';
                    }

                    // 清空表单
                    setFriend({
                        title: '',
                        introduction: '',
                        cover: '',
                        url: ''
                    });
                }
                message.success('提交成功，待管理员审核！').then();
            })
    };

    // 点击友链
    const clickFriend = (path: string) => {
        window.open(path, '_blank');
    };

    // 获取友链列表
    const getFriends = async () => {
        const result = await getResourcePathList(pagination,false);
        if (!common.isEmpty(result)) {
            setFriendList(result.data.records);
        }
    };

    return (
        // 整体容器：设置背景图并自适应
        <div
            className="min-h-screen bg-no-repeat bg-cover bg-fixed  bg-center flex flex-col animate-header-effect"
            style={{backgroundImage: `url('${constant.friendBG}')`}}
        >
            {/* 内容区 */}
            <div className="flex-grow">
                {/* 封面 */}
                <div className="relative flex items-center justify-center h-[300px]">
                    <div className="absolute inset-0 bg-black bg-opacity-30"/>
                    <h1 className="text-white text-4xl font-bold z-10">友链</h1>
                </div>

                <div className="px-5 md:px-20 text-black py-10">
                    <div className="lg:max-w-[1344px] mx-auto rounded-lg py-10 px-5 bg-white bg-opacity-85">
                        {/* 添加友链 */}
                        <div
                            onClick={clickLetter}
                            className="form-wrap relative mx-auto overflow-hidden w-full md:w-[530px] h-[447px] cursor-pointer transition-all duration-1000 delay-300 z-0"
                            style={{maxWidth: '100%'}}
                        >
                            {/* 信封上部 */}
                            <img
                                className="before-img absolute bottom-[126px] left-0 bg-no-repeat w-full md:w-[530px] h-auto md:h-[317px] -z-10 transition-all duration-1000 delay-300"
                                src={constant.friendLetterTop}
                                alt="信封上部"
                            />
                            {/* 信封主体 */}
                            <div
                                className="translate-y-0 max-sm:translate-y-36 relative mx-auto transition-all duration-1000 delay-300 pt-[100px] sm:pt-[120px] md:pt-[150px] px-2 sm:px-3 md:px-5 pb-3 sm:pb-5 animate-hideToShow">
                                <div className="bg-white mx-auto rounded-lg overflow-hidden">
                                    <img
                                        src={constant.friendLetterMiddle}
                                        className="w-full"
                                        alt="信封中部"
                                    />
                                    <div
                                        className="font-optima flex flex-col items-center justify-center px-2 sm:px-4 space-x-1">
                                        <h3 className="text-center p-1 text-sm sm:text-base md:text-lg">欢迎加入~😊</h3>
                                        {(['名称', '简介', '封面', '网址'] as string[]).map((label, idx) => {
                                            const keys = ['title', 'introduction', 'cover', 'url'] as (keyof FriendForm)[];
                                            const key = keys[idx];
                                            return (
                                                <div
                                                    key={key}
                                                    className="font-bold flex items-center justify-center px-2 py-1 bg-white"
                                                >
        <span className="w-20 pl-8 text-sm select-none">
          {label}：
        </span>
                                                    <Input
                                                        maxLength={
                                                            key === 'title' ? 30
                                                                : key === 'introduction' ? 120
                                                                    : 200
                                                        }
                                                        value={friend[key]}
                                                        onChange={e => handleInputChange(key, e.target.value)}
                                                        className="flex-1 h-8 bg-gray-100 text-sm"
                                                        placeholder={`请输入${label}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                        <div
                                            className="flex items-center justify-center mt-2 sm:mt-3 md:mt-4 mb-1 sm:mb-2">
                                            <ProButton
                                                info="提交"
                                                onClick={submitFriend}
                                                before={constant.before_color_2}
                                                after={constant.after_color_2}
                                            />
                                        </div>
                                    </div>
                                    <Image
                                        src={constant.friendLetterBiLi}
                                        draggable={false}
                                        zoomable={false}
                                        className="w-full mx-auto mb-[5px]"
                                        alt="信封装饰"
                                    />
                                    <p className="text-xs text-center text-gray-500">欢迎交换友链</p>
                                </div>
                            </div>
                            <img
                                className="pointer-events-none absolute bottom-[-2px] left-0 bg-no-repeat w-full md:w-[530px] h-auto md:h-[259px] z-10"
                                src={constant.friendLetterBottom}
                                alt="信封底部"
                                draggable={false}
                                style={{transition: 'all 1s ease 0.3s'}} // 添加过渡效果
                            />
                        </div>

                        {/* 分隔线 */}
                        <div className="relative my-10 border-2 border-dashed border-lightGreen overflow-visible">
              <span
                  className="absolute -top-[18px] left-[5%] text-lightGreen text-3xl leading-none transition-all duration-1000 ease-in-out hover:left-[calc(95%-20px)]"
              />
                        </div>

                        {/* 友链列表 */}
                        <h2 className="text-xl">🥇友情链接</h2>
                        <Card resourcePathList={friendList} onClickResourcePath={clickFriend}/>
                    </div>
                </div>
            </div>

            {/* 页脚 */}
            <Footer/>
        </div>
    );
};

export default Friend;
