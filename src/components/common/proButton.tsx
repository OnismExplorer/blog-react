import React from 'react';
import common from "@utils/common";

// 定义组件的属性类型
interface ProButtonProps {
    /**
     * 按钮显示的文本
     */
    info?: string;
    /**
     * 按钮初始背景色
     */
    before?: string;
    /**
     * 按钮悬停后的背景色（通常是渐变色）
     */
    after?: string;
    /**
     * 点击事件处理函数
     */
    onClick?: () => void;
    /**
     * 自定义类名
     */
    className?: string;
}

/**
 * 自定义按钮组件，具有特殊的悬停动画效果
 *
 * 使用示例:
 * <ProButton
 *   info="确定"
 *   before="black"
 *   after="linear-gradient(45deg, #f43f3b, #ec008c)"
 *   onClick={() => console.log('按钮被点击')}
 * />
 */
const ProButton: React.FC<ProButtonProps> = ({
                                                 info = "确定",
                                                 before,
                                                 after,
                                                 onClick,
                                                 className = ""
                                             }) => {
    // 设置按钮的背景样式
    const beforeStyle = {backgroundColor:common.isEmpty(before) ? 'black' : before} // 设置备用颜色
    const afterStyle = common.isEmpty(after) ? {backgroundColor:'oklch(71.2% 0.194 13.428)'} : {background:after}
    return (
        <div
            className={`group cursor-pointer select-none relative w-[66px] h-[33px] rounded text-white text-sm overflow-hidden ${className}`}
            onClick={onClick}
        >
            {/* 初始显示的按钮 */}
            <div
                className="w-[66px] h-[33px] leading-[33px] rounded text-center absolute"
                style={beforeStyle}
            >
                {info}
            </div>

            {/* 悬停时的倾斜效果层 */}
            <div
                className="w-[100px] h-[33px] leading-[33px] rounded text-center absolute transition-all duration-300 ease-in-out transform -translate-x-[120px] -skew-x-[30deg] group-hover:translate-x-[20px]"
                style={afterStyle}
            >
                {info}
            </div>

            {/* 悬停时的正常效果层 */}
            <div
                className="w-[66px] h-[33px] leading-[33px] rounded text-center absolute transition-all duration-300 ease-in-out transform -translate-x-[120px] group-hover:translate-x-0"
                style={afterStyle}
            >
                {info}
            </div>
        </div>
    );
};

export default ProButton;
