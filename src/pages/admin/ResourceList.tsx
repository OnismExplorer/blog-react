import {DeleteOutlined} from "@ant-design/icons";
import {Button, Image, message, Modal, Select, Switch, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import React, {useEffect, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import FileUpload from "@components/common/fileUpload";
import {page} from "@type/page";
import {changeResourceStatus, getResourceList, handleDeleteResource} from "../../api/resource";
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {resource} from "@type/resource";

interface Pagination extends page {
    resourceType: string | null; // 资源类型
}

const ResourceList: React.FC = () => {

    const {common} = useAppContext();
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        resourceType: null,
    })
    const [resourceType, setResourceType] = useState<string | null>(null);
    const [resources, setResources] = useState<resource[]>([]);
    const [showDialog, setShowDialog] = useState<boolean>(false);

    const handleDelete = (path: string) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered: true,
            content: '确认删除资源',
            okType: 'danger',
            style: {alignItems: 'center', justifyItems: 'center'},
            onOk() {
                handleDeleteResource(path)
                    .then(() => {
                        message.success("删除成功！").then();
                        setPagination(prev => ({
                            ...prev,
                            pageNumber:1,
                        }))
                        getResources();
                    })
            },
            onCancel() {
                message.success('已取消删除！').then();
            }
        });
    }

    const handleAddResouces = () => {
        if (common.isEmpty(resourceType)) {
            message.error('请先选择资源类型！').then();
            return false;
        }

        return true;
    }

    const getResources = () => {
        getResourceList(pagination, true)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setResources(result.records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.totalRow
                    }));
                }
            })
    }

    useEffect(() => {
        getResources();
    }, [pagination.pageNumber, pagination.resourceType]);

    const changeStatus = (id: number, status: boolean) => {
        changeResourceStatus({id: id, status: status})
            .then(() => {
                message.success("修改成功！").then();
                getResources();
            })
    }

    const handlePageChange = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber
        }))
        getResources();
    }

    const options = [
        {key: '1', label: '用户头像', value: 'userAvatar'},
        {key: '2', label: '文章封面', value: 'articleCover'},
        {key: '3', label: '文章图片', value: 'articlePicture'},
        {key: '5', label: '网站头像', value: 'webAvatar'},
        {key: '4', label: '背景图片', value: 'webBackgroundImage'},
        {key: '6', label: '随机头像', value: 'randomAvatar'},
        {key: '7', label: '随机封面', value: 'randomCover'},
        {key: '8', label: '画笔图片', value: 'graffiti'},
        {key: '9', label: '评论图片', value: 'commentPicture'},
        {key: '10', label: '表情包', value: 'internetMeme'},
        {key: '11', label: '音乐声音', value: 'funnyUrl'},
        {key: '12', label: '音乐封面', value: 'funnyCover'},
        {key: '13', label: '告白墙封面', value: 'love/bgCover'},
        {key: '14', label: '男主头像', value: 'love/manCover'},
        {key: '15', label: '女主头像', value: 'love/womanCover'},
        {key: '16', label: '收藏夹封面', value: 'favoritesCover'},
        {key: '17', label: '公共资源', value: 'assets'},
    ];

    const columns: ColumnsType<resource> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center',
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 80,
            align: 'center',
        },
        {
            title: '资源类型',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            align: 'center',
        },
        {
            title: '状态',
            key: 'status',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2 select-none">
                    <Tag color={record.status ? 'success' : 'error'}>
                        {record.status ? '启用' : '禁用'}
                    </Tag>
                    <Switch
                        checked={record.status}
                        onChange={(checked) => changeStatus(record.id, checked)}
                        size="small"
                    />
                </div>
            ),
        },
        {
            title: '路径',
            key: 'path',
            align: 'center',
            width: 120,
            render: (_, record) => {
                // 检查是否为图片类型
                const isImage = !common.isEmpty(record.mimeType) && record.mimeType.includes('image');

                if (isImage) {
                    return (
                        <Image
                            src={record.path}
                            alt="资源预览"
                            width={75}
                            height={75}
                            style={{objectFit: 'cover'}}
                            draggable={false}
                            preview={{
                                src: record.path,
                            }}
                            placeholder={
                                <div className="w-[60px] h-[60px] bg-gray-200 flex items-center justify-center select-none">
                                    加载中...
                                </div>
                            }
                        />
                    );
                }

                return (
                    <a href={record.path} target="_blank"
                       className="text-sm text-gray-600 max-w-[200px] hover:text-themeBackground" title={record.path}>
                        {record.path}
                    </a>
                );
            },
        },
        {
            title: '大小(KB)',
            key: 'size',
            align: 'center',
            render: (_, record) => Math.round(record.size / 1024),
        },
        {
            title: '类型',
            dataIndex: 'mimeType',
            key: 'mimeType',
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
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined/>}
                    onClick={() => handleDelete(record.path)}
                >
                    删除
                </Button>
            ),
        },
    ];

    /**
     * 资源选择框
     */
    const resourceSelect = (handleChange: (value: string) => void, value?: string) => {
        return (
            <Select
                allowClear
                value={value}
                options={options}
                placeholder="资源类型"
                className="mr-2 mb-2"
                onChange={(value) => handleChange(value)}
                style={{width: 108}}
            />
        );
    }

    const handleClose = () => {
        setShowDialog(false);
        setResourceType(null);
    }

    // 上传成功后的回调
    const handleUploadSuccess = () => {
        message.success("上传成功！").then();
        getResources(); // 重新获取资源列表
        handleClose(); // 关闭弹窗
    }

    /**
      * 文件类型
      */
    const fileTypes = ['funnyUrl','assets'];


    return (
        <div className="h-full overflow-hidden flex flex-col select-none">
            <div>
                <div className="mb-2 flex flex-row gap-2">
                    {resourceSelect(
                        (value) => setPagination(prev => ({...prev, resourceType: value})),
                        pagination.resourceType || undefined
                    )}
                    <Button type='primary' onClick={() => setShowDialog(true)}>新增资源</Button>
                </div>
                <ScrollTable<resource>
                    columns={columns}
                    dataSource={resources}
                    rowKey="id"
                    pagination={false}
                    bodyHeight={402}
                    rowClassName="font-custom text-sm  select-text"
                />
                <ProPage
                    current={pagination.pageNumber}
                    size={pagination.pageSize}
                    total={pagination.total}
                    onPageChange={handlePageChange}
                />
            </div>

            <Modal
                title={<span className="text-base font-custom">图片</span>}
                open={showDialog}
                onCancel={handleClose}
                style={{
                    textAlign:'center'
                }}
                destroyOnHidden
                centered
                footer={null} // 去除按钮
            >
                <FileUpload isAdmin={true}
                            header={resourceSelect(
                                (value) => setResourceType(value),
                                resourceType || undefined
                            )}
                            prefix={resourceType || ''}
                            beforeExecute={() => handleAddResouces()}
                            onUpload={handleUploadSuccess}
                            maxNumber={10}
                            maxSize={5}
                            listType={fileTypes.includes(resourceType || '') ? 'file' : 'picture'}
                />
            </Modal>
        </div>
    )
}

export default ResourceList
