import React from 'react';
import { Avatar } from 'antd';
import { weiYan } from '@type/weiYan';
import { useAppContext } from '@hooks/useAppContext';
import { useStore } from '@hooks/useStore';
import { FaPaperPlane } from 'react-icons/fa';
import { CalendarIcon } from "lucide-react";
import  useWindowSize  from '@hooks/useWindowSize';

/**
 * TreeHole组件属性接口
 */
interface TreeHoleProps {
    /** 树洞/微言列表数据 */
    treeHoleList: weiYan[];
    /** 头像URL */
    avatar: string;
    /** 发布新微言的回调函数 */
    launch: () => void;
    /** 删除微言的回调函数 */
    deleteTreeHole: (id: number) => void;
}

/**
 * 树洞/微言组件
 * 用于展示时间轴样式的微言列表，支持左右交替布局
 */
const TreeHole: React.FC<TreeHoleProps> = ({ treeHoleList, avatar, launch, deleteTreeHole }) => {
    // 获取上下文和状态
    const { common, constant } = useAppContext();
    const { state } = useStore();
    // 获取窗口尺寸以优化响应式布局
    const { width } = useWindowSize();

    return (
        <div className="p-3 sm:p-5 mx-auto max-w-full">
            {!common.isEmpty(treeHoleList) && (
                <ol className="
                pt-[80px] sm:pt-[100px] pb-5 m-0 relative list-none
                before:content-[''] before:w-1 before:rounded-full before:absolute before:top-0
                before:bottom-0 before:bg-themeBackground before:bg-gradient-to-b before:from-orange-600 before:to-orange-100
                md:before:left-1/2 md:before:-translate-x-1/2 before:left-[12px]
                after:content-[''] after:w-5 sm:after:w-6 after:h-5 sm:after:h-6 after:border-[4px] sm:after:border-[5px] after:border-maxLightRed
                after:rounded-full after:absolute after:top-[10px] after:bg-white after:animate-weiYanShadowFlashing-1.5-infinte
                md:after:left-1/2 md:after:-translate-x-1/2 after:left-[4px]">
                    {treeHoleList.map((treeHole, index) => {
                        // 确定是左侧还是右侧布局
                        // 在小屏幕上始终使用右侧布局，在大屏幕上交替使用左右布局
                        const isMobile = width < 768 || common.mobile();
                        const isLeft = index % 2 === 0 && !isMobile;
                        const isRight = index % 2 !== 0 || isMobile;
                        // 获取背景颜色
                        const bgColor = constant.tree_hole_color[index % constant.tree_hole_color.length];

                        return (
                            <li key={index} className="my-[5px] mx-auto relative">
                                <div
                                    className={`relative ${isMobile ? 'w-[90%] mx-auto' : 'w-1/2'} ${isLeft ? 'text-right' : ''} ${isRight && !isMobile ? 'ml-[50%]' : ''}`}
                                >
                                    {/* 圆点装饰 */}
                                    <div
                                        className={`before:content-[''] before:w-4 sm:before:w-6 before:h-4 sm:before:h-6 before:border-[3px] sm:before:border-[5px] before:border-blue-500 before:rounded-full before:absolute before:top-[8px] before:bg-white ${isLeft ? 'before:right-0 before:translate-x-[12px]' : 'before:left-0 before:-translate-x-[12px]'}`}
                                    >
                                        {/* 头像 */}
                                        <Avatar
                                            shape="square"
                                            size={isMobile ? 32 : 40}
                                            src={avatar}
                                            className={`absolute top-0 transition-all duration-300 ease-in-out hover:transform hover:-translate-y-[5px] hover:shadow-avatar-hover ${isLeft ? 'right-[25px]' : 'left-[25px]'}`}
                                        />

                                        {/* 内容框 */}
                                        <div
                                            className={`text-sm sm:text-base p-[8px] sm:p-[10px] rounded-[5px] relative tracking-wider font-normal transition-all duration-300 ease-in-out text-black text-left inline-block hover:transform hover:-translate-y-[5px] hover:shadow-[0_0_16px_3px_miniMask] ${isLeft ? 'mr-[75px] sm:mr-[85px]' : 'ml-[75px] sm:ml-[85px]'} w-full sm:w-[320px] md:w-[360px] max-w-[calc(100%-70px)] sm:max-w-[calc(100%-90px)]`}
                                            style={{ backgroundColor: bgColor }}
                                        >
                                            {/* 三角形标签 */}
                                            {isLeft && (
                                                <div
                                                    className="absolute border-solid right-[-9px]"
                                                    style={{
                                                        borderWidth: '15px 0 5px 10px',
                                                        borderColor: `transparent transparent transparent ${bgColor}`
                                                    }}
                                                />
                                            )}
                                            {isRight && (
                                                <div
                                                    className="absolute border-solid left-[-9px]"
                                                    style={{
                                                        borderWidth: '15px 10px 5px 0',
                                                        borderColor: `transparent ${bgColor} transparent transparent`
                                                    }}
                                                />
                                            )}

                                            {/* 内容 */}
                                            <div
                                                className="mx-[10px] mb-[10px] leading-[25px] font-custom"
                                                dangerouslySetInnerHTML={{ __html: treeHole.content }}
                                            />

                                            {/* 底部信息 */}
                                            <div className="flex justify-between text-greyFont py-[8px] sm:py-[10px] px-[8px] sm:px-[10px] pt-[8px] sm:pt-[10px] border-t border-dashed border-white text-xs sm:text-sm">
                                                <div className="flex items-center gap-1"><CalendarIcon size={isMobile ? 16 : 20}/> {treeHole.createTime}</div>
                                                {!common.isEmpty(state.currentUser) && state.currentUser.id === treeHole.userId && (
                                                    <div
                                                        onClick={() => deleteTreeHole(treeHole.id!)}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        <svg viewBox="0 0 1024 1024" width="18" height="18" style={{verticalAlign: '-2px'}}>
                                                            <path
                                                                d="M921.1392 155.392h-270.592v-48.2816c0-22.7328-18.432-41.1648-41.1648-41.1648H426.3424a41.1648 41.1648 0 0 0-41.1648 41.1648v48.2816H110.6432c-14.1312 0-25.6 11.4688-25.6 25.6s11.4688 25.6 25.6 25.6h810.496c14.1312 0 25.6-11.4688 25.6-25.6s-11.4688-25.6-25.6-25.6zM170.8032 260.0448v592.8448c0 50.8928 41.2672 92.16 92.16 92.16h500.6848c50.8928 0 92.16-41.2672 92.16-92.16V260.0448H170.8032z m249.1392 462.7968c0 14.1312-11.4688 25.6-25.6 25.6s-25.6-11.4688-25.6-25.6V443.0848c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v279.7568z m243.1488 0c0 14.1312-11.4688 25.6-25.6 25.6s-25.6-11.4688-25.6-25.6V443.0848c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v279.7568z"
                                                                fill="#FF623E"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

            {/* 发布按钮 */}
            {!common.isEmpty(state.currentAdmin) && (
                <div className="text-blue font-bold text-[20px] sm:text-[25px] my-4 sm:my-5 mx-auto text-center">
                    <FaPaperPlane
                        className="text-blue-500 text-2xl animate-bounce cursor-pointer mt-5 max-md:mt-3 hover:animate-scale-1-infinite inline-block"
                        onClick={launch}
                    />
                </div>
            )}
        </div>
    );
};

export default TreeHole;
