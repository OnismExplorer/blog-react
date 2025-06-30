import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "antd";
import { useStore } from "@hooks/useStore";

// 几何变换加载器（蓝灰渐变）
const GeometricLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="w-4 h-4 bg-gradient-to-r from-blue-400 to-gray-300 rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, 180, 360],
                        borderRadius: ["50%", "25%", "50%"],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// 粒子波浪加载器（白蓝灰）
const ParticleWaveLoader: React.FC = () => {
    return (
        <div className="flex items-end justify-center space-x-1">
            {Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                    key={index}
                    className="w-2 bg-gradient-to-t from-blue-300 to-gray-400 rounded-full"
                    animate={{
                        height: [20, 40, 20],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.1,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// 脉冲圆环加载器（灰蓝色环）
const PulseRingLoader: React.FC = () => {
    return (
        <div className="relative flex items-center justify-center">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="absolute border-4 border-blue-300 rounded-full"
                    style={{
                        width: 60 + index * 20,
                        height: 60 + index * 20,
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.3, 1],
                        borderColor: [
                            "rgb(147, 197, 253)", // 蓝-300
                            "rgb(203, 213, 225)", // 灰-300
                            "rgb(147, 197, 253)", // 蓝-300
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.4,
                        ease: "easeInOut",
                    }}
                />
            ))}
            <motion.div
                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-gray-300 rounded-full"
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
};

// 文字动画加载器（蓝灰文字）
const TextAnimationLoader: React.FC<{ text?: string }> = ({
                                                              text = "Loading",
                                                          }) => {
    return (
        <div className="flex space-x-1 w-full">
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-gray-500 bg-clip-text text-transparent"
                    animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: index * 0.1,
                        ease: "easeInOut",
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
            <motion.span
                className="text-2xl font-bold text-gray-400"
                animate={{
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                ...
            </motion.span>
        </div>
    );
};

// 螺旋加载器（蓝灰小球）
const SpiralLoader: React.FC = () => {
    return (
        <div className="relative w-20 h-20">
            {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                    key={index}
                    className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-gray-300 rounded-full"
                    style={{
                        top: "50%",
                        left: "50%",
                        transformOrigin: "0 0",
                    }}
                    animate={{
                        rotate: 360,
                        scale: [1, 0.5, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "linear",
                    }}
                    initial={{
                        x: 30 * Math.cos((index * Math.PI) / 3),
                        y: 30 * Math.sin((index * Math.PI) / 3),
                    }}
                />
            ))}
        </div>
    );
};

// 文字解构动画
const TextDeconstructLoader = ({ text = "LOADING" }: { text?: string }) => {
    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-1">
                {text.split("").map((char, index) => (
                    <motion.div
                        key={index}
                        className="relative font-custom"
                        animate={{
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: index * 0.1,
                            ease: "easeInOut",
                        }}
                    >
                        <motion.span
                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent block"
                            animate={{
                                opacity: [1, 0.3, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: index * 0.1,
                            }}
                        >
                            {char}
                        </motion.span>
                        {/* 像素化效果 */}
                        <motion.div
                            className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-px"
                            animate={{
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: index * 0.1 + 0.5,
                            }}
                        >
                            {Array.from({ length: 12 }).map((_, pixelIndex) => (
                                <motion.div
                                    key={pixelIndex}
                                    className="bg-white"
                                    animate={{
                                        scale: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: pixelIndex * 0.02,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ======= 主 Loading 组件：带进度条 + 自动跳转 + 淡出 =======
const Loading: React.FC = () => {
    const navigate = useNavigate();
    const store = useStore();
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // ===== 配置区 =====
    const totalDuration = 1700; // 整个加载过程一共 1700ms（即 1.7 秒跑到 100%）
    const fadeDuration = 300; // 淡出动画时长 300ms
    const updateInterval = 80; // 每 100ms 更新一次进度
    const steps = totalDuration / updateInterval;
    const stepIncrement = 100 / steps;

    const loaders = [
        { component: <GeometricLoader /> },
        { component: <ParticleWaveLoader /> },
        { component: <PulseRingLoader /> },
        { component: <TextAnimationLoader text='Loading'/> },
        { component: <TextDeconstructLoader text={store.state.webInfo.webName} /> },
        { component: <SpiralLoader /> },
    ];
    const [currentLoader, setCurrentLoader] = useState(Math.floor(Math.random() * loaders.length));

    // 模拟加载进度：在 totalDuration 时间内，让 progress 从 0→100
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + stepIncrement;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return newProgress;
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [stepIncrement]);

    // 当进度跑到 100 时，触发 isFinished=true，开始淡出动画
    useEffect(() => {
        if (progress >= 100) {
            setIsFinished(true);
        }
    }, [progress]);

    // 随机切换加载器效果：每隔 2 秒随机选一个 loader
    useEffect(() => {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * loaders.length);
            setCurrentLoader(randomIndex);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {!isFinished ? (
                <motion.div
                    key="loading-container"
                    className="select-none min-h-screen bg-gradient-to-br from-blue-100 via-gray-200 to-blue-200 flex flex-col items-center justify-center p-8"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: fadeDuration / 1000 } }}
                >
                    {/* 背景动画粒子（淡蓝灰小圆点） */}
                    <div className="absolute inset-0 overflow-hidden">
                        {Array.from({ length: 20 }).map((_, index) => (
                            <motion.div
                                key={index}
                                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                                animate={{
                                    x: [0, Math.random() * window.innerWidth],
                                    y: [0, Math.random() * window.innerHeight],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 5,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                }}
                                style={{
                                    left: Math.random() * 100 + "%",
                                    top: Math.random() * 100 + "%",
                                }}
                            />
                        ))}
                    </div>

                    {/* 主要内容 */}
                    <div className="relative z-10 text-center space-y-5 w-full max-w-md">
                        <Avatar
                            size={100}
                            src={store.state.webInfo.avatar}
                            className="animate-rotate"
                        />
                        {/* 标题 */}
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold text-gray-800 mb-8"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            {store.state.webInfo.webTitle}
                        </motion.h1>

                        {/* 当前加载器 */}
                        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentLoader}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center space-y-4"
                                >
                                    {loaders[currentLoader].component}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* 进度条 */}
                        <div className="w-full mb-4">
                            <div className="flex justify-between text-gray-700/60 text-sm mb-2">
                                <span>加载进度</span>
                                <span>{Math.floor(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-400 to-gray-400 rounded-full"
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: updateInterval / 1000 }}
                                />
                            </div>
                        </div>
                        {/* 提示文字 */}
                        <motion.p
                            className="text-gray-700/60 text-sm font-custom"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            请稍后,正在加载中...
                        </motion.p>
                    </div>
                </motion.div>
            ) : (
                // 当 isFinished === true 时，执行淡出动画（exit），并在动画结束后跳转
                <motion.div
                    key="fadeout-container"
                    className="min-h-screen bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: fadeDuration / 1000 }}
                    onAnimationComplete={() => {
                        navigate("/", { replace: true });
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default Loading;
