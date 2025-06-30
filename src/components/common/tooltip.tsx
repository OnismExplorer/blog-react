import React, {ReactNode, useState, useRef} from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

/**
 * 内容提示框
 * @param children 子元素
 * @param content 提示内容
 * @param position 提示框出现位置
 * @param className 提示框元素属性
 */
const Tooltip: React.FC<TooltipProps> = ({
                                             children,
                                             content,
                                             position = 'bottom',
                                             className = '',
                                         }) => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({top: 0, left: 0});
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 鼠标移入时，计算目标元素的位置
    const handleMouseEnter = () => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        let top = 0, left = 0;

        switch (position) {
            case 'top':
                top = rect.top - 8; // 8px 空隙
                left = rect.left + rect.width / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + rect.width / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - 8;
                break;
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + 8;
                break;
        }

        setCoords({top, left});
        setVisible(true);
    };

    return (
        <>
            <div
                ref={wrapperRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setVisible(false)}
                className="inline-block"
            >
                {children}
            </div>

            {visible &&
                ReactDOM.createPortal(
                    <div
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            zIndex: 9999,
                        }}
                        className={`p-2 rounded bg-lightGreen text-white text-base 
                        whitespace-nowrap shadow-lg pointer-events-none transform animate-hideToShow-0.3
                        ${position === 'top' ? '-translate-x-1/2 -translate-y-[100%]' : ''}
                        ${position === 'bottom' ? '-translate-x-1/2 translate-y-0' : ''}
                        ${position === 'left' ? '-translate-x-[100%] -translate-y-[50%]' : ''}
                        ${position === 'right' ? '-translate-x-0 -translate-y-[50%]' : ''}
                        ${className}`
                    }
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    );
};

export default Tooltip;
