import React, {useEffect, useRef, useState} from 'react';
import {Table, Button} from 'antd';
import type {TableProps, TablePaginationConfig} from 'antd';
import {ArrowDownToLine, ArrowUpToLine} from 'lucide-react';

export interface ScrollTableProps<RecordType> extends Omit<TableProps<RecordType>, 'pagination'> {
    /**
     * 表体滚动高度 (px) - 可选，如果不设置将自动计算
     */
    bodyHeight?: number;

    /**
     * 相对于视口高度的偏移量 (px) - 用于自动计算高度时的余量
     * @default 200
     */
    offsetHeight?: number;

    /**
     * 最小高度 (px)
     * @default 300
     */
    minHeight?: number;

    /**
     * 最大高度 (px)
     */
    maxHeight?: number;

    /**
     * 表的分页配置
     */
    pagination?: false | TablePaginationConfig;

    /**
     * 是否启用响应式高度
     * @default true
     */
    responsive?: boolean;
}

/**
 * ScrollTable 包装 Ant Design Table 并添加一个 scroll-to-bottom 按钮，支持响应式高度调整。
 */
export function ScrollTable<RecordType>(props: ScrollTableProps<RecordType>) {
    const {
        bodyHeight,
        offsetHeight = 200,
        minHeight = 300,
        maxHeight,
        responsive = true,
        className,
        pagination,
        ...rest
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const tableBodyRef = useRef<HTMLDivElement | null>(null);
    const [isBottom, setIsBottom] = useState(false);
    const [hasScroll, setHasScroll] = useState(false);
    const [calculatedHeight, setCalculatedHeight] = useState(bodyHeight || 410);

    // 计算响应式高度
    const calculateHeight = () => {
        if (!responsive || bodyHeight) return bodyHeight || 410;

        const viewportHeight = window.innerHeight;
        const containerElement = containerRef.current;

        if (!containerElement) return minHeight;

        // 获取容器距离顶部的距离
        const rect = containerElement.getBoundingClientRect();
        const availableHeight = viewportHeight - rect.top - offsetHeight;

        let targetHeight = Math.max(minHeight, availableHeight);
        if (maxHeight) {
            targetHeight = Math.min(maxHeight, targetHeight);
        }

        return targetHeight;
    };

    // 监听窗口大小变化
    useEffect(() => {
        if (!responsive || bodyHeight) return;

        const handleResize = () => {
            const newHeight = calculateHeight();
            setCalculatedHeight(newHeight);
        };

        // 初始计算
        handleResize();

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);

        // 监听容器位置变化（如果有其他元素影响布局）
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(handleResize, 100); // 延迟执行避免频繁计算
        });

        if (containerRef.current?.parentElement) {
            resizeObserver.observe(containerRef.current.parentElement);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [responsive, bodyHeight, offsetHeight, minHeight, maxHeight]);

    const checkScroll = () => {
        const body = containerRef.current?.querySelector<HTMLDivElement>('.ant-table-body');
        if (!body) return;
        tableBodyRef.current = body;

        const {scrollTop, clientHeight, scrollHeight} = body;
        setIsBottom(Math.ceil(scrollTop + clientHeight) >= scrollHeight);
        setHasScroll(scrollHeight > clientHeight);
    };

    useEffect(() => {
        const body = containerRef.current?.querySelector<HTMLDivElement>('.ant-table-body');
        if (!body) return;
        tableBodyRef.current = body;

        body.addEventListener('scroll', checkScroll);
        checkScroll();

        return () => {
            body.removeEventListener('scroll', checkScroll);
        };
    }, [rest.dataSource, calculatedHeight]);

    const handlePageChange = (page: number, pageSize: number) => {
        if (pagination && pagination.onChange) {
            pagination.onChange(page, pageSize);
        }
        tableBodyRef.current?.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleScrollButton = () => {
        const body = tableBodyRef.current;
        if (!body) return;
        if (!isBottom) {
            body.scrollBy({top: body.clientHeight, behavior: 'smooth'});
        } else {
            body.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const tablePagination =
        pagination === false
            ? false
            : {
                ...pagination,
                onChange: handlePageChange,
            };

    const finalHeight = bodyHeight || calculatedHeight;

    return (
        <div className={className} style={{position: 'relative'}} ref={containerRef}>
            <Table<RecordType>
                {...rest}
                pagination={tablePagination}
                scroll={{y: finalHeight}}
            />

            {hasScroll && (
                <Button
                    className="absolute right-0 bottom-[5%] text-gray-400"
                    shape="circle"
                    onClick={handleScrollButton}
                    icon={isBottom ? <ArrowUpToLine/> : <ArrowDownToLine/>}
                />
            )}
        </div>
    );
}

export default ScrollTable;
