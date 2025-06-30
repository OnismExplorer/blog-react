import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Image, Input, message, Modal, Popconfirm, Select, Switch, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import {SquarePlus} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {changeArticleStatus, getArticleList, handleDeleteArticle} from "@api/article";
import {getSortAndLabelList} from "@api/webInfo";
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {useAppContext} from "@hooks/useAppContext";
import {useStore} from "@hooks/useStore";
import {article} from "@type/article";
import {label} from "@type/label";
import {page} from "@type/page";
import {sort} from "@type/sort";

interface Pagination extends page {
    searchKey: string | null;
    recommendStatus: boolean | null;
    sortId: number | null;
    labelId: number | null;
}

const PostList: React.FC = () => {

    const {common} = useAppContext();
    const store = useStore();
    const [articles, setArticles] = useState<article[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        searchKey: '',
        recommendStatus: null,
        sortId: null,
        labelId: null
    })
    const [sorts, setSort] = useState<sort[]>([]);
    const [labels, setLabels] = useState<label[]>([]);
    const [sortLabels, setSortLabels] = useState<label[]>([]);
    const navigate = useNavigate();

    // 监听分类变化，更新标签选项
    useEffect(() => {
        setPagination(prev => ({...prev, labelId: null}));
        if (pagination.sortId && labels.length > 0) {
            setSortLabels(labels.filter(l => l.sortId === pagination.sortId));
        } else {
            setSortLabels([]);
        }
    }, [pagination.sortId, labels]);

    useEffect(() => {
        getArticles();
    }, [pagination.pageNumber, pagination.sortId, pagination.labelId, pagination.searchKey, pagination.recommendStatus]);

    useEffect(() => {
        getSortsAndLabels();
    }, []);

    const getArticles = () => {
        getArticleList(pagination, store.state.currentAdmin.role!)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setArticles(result.records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.totalRow
                    }))
                }
            })
    }

    const getSortsAndLabels = () => {
        getSortAndLabelList()
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setSort(result.sorts);
                    setLabels(result.labels);
                }
            })
    }

    const changeStatus = (param: Record<string, unknown>) => {
        changeArticleStatus(param)
            .then(() => {
                message.success('修改成功！').then();
                getArticles();
            })
    }

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okType: "danger",
            width: '15%',
            style: {alignItems: 'center', textAlign: 'center'},
            centered: true,
            onOk() {
                handleDeleteArticle(id)
                    .then(() => {
                        message.success('删除成功！').then();
                        setPagination(prev => ({
                            ...prev,
                            pageNumber: 1,
                        }))
                        getArticles();
                    })
            }
        })
    }

    const handleEdit = (id: number) => {
        navigate(`/admin/articleEdit?id=${id}`)
    }


    const columns: ColumnsType<article> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 62,
            align: 'center',
        },
        {
            title: '作者',
            dataIndex: 'username',
            key: 'username',
            align: 'center',
        },
        {
            title: '文章标题',
            width: 100,
            dataIndex: 'articleTitle',
            key: 'articleTitle',
            align: 'center',
        },
        {
            title: '分类',
            dataIndex: ['sort', 'sortName'],
            key: 'sortName',
            align: 'center',
        },
        {
            title: '标签',
            dataIndex: ['label', 'labelName'],
            key: 'labelName',
            align: 'center',
        },
        {
            title: '浏览量',
            dataIndex: 'viewCount',
            key: 'viewCount',
            align: 'center',
        },
        {
            title: '点赞数',
            dataIndex: 'likeCount',
            key: 'likeCount',
            align: 'center',
        },
        {
            title: '是否可见',
            key: 'viewStatus',
            align: 'center',
            width: 88,
            render: (_, record) => (
                <div className="flex items-center justify-center select-none">
                    <Tag color={record.viewStatus ? 'success' : 'error'}>
                        {record.viewStatus ? '可见' : '不可见'}
                    </Tag>
                    <Switch
                        size='small'
                        checked={record.viewStatus}
                        onChange={(checked) => {
                            const param = {articleId: record.id, viewStatus: checked};
                            changeStatus(param);
                            message.warning('注意，文章不可见时必须设置密码才能访问！').then();
                        }}
                    />
                </div>
            ),
        },
        {
            title: '封面',
            key: 'articleCover',
            align: 'center',
            render: (_, record) => (
                <Image
                    src={record.articleCover}
                    alt="封面"
                    width={40}
                    height={40}
                    className="rounded"
                />
            ),
        },
        {
            title: '是否启用评论',
            key: 'commentStatus',
            align: 'center',
            render: (_, record) => (
                <div className="flex items-center justify-center select-none">
                    <Tag color={record.commentStatus ? 'success' : 'error'}>
                        {record.commentStatus ? '是' : '否'}
                    </Tag>
                    <Switch
                        size='small'
                        checked={record.commentStatus}
                        onChange={(checked) => {
                            const param = {articleId: record.id, commentStatus: checked};
                            changeStatus(param);
                        }}
                    />
                </div>
            ),
        },
        {
            title: '是否推荐',
            key: 'recommendStatus',
            align: 'center',
            render: (_, record) => (
                <div className="flex items-center justify-center select-none">
                    <Tag color={record.recommendStatus ? 'success' : 'error'}>
                        {record.recommendStatus ? '是' : '否'}
                    </Tag>
                    <Switch
                        size='small'
                        checked={record.recommendStatus}
                        onChange={(checked) => {
                            const param = {articleId: record.id, recommendStatus: checked};
                            changeStatus(param);
                        }}
                    />
                </div>
            ),
        },
        {
            title: '评论数',
            dataIndex: 'commentCount',
            key: 'commentCount',
            align: 'center',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
        },
        {
            title: '最终修改时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
            align: 'center',
        },
        {
            title: '操作',
            key: 'action',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <div
                    className="flex flex-row justify-center gap-1 cursor-pointer select-none">
                    <span className='flex flex-row gap-1 items-center justify-center text-blue-500 hover:text-blue-400'
                          onClick={() => handleEdit(record.id!)}>
                        <EditOutlined/>
                        <span>编辑</span>
                    </span>

                    <Popconfirm
                        title="确认删除该文章？"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="确定"
                        okType="danger"
                        cancelText="取消"
                    >
                    <span className='flex flex-row gap-1 text-red-500 hover:text-red-400 items-center justify-center'>
                        <DeleteOutlined/>
                        <span>删除</span>
                    </span>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const clearSearch = () => {
        setPagination({
            pageNumber: 1,
            pageSize: 10,
            total: 0,
            searchKey: '',
            recommendStatus: null,
            sortId: null,
            labelId: null
        })
        setSortLabels([]);
    }

    /**
     * 处理翻页
     */
    const handlePageChage = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber
        }));
        getArticles();
    }

    return (
        <div className="h-full overflow-hidden flex flex-col select-none font-custom">
            <div className='flex flex-row gap-2'>
                <Select
                    allowClear
                    value={pagination.recommendStatus}
                    options={[
                        {label: '推荐文章', value: true},
                        {label: '普通文章', value: false},
                    ]}
                    placeholder="是否推荐"
                    className="mr-2 mb-2 w-[98px]"
                    onChange={(e) => (setPagination(prev => ({...prev, recommendStatus: e})))}
                />
                <Select
                    allowClear
                    value={pagination.sortId}
                    placeholder='请选择分类'
                    options={sorts.map(item => (
                        {label: item.sortName, value: item.id}
                    ))}
                    className="mr-2 mb-2 w-[116px]"
                    onChange={(e) => (setPagination(prev => ({...prev, sortId: e})))}
                />
                <Select
                    allowClear
                    value={pagination.labelId}
                    placeholder='请选择标签'
                    notFoundContent='请先选择分类'
                    options={sortLabels.map(item => (
                        {label: item.labelName, value: item.id}
                    ))}
                    className="mr-2 mb-2 w-[116px]"
                    onChange={(e) => (setPagination(prev => ({...prev, labelId: e})))}
                />
                <Input placeholder='文章标题' className='w-36 mb-3' value={pagination.searchKey!}
                       onChange={(e) => setPagination(prev => ({...prev, searchKey: e.target.value}))}/>
                <button className="bg-red-500 mb-3 text-white hover:bg-red-400 px-2 rounded-md"
                        onClick={clearSearch}>清除参数
                </button>
                <div
                    className='flex flex-row gap-x-1 rounded-md items-center bg-blue-500 mb-3 px-2 text-white hover:bg-blue-400'
                    onClick={() => navigate('/admin/articleEdit')}>
                    <SquarePlus size={15} className='mt-0.5'/>
                    <span>新增文章</span>
                </div>
            </div>

            <ScrollTable<article>
                columns={columns}
                dataSource={articles}
                rowKey="id"
                pagination={false}
                bodyHeight={382}
                rowClassName="font-custom text-sm  select-text"
            />
            <ProPage
                current={pagination.pageNumber}
                size={pagination.pageSize}
                total={pagination.total}
                buttonCount={10}
                onPageChange={handlePageChage}
            />
        </div>
    )
}

export default PostList;
