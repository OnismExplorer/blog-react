import React, {useEffect, useState, useRef} from "react";
import ReactDOM from "react-dom";
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    RotateCcw,
    X,
} from "lucide-react";

interface ImageProps {
    src?: string;
    alt?: string;
    className?: string;
    draggable?: boolean; // 是否开启拖拽
    zoomable?: boolean; // 是否可以缩放
    onError?: () => void; // 触发异常处理
    title?: string | null; // null 则禁用 title
    lazy?: boolean; //是否开启懒加载
}

const Image: React.FC<ImageProps> = ({
                                         src = "",
                                         alt = "image",
                                         draggable = true,
                                         zoomable = true,
                                         className = "",
                                         title = '',
                                         lazy = false,
                                         onError,
                                     }) => {
    const [isZoom, setIsZoom] = useState(false);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [hasError, setHasError] = useState<boolean>(false);

    // --- 状态用于拖拽 ---
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({x: 0, y: 0});
    const startDragPos = useRef({x: 0, y: 0});
    const zoomedImageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 重置图片位置和状态
    const resetImageState = () => {
        setScale(1);
        setRotate(0);
        setPosition({x: 0, y: 0});
    };

    const handleZoomIn = () => {
        setPosition({x: 0, y: 0}); // 缩放时重置位置
        setScale((prev) => Math.min(prev + 0.2, 3));
    };
    const handleZoomOut = () => {
        setPosition({x: 0, y: 0}); // 缩放时重置位置
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };
    const handleRotateCw = () => {
        setPosition({x: 0, y: 0}); // 旋转时重置位置
        setRotate((prev) => prev + 90);
    };
    const handleRotateCcw = () => {
        setPosition({x: 0, y: 0}); // 旋转时重置位置
        setRotate((prev) => prev - 90);
    };
    const handleClose = () => {
        setIsZoom(false);
        resetImageState();
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    // --- 拖拽处理逻辑 ---
    const handleMouseDown = (e: React.MouseEvent) => {
        // 只有在图片放大后才允许拖拽
        if (scale <= 1) return;

        e.preventDefault();
        setIsDragging(true);
        startDragPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const imageEl = zoomedImageRef.current;
        const containerEl = containerRef.current;
        if (!imageEl || !containerEl) return;

        // 计算图片的虚拟尺寸（放大后）
        const scaledWidth = imageEl.offsetWidth * scale;
        const scaledHeight = imageEl.offsetHeight * scale;

        // 计算图片超出容器的部分（这是可以移动的总范围）
        const offsetX = Math.max(0, scaledWidth - containerEl.clientWidth);
        const offsetY = Math.max(0, scaledHeight - containerEl.clientHeight);

        // 可移动的边界（从中心点算起，所以除以2）
        const maxPosX = offsetX / 2;
        const maxPosY = offsetY / 2;

        let newX = e.clientX - startDragPos.current.x;
        let newY = e.clientY - startDragPos.current.y;

        // 限制拖拽范围，确保图片不会被完全拖出容器
        newX = Math.max(-maxPosX, Math.min(maxPosX, newX));
        newY = Math.max(-maxPosY, Math.min(maxPosY, newY));

        setPosition({x: newX, y: newY});
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        document.body.style.overflow = isZoom ? "hidden" : "";
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isZoom]);

    return (
        <>
            <img
                src={src}
                loading={lazy ? 'lazy' : 'eager'}
                alt={alt}
                className={`w-full h-full object-cover cursor-pointer select-none ${className}`}
                draggable={draggable}
                title={title ? title === '' ? zoomable ? '点击放大图片' : '背景图片' : title : ''}
                onClick={() => zoomable && setIsZoom(true)}
                onError={() => {
                    setHasError(true);
                    if (onError) onError();
                }}
            />

            {!hasError && zoomable && isZoom &&
                ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 flex flex-col z-50 select-none"
                        onWheel={handleWheel}
                        onDoubleClick={handleClose}
                    >
                        {/* 图片容器 */}
                        <div
                            ref={containerRef}
                            className="flex-1 flex justify-center items-center p-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                ref={zoomedImageRef}
                                src={src}
                                alt={alt}
                                draggable={false}
                                // 关键改动：设定一个基础尺寸，而不是100%，以便scale能正确溢出
                                className="max-w-[80vw] max-h-[80vh]"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
                                    transition: isDragging ? "none" : "transform 0.2s ease-in-out",
                                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                }}
                                title={"双击可放大图片，双击背景可关闭"}
                                onMouseDown={handleMouseDown}
                                onDoubleClick={(e) => { // 需求2: 双击图片放大
                                    e.stopPropagation();
                                    handleZoomIn();
                                }}
                                onError={onError}
                            />
                        </div>

                        {/* 控制栏 */}
                        <div
                            className="z-[100] flex justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()} // 需求3: 阻止控制栏的双击事件冒泡
                        >
                            <div className="flex bg-gray-700 bg-opacity-70 text-white space-x-4 rounded-lg shadow p-2">
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    title="放大"
                                >
                                    <ZoomIn size={25}/>
                                </button>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    title="缩小"
                                >
                                    <ZoomOut size={25}/>
                                </button>
                                <button
                                    onClick={handleRotateCcw}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    title="向左旋转"
                                >
                                    <RotateCcw size={25}/>
                                </button>
                                <button
                                    onClick={handleRotateCw}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    title="向右旋转"
                                >
                                    <RotateCw size={25}/>
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    title="关闭"
                                >
                                    <X size={25}/>
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default Image;
