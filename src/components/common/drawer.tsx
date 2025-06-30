// Drawer.tsx
import React, { FC, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

type Placement = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
    /** 控制抽屉显隐 */
    visible: boolean;
    /** 关闭回调 */
    onClose: () => void;
    /** 抽屉从哪个方向弹出 */
    placement?: Placement;
    /** 抽屉的宽度，用于 left/right */
    width?: string | number;
    /** 抽屉的高度，用于 top/bottom */
    height?: string | number;
    /** 遮罩是否可点击关闭 */
    maskClosable?: boolean;
    /** 是否显示遮罩 */
    mask?: boolean;
    /** 自定义遮罩样式 */
    maskClassName?: string;
    /** 自定义抽屉容器样式 */
    drawerClassName?: string;
    /** 自定义抽屉内容区域样式 */
    contentClassName?: string;
    /** 标题 */
    title?: ReactNode;
    /** 底部区域 */
    footer?: ReactNode;
    /** 子节点 */
    children?: ReactNode;
    /** 自定义关闭按钮图标 */
    closeIcon?: ReactNode;
    /** 是否支持键盘 Esc 关闭，默认 true */
    keyboard?: boolean;
}

const Drawer: FC<DrawerProps> = ({
                                     visible,
                                     onClose,
                                     placement = 'right',
                                     width = 320,
                                     height = 256,
                                     mask = true,
                                     maskClosable = true,
                                     maskClassName = '',
                                     drawerClassName = '',
                                     contentClassName = '',
                                     title,
                                     footer,
                                     children,
                                     closeIcon,
                                     keyboard = true,
                                 }) => {
    // 防止页面滚动
    useEffect(() => {
        document.body.style.overflow = visible ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [visible]);

    // 键盘 Esc 关闭
    useEffect(() => {
        if (!keyboard) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && visible) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [keyboard, visible, onClose]);

    // 遮罩点击
    const onMaskClick = () => {
        if (maskClosable) onClose();
    };

    // 计算抽屉定位和过渡
    const baseDrawerClasses = [
        'fixed bg-white shadow-xl z-[250] transform transition-transform duration-300 ease-out',
        drawerClassName,
    ]
        .filter(Boolean)
        .join(' ');

    const placementStyle: React.CSSProperties = {};
    let translateClass = '';

    switch (placement) {
        case 'left':
            placementStyle.width = typeof width === 'number' ? `${width}px` : width;
            placementStyle.top = 0;
            placementStyle.bottom = 0;
            placementStyle.left = 0;
            translateClass = visible ? 'translate-x-0' : '-translate-x-full';
            break;
        case 'right':
            placementStyle.width = typeof width === 'number' ? `${width}px` : width;
            placementStyle.top = 0;
            placementStyle.bottom = 0;
            placementStyle.right = 0;
            translateClass = visible ? 'translate-x-0' : 'translate-x-full';
            break;
        case 'top':
            placementStyle.height = typeof height === 'number' ? `${height}px` : height;
            placementStyle.left = 0;
            placementStyle.right = 0;
            placementStyle.top = 0;
            translateClass = visible ? 'translate-y-0' : '-translate-y-full';
            break;
        case 'bottom':
            placementStyle.height = typeof height === 'number' ? `${height}px` : height;
            placementStyle.left = 0;
            placementStyle.right = 0;
            placementStyle.bottom = 0;
            translateClass = visible ? 'translate-y-0' : 'translate-y-full';
            break;
    }

    const drawerNode = (
        <>
            {mask && visible && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-40 z-[240] ${maskClassName}`}
                    onClick={onMaskClick}
                />
            )}
            <div className={`${baseDrawerClasses} ${translateClass}`} style={placementStyle}>
                <div className="relative px-4 py-2">
                    {/* 标题区域，水平居中 */}
                    <div className="flex justify-center items-center">
                        <div className="text-lg font-medium">{title}</div>
                    </div>
                    {/* 关闭按钮绝对定位到右侧 */}
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute left-3 top-1/2 transform -translate-y-[42%] focus:outline-none"
                    >
                        {closeIcon ?? '×'}
                    </button>
                </div>
                <div className={`p-4 flex-1 overflow-auto ${contentClassName}`}>
                    {children}
                </div>
                {footer && <div className="border-t px-4 py-2">{footer}</div>}
            </div>
        </>
    );

    // 渲染到 body 上
    return createPortal(drawerNode, document.body);
};

export default Drawer;
