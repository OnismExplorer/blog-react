import { useState, useEffect } from 'react';

/**
 * 窗口尺寸钩子 - 用于响应式布局
 * 监听窗口大小变化并返回当前窗口的宽度和高度
 */
const useWindowSize = () => {
    // 初始化状态为当前窗口尺寸
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        // 处理窗口大小变化的函数
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // 添加事件监听器
        window.addEventListener('resize', handleResize);

        // 组件卸载时移除事件监听器
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // 空依赖数组确保效果只运行一次

    return windowSize;
};

export default useWindowSize;
