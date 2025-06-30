import { useEffect, useRef } from 'react';

export interface UseIntervalOptions {
    /** 是否在挂载时立即执行一次 */
    immediate?: boolean;
    /** 是否启用定时器 */
    enabled?: boolean;
    beforeExecuted?:()=>void;
    /** 每次主逻辑执行完后的钩子 */
    afterExecuted?: () => void;
}

/**
 * 定时执行任务
 * @param callback 执行操作本身
 * @param duration 间隔时间(单位 ms)
 * @param options 参数选项
 */
export function useInterval(
    callback: () => void, // 执行操作
    duration: number | null, // 间隔 duration ms 执行一次
    options: UseIntervalOptions = {}
) {
    const {
        immediate = false,
        enabled = true,
        beforeExecuted = ()=>{},
        afterExecuted = () => {},
    } = options;

    const savedCallback = useRef<() => void>();
    const savedBeforeExecute = useRef<() => void>();
    const savedAfterExecuted = useRef<() => void>();

    // 保存最新的 callback 引用
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // 保存最新的 beforeExecute 引用
    useEffect(() => {
        savedBeforeExecute.current = beforeExecuted;
    },[beforeExecuted]);

    // 保存最新的 afterExecuted 引用
    useEffect(() => {
        savedAfterExecuted.current = afterExecuted;
    }, [afterExecuted]);

    // 如果 enabled && immediate，在挂载时立即执行一次
    useEffect(() => {
        if (enabled && immediate) {
            // 操作前执行
            savedBeforeExecute.current?.();
            // 执行操作
            savedCallback.current?.();
            // 操作后执行
            savedAfterExecuted.current?.();
        }
        // 只在挂载时检查一次
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 根据 enabled 和 delay 注册/清理定时器
    useEffect(() => {
        if (!enabled || duration === null) {
            return;
        }

        // 挂载延迟任务
        const id = window.setInterval(() => {
            savedBeforeExecute.current?.();
            savedCallback.current?.();
            savedAfterExecuted.current?.();
        }, duration);

        // 清理延时器
        return () => {
            window.clearInterval(id);
        };
    }, [duration, enabled]);
}
