import {Button, message, Modal, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import React, {useEffect, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {page} from "@type/page";
import {treeHole} from "@type/treeHole";
import {BaseRequestVO} from "@type/base";
import ScrollTable from "@components/common/scrollTable";
import ProPage from "@components/common/proPage";

const TreeHoleList: React.FC = () => {

    const {common, request} = useAppContext();
    const [pagination, setPagination] = useState<page>({
        pageNumber: 1,
        pageSize: 10,
    });

    const [treeHoles, setTreeHoles] = useState<treeHole[]>([]);

    useEffect(() => {
        getTreeHoles();
    }, []);

    /**
     * 获得树洞留言列表
     */
    const getTreeHoles = () => {
        request.post<BaseRequestVO<treeHole>>("/admin/treeHole/boss/list", pagination, true)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setTreeHoles(result.data.records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.data.totalRow
                    }))
                }
            })
            .catch((error) => {
                message.error(error.message)
                    .then(() => console.error("获取树洞列表信息失败：", error.message));
            })
    }

    const handlePageChange = (currentPage: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: currentPage
        }))
    }

    // 实时监听 pageNumber，实现翻页功能
    useEffect(() => {
        getTreeHoles();
    }, [pagination.pageNumber]);

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered:true,
            content: '确认删除',
            okType: 'danger',
            style: {alignItems:'center',justifyItems:'center'},
            onOk() {
                request.get<string>('/webInfo/deleteTreeHole', {id: id}, true)
                    .then(() => {
                        setPagination(prev => ({...prev, pageNumber: 1}));
                        getTreeHoles();
                        message.success("删除成功").then();
                    })
                    .catch((error) => {
                        message.error(error.message).then(() => console.error('删除失败：', error.message));
                    })
            },
            onCancel() {
                message.success("已取消删除！").then();
            }
        })
    }

    const columns: ColumnsType<treeHole> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
        },
        {
            title: '留言内容',
            dataIndex: 'message',
            key: 'message',
            align: 'center',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
        },
        {
            title: '操作',
            key: 'actions',
            width: 160,
            align: 'center',
            render: (_, record) => (
                <Button type="link" danger onClick={() => handleDelete(record.id ?? 0)}>
                    删除
                </Button>
            ),
        },
    ]

    return (
        <div className="h-full overflow-hidden gap-y-1 flex flex-col select-none">
            <Tag
                className="top-0 z-10 font-custom text-base flex flex-row gap-x-2 px-2 items-center w-full text-left bg-lightYellow border-none h-10 leading-10 m-1 text-fontColor">
                <svg viewBox="0 0 1024 1024" width="20" height="20" style={{verticalAlign: "-3px"}}>
                    <path d="M0 0h1024v1024H0V0z" fill="#202425" opacity=".01"></path>
                    <path
                        d="M682.666667 204.8h238.933333a34.133333 34.133333 0 0 1 34.133333 34.133333v648.533334a68.266667 68.266667 0 0 1-68.266666 68.266666h-204.8V204.8z"
                        fill="#FFAA44"></path>
                    <path
                        d="M68.266667 921.6a34.133333 34.133333 0 0 0 34.133333 34.133333h785.066667a68.266667 68.266667 0 0 1-68.266667-68.266666V102.4a34.133333 34.133333 0 0 0-34.133333-34.133333H102.4a34.133333 34.133333 0 0 0-34.133333 34.133333v819.2z"
                        fill="#11AA66"></path>
                    <path
                        d="M238.933333 307.2a34.133333 34.133333 0 0 0 0 68.266667h136.533334a34.133333 34.133333 0 1 0 0-68.266667H238.933333z m0 204.8a34.133333 34.133333 0 1 0 0 68.266667h409.6a34.133333 34.133333 0 1 0 0-68.266667H238.933333z m0 204.8a34.133333 34.133333 0 1 0 0 68.266667h204.8a34.133333 34.133333 0 1 0 0-68.266667H238.933333z"
                        fill="#FFFFFF"></path>
                </svg>
                <span>留言列表</span>
            </Tag>

            {/* 表格 */}
            <div className="flex-none overflow-hidden">
                <ScrollTable<treeHole>
                    rowKey="id"
                    columns={columns}
                    dataSource={treeHoles}
                    offsetHeight={170} // 距离底部预留 170px 给分页按钮
                    pagination={false}
                    rowClassName="font-custom text-sm"
                />
            </div>

                <ProPage
                    current={pagination.pageNumber}
                    size={pagination.pageSize}
                    total={pagination.total}
                    buttonCount={5}
                    onPageChange={handlePageChange}
                />
        </div>
    )
}

export default TreeHoleList;
