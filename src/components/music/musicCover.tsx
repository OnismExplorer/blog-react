import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

interface MusicCoverProps {
    src: string; // 音乐 url 链接
    size?: number; // 封面大小
    direction?: 'left' | 'right'; // 封面动画方向
}

/**
  * 音乐封面
  */
const MusicCover: React.FC<MusicCoverProps> = ({
                                                   src,
                                                   size = 200,
                                                   direction = 'right',
                                               }) => {

    const [currentSrc, setCurrentSrc] = useState(src);
    const [prevSrc, setPrevSrc] = useState<string | null>(null);

    useEffect(() => {
        if (src !== currentSrc) {
            setPrevSrc(currentSrc);
            setCurrentSrc(src);
        }
    }, [src]);

    const offset = direction === 'left' ? -100 : 100;

    return (
        <div className="relative" style={{width: size, height: size}}>
            {/* 旧碟片：右边淡出 */}
            <AnimatePresence>
                {prevSrc && (
                    <motion.img
                        key="prev"
                        src={prevSrc}
                        className="absolute inset-0 w-full h-full rounded-full object-cover"
                        initial={{x: 0, opacity: 1}}
                        animate={{x: offset, opacity: 0}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.8}}
                        onAnimationComplete={() => setPrevSrc(null)}
                    />
                )}
            </AnimatePresence>

            {/* 新碟片：左边淡入 */}
            <motion.img
                key={currentSrc}
                src={currentSrc}
                className="absolute inset-0 w-full h-full rounded-full object-cover animate-rotate-disc"
                initial={{x: -offset, opacity: 0}}
                animate={{x: 0, opacity: 1}}
                transition={{duration: 0.8}}
            />
        </div>
    );
}

export default MusicCover;
