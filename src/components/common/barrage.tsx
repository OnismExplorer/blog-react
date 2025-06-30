import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import {treeHole} from "@type/treeHole";

/**
 * 内部使用的弹幕项类型，带轨道和时长
 */
type BarrageItem = treeHole & {
    lane: number;
    duration: number;
    initialPosition?: number; // 初始位置百分比，用于错开弹幕
    isNew?: boolean; // 标记是否为新添加的弹幕
    highlight?: boolean; // 是否高亮显示
};

export interface BarrageProps {
    barrageList: treeHole[];
    /** 容器高度，像素，默认 200px */
    height?: number;
    /** 基础速度，单位秒，默认 10s/次 */
    speed?: number;
    /** 速度浮动范围，单位秒，默认 5s */
    speedVariation?: number;
    /** 自定义弹幕项的 Tailwind 类名 */
    containerClassName?: string;
    /** 容器额外内联样式 */
    itemClassName?: string;
    /** 是否启用初始位置随机化，避免弹幕重叠 */
    randomizeInitialPosition?: boolean;
    /** 弹幕与容器上下边界的安全距离，像素，默认 10px */
    marginY?: number;
}

export interface BarrageHandle {
    addBarrage: (item: treeHole) => void;
}

const ITEM_HEIGHT = 40; // 单条弹幕高度

const Barrage = forwardRef<BarrageHandle, BarrageProps>(({                                                             barrageList,
                                                             height = 200,
                                                             speed = 10,
                                                             speedVariation = 5,
                                                             containerClassName = '',
                                                             itemClassName = {},
                                                             randomizeInitialPosition = true,
                                                             marginY = 10,
                                                         }, ref) => {
    const [items, setItems] = useState<BarrageItem[]>([]);
    const lanesRef = useRef<number[]>([]);
    // 计算可用轨道数量，考虑上下边距
    const availableHeight = height - (marginY * 2);
    const laneCount = Math.floor(availableHeight / ITEM_HEIGHT);

    // 初始化轨道空闲时间
    useEffect(() => {
        lanesRef.current = Array(laneCount).fill(0);
    }, [laneCount]);

    // 获取随机时长
    const getDuration = () => {
        const min = speed - speedVariation;
        const max = speed + speedVariation;
        return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    };

    // 在所有可用轨道中随机选择一个尚未被占用或最先空闲的轨道
    const pickLane = () => {
        const now = performance.now() / 1000;
        const freeLanes = lanesRef.current
            .map((freeTime, idx) => ({ idx, freeTime }))
            .filter(l => l.freeTime <= now);
        if (freeLanes.length > 0) {
            const rand = Math.floor(Math.random() * freeLanes.length);
            return freeLanes[rand].idx;
        }
        // 若无空闲，则选择最早空闲的
        let earliest = lanesRef.current[0];
        let laneIndex = 0;
        lanesRef.current.forEach((t, i) => {
            if (t < earliest) {
                earliest = t;
                laneIndex = i;
            }
        });
        return laneIndex;
    };

    // 分配轨道并更新空闲时间
    const assignLane = (duration: number) => {
        const lane = pickLane();
        lanesRef.current[lane] = performance.now() / 1000 + duration;
        return lane;
    };

    // 计算轨道的实际位置，考虑上边距
    const getLanePosition = (lane: number) => {
        return marginY + (lane * ITEM_HEIGHT);
    };

    // 获取随机初始位置（0-100%）
    const getRandomInitialPosition = () => {
        return Math.floor(Math.random() * 100);
    };

    // 初始化列表，添加错开的初始位置
    useEffect(() => {
        if (barrageList.length === 0) return;

        // 将弹幕分散到不同的初始位置，避免重叠
        const init = barrageList.map((item, index) => {
            const duration = getDuration();
            const lane = assignLane(duration);

            // 如果启用随机初始位置，则根据索引或随机值设置初始位置
            // 这样可以确保初始弹幕不会全部从同一位置开始
            const initialPosition = randomizeInitialPosition
                ? (index * (100 / Math.min(barrageList.length, 10)) + getRandomInitialPosition() / 10) % 100
                : 0;

            return { ...item, duration, lane, initialPosition };
        });

        setItems(init);
    }, [barrageList, randomizeInitialPosition]);

    // 暴露方法
    useImperativeHandle(ref, () => ({
        addBarrage(item: treeHole) {
            const duration = getDuration();
            const lane = assignLane(duration);
            // 新添加的弹幕从右侧开始，并标记为新弹幕和高亮状态
            setItems(prev => [...prev, {
                ...item,
                duration,
                lane,
                initialPosition: 0,
                isNew: true,
                highlight: true
            }]);
        }
    }), [speed, speedVariation]);

    // 处理每次动画循环时重新分配轨道
    const handleIteration = (e: React.AnimationEvent<HTMLDivElement>, itemId?: number) => {
        const elem = e.currentTarget;
        const duration = parseFloat(getComputedStyle(elem).animationDuration);
        const newLane = assignLane(duration);
        elem.style.top = `${getLanePosition(newLane)}px`;

        // 如果是新弹幕，完成一次循环后取消高亮
        if (itemId) {
            setItems(prev => prev.map(item => {
                if (item.id === itemId && item.highlight) {
                    return { ...item, highlight: false };
                }
                return item;
            }));
        }
    };

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height: `${height}px`}}
        >
            {items.map(item => (
                <div
                    key={`${item.id}-${item.createTime}-${item.duration}`}
                    className={`absolute flex items-center space-x-2 whitespace-nowrap animate-barrage-scroll ${containerClassName}`}
                    style={{
                        top: getLanePosition(item.lane),
                        animationDuration: `${item.duration}s`,
                        right: item.initialPosition ? `-${item.initialPosition}%` : '0%', // 使用初始位置错开弹幕
                    }}
                    onAnimationIteration={(e) => handleIteration(e, item.id)}
                >
                    <img
                        src={item.avatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onMouseEnter={e => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.animationPlayState = 'paused';
                        }}
                        onMouseLeave={e => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.animationPlayState = 'running';
                        }}
                    />
                    <span
                        className={`px-2 py-1 bg-gray-800 bg-opacity-50 text-white rounded-2xl cursor-pointer ${itemClassName} ${item.highlight ? 'animate-barrage-highlight border-2 border-yellow-400 bg-opacity-70' : ''}`}
                        onMouseEnter={e => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.animationPlayState = 'paused';
                        }}
                        onMouseLeave={e => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.animationPlayState = 'running';
                        }}
                    >
                        {item.message}
                    </span>
                </div>
            ))}
        </div>
    );
});

export default Barrage;
