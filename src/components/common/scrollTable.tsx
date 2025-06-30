import React, {useEffect, useRef, useState} from 'react';
import {Table, Button} from 'antd';
import type {TableProps, TablePaginationConfig} from 'antd';
import {ArrowDownToLine, ArrowUpToLine} from 'lucide-react';

export interface ScrollTableProps<RecordType> extends Omit<TableProps<RecordType>, 'pagination'> {
    /**
     * 表体滚动高度 (px)
     * @default 410
     */
    bodyHeight?: number;

    /**
     * 表的分页配置
     */
    pagination?: false | TablePaginationConfig;
}

/**
 * ScrollTable 包装 Ant Design Table 并添加一个 scroll-to-bottom 按钮。
 */
export function ScrollTable<RecordType>(props: ScrollTableProps<RecordType>) {
    const {bodyHeight = 410, className, pagination, ...rest} = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const tableBodyRef = useRef<HTMLDivElement | null>(null);
    const [isBottom, setIsBottom] = useState(false);
    const [hasScroll, setHasScroll] = useState(false);

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
    }, [rest.dataSource, bodyHeight, checkScroll]);

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

    return (
        <div className={className} style={{position: 'relative'}} ref={containerRef}>
            <Table<RecordType>
                {...rest}
                pagination={tablePagination}
                scroll={{y: bodyHeight}}
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
