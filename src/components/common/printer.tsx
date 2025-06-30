import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface PrinterProps {
    printerInfo: string;
    duration?: number;            // 每帧最小时长
    delay?: number;   // 打印/回退完成后的等待时长
    working?: boolean;
    afterExecuted?: () => void;    // 完成一遍（打字 + 等待 + 回退）后的回调
    children: (content: string) => ReactNode;
}

const Printer: React.FC<PrinterProps> = ({
                                             printerInfo,
                                             duration = 150,
                                             delay: delay = 2000,
                                             working = true,
                                             afterExecuted,
                                             children
                                         }) => {
    const [content, setContent] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const phase = useRef<'typing' | 'waiting' | 'erasing'>('typing');
    const indexRef = useRef(0);
    const waitTimeout = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    // 光标闪烁
    useEffect(() => {
        const blink = window.setInterval(() => setShowCursor(v => !v), 500);
        return () => window.clearInterval(blink);
    }, []);

    // 打字机动画
    useEffect(() => {
        const clearAll = () => {
            if (waitTimeout.current) window.clearTimeout(waitTimeout.current);
            if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
        };

        if (!working || !printerInfo) {
            clearAll();
            setContent('');
            return;
        }

        const total = printerInfo.length;
        let lastTime = 0;

        const step = (now: number) => {
            if (!working) return;
            if (!lastTime) lastTime = now;
            const delta = now - lastTime;

            if (delta >= duration) {
                lastTime = now;

                if (phase.current === 'typing') {
                    indexRef.current++;
                    setContent(printerInfo.slice(0, indexRef.current));

                    // 打到末尾后进入等待阶段
                    if (indexRef.current >= total) {
                        phase.current = 'waiting';
                        clearAll();
                        waitTimeout.current = window.setTimeout(() => {
                            phase.current = 'erasing';
                            lastTime = 0;
                            frameRef.current = window.requestAnimationFrame(step);
                        }, delay);
                        return;
                    }
                } else if (phase.current === 'erasing') {
                    indexRef.current--;
                    setContent(printerInfo.slice(0, indexRef.current));

                    // 回退到零时，完成一遍周期
                    if (indexRef.current <= 0) {
                        // 文本回退完毕，等待后执行回调再重新开始
                        phase.current = 'typing';
                        clearAll();
                        waitTimeout.current = window.setTimeout(() => {
                            afterExecuted?.();
                            lastTime = 0;
                            frameRef.current = window.requestAnimationFrame(step);
                        }, delay);
                        return;
                    }
                }
            }
            frameRef.current = window.requestAnimationFrame(step);
        };

        // 初始化并开始动画
        phase.current = 'typing';
        indexRef.current = 0;
        frameRef.current = window.requestAnimationFrame(step);

        return () => clearAll();
    }, [printerInfo, duration, delay, working, afterExecuted]);

    return <>{children(content + (showCursor ? '|' : ''))}</>;
};

export default Printer;
