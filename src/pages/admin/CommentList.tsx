import {Button, InputNumber, message, Modal, Select} from "antd";
import {ColumnsType} from "antd/es/table";
import React, {useEffect, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {comment} from "@type/comment"
import {useStore} from "@hooks/useStore";
import {page} from "@type/page";
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {getCommentList, handleDeleteComment} from "@api/comment";

interface Pagination extends page {
    source?: number | null
    commentType?: string | null
}

const CommentList: React.FC = () => {

    const {common} = useAppContext();
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        source: null,
        commentType: null
    })
    const store = useStore();
    const [comments, setComments] = useState<comment[]>([]);

    const clearSearch = () => {
        setPagination({
            pageNumber: 1,
            pageSize: 10,
            source: null,
            commentType: null,
        })

        getComments();
    }

    useEffect(() => {
        getComments();
    }, []);

    const getComments = () => {

        getCommentList(store.state.currentAdmin.role!,pagination)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setComments(result.records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.totalRow
                    }))
                }
            })
    }

    const handlePageChange = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: pageNumber
        }))
    }

    useEffect(() => {
        getComments();
    }, [pagination.pageNumber, pagination.source, pagination.commentType]);

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            okType: 'danger',
            centered:true,
            style: {textAlign:'center',alignItems:'center'},
            content: (<div>
                <div>删除评论后，所有该评论的回复均不可见</div>
                <div>确认删除？</div>
            </div>),
            onOk() {
                handleDeleteComment(store.state.currentAdmin.role!, id)
                    .then(() => {
                        message.success("删除成功！").then();
                        // 刷新列表
                        setPagination(prev => ({
                            ...prev,
                            pageNumber:1,
                        }))
                        getComments();
                    })
            },
            onCancel() {
                message.success("已取消删除！").then();
            }
        })
    }

    const columns: ColumnsType<comment> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center'
        },
        {
            key: 'source',
            title: '评论来源标识',
            dataIndex: 'source',
            align: 'center',
        },
        {
            key: 'type',
            title: '评论来源类型',
            dataIndex: 'type',
            align: 'center',
        },
        {
            key: 'userId',
            title: '发表用户 ID',
            dataIndex: 'userId',
            align: 'center',
        },
        {
            key: 'username',
            title: '用户名',
            dataIndex: 'username',
            align: 'center'
        },
        {
            key: 'likeCount',
            title: '点赞数',
            dataIndex: 'likeCount',
            align: 'center',
        },
        {
            key: 'commentContent',
            title: '评论内容',
            dataIndex: 'commentContent',
            align: 'center',
        },
        {
            key: 'commentInfo',
            title: '评论额外信息',
            dataIndex: 'commentInfo',
            align: 'center',
        },
        {
            key: 'createTime',
            title: '创建时间',
            dataIndex: 'createTime',
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
        <div className="h-full overflow-hidden flex flex-col select-none font-custom">
            <div className="mb-5 flex flex-row gap-x-2">
                {store.state.currentAdmin.role === 'boss' && (
                    <Select placeholder="评论来源类型"
                            value={pagination.commentType}
                            onChange={(e) => setPagination(prev => ({...prev, commentType: e}))}
                            className="mr-2 pl-10 w-44"
                    >
                        <Select.Option value="article">文章评论</Select.Option>
                        <Select.Option value="message">树洞留言</Select.Option>
                    </Select>
                )}
                <InputNumber className="w-40 mr-2" type="number"
                             value={pagination.source}
                             controls={false}
                             placeholder="评论来源类型/用户 ID"
                             onChange={(e) => setPagination(prev => ({
                                 ...prev,
                                 source: e
                             }))}/>
                <button className="bg-red-500 text-white hover:bg-red-400 py-1 px-2 rounded-md"
                        onClick={clearSearch}>清除参数
                </button>
            </div>

            <div className="flex-none overflow-hidden">
                <ScrollTable<comment>
                    rowKey="id"
                    columns={columns}
                    dataSource={comments}
                    pagination={false}
                    offsetHeight={200} // 距离底部预留 200px 给分页按钮
                    className="table-no-scrollbar"
                    rowClassName="font-custom text-sm"
                    onChange={(page) => handlePageChange(page.current ?? 1)}
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

export default CommentList;
