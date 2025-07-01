import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Button, Form, Image, Input, message, Modal, Popconfirm, Select, Switch, Tag} from "antd";
import {useWatch} from "antd/es/form/Form";
import {ColumnsType} from "antd/es/table";
import {Edit} from "lucide-react";
import React, {useEffect, useState} from "react";
import {
    getResourcePathList,
    handleDeleteResourcePath,
    handleSaveResourcePath,
    handleUpadteResourcePath
} from "@api/webInfo";
import FileUpload from "@components/common/fileUpload";
import ProButton from "@components/common/proButton";
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {useAppContext} from "@hooks/useAppContext";
import {page} from "@type/page";
import {resourcePath} from "@type/resourcePath";

interface Pagination extends page {
    resourceType: string | null;
    status: boolean | null;
}

const ResourcePathList: React.FC = () => {

    const {common,constant} = useAppContext();
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        resourceType: null,
        status: null,
    })
    const [resourcePath, setResourcePath] = useState<resourcePath>({
        title: '',
        classify: '',
        cover: '',
        introduction: '',
        url: '',
        type: '',
        remark: '',
        status: false,
    });
    const [resourcePaths, setResourcePaths] = useState<resourcePath[]>([]);
    const [showCoverDialog, setShowCoverDialog] = useState<boolean>(false);
    const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
    const [showAddResourcePathDialog, setShowAddResourcePathDialog] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [resourcePathForm] = Form.useForm();

    const getResourcePaths = () => {
        getResourcePathList(pagination, true)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setResourcePaths(result.records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.totalRow
                    }))
                }
            })
    }

    /**
     * 更新资源路径状态
     */
    const changeStatus = (param: resourcePath) => {
        param.status = !param.status;
        handleUpadteResourcePath(param)
            .then(() => {
                message.success("修改成功！").then();
                getResourcePaths();
            })
    }

    /**
     * 处理翻页
     */
    const handlePageChage = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber
        }));
        getResourcePaths();
    }

    /**
     * 删除资源路径
     */
    const handleDelete = (id: number | null) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered: true,
            content: '确认删除？',
            okType: 'danger',
            style: {alignItems: 'center', justifyItems: 'center'},
            onOk() {
                handleDeleteResourcePath(id)
                    .then(() => {
                        message.success('删除成功！').then();
                        setPagination(prev => ({
                            ...prev,
                            pageNumber:1,
                        }))
                        getResourcePaths();
                    })
            },
            onCancel() {
                message.success('已取消删除').then();
            }
        });
    }

    /**
     * 添加资源列表
     */
    const handleAddResourcePath = async () => {
        try {
            const value = await resourcePathForm.validateFields();
            const payload = {...resourcePath, ...value};

            if (common.isEmpty(payload.title) || common.isEmpty(payload.type)) {
                message.error("标题和资源类型不能为空！");
                return;
            }

            let response;
            if (isUpdate) {
                response = handleUpadteResourcePath(payload);
            } else {
                response = handleSaveResourcePath(payload);
            }

            response.then(() => {
                message.success("保存成功！").then();
                getResourcePaths();
                clearDialog();
            })

        } catch {
            //
        }
    }

    useEffect(() => {
        getResourcePaths();
    }, [pagination.pageNumber, pagination.resourceType, pagination.status]);

    /**
     * 编辑资源路径
     */
    const handleEdit = (item: resourcePath) => {
        setResourcePath(item);
        setShowAddResourcePathDialog(true);
        resourcePathForm.setFieldsValue(item);
        setIsUpdate(true);
    }


    const clearDialog = () => {
        setIsUpdate(false);
        resourcePathForm.resetFields();
        setResourcePath({
            title: '',
            classify: '',
            cover: '',
            introduction: '',
            url: '',
            type: null,
            remark: '',
            status: false,
        })
        setShowAddResourcePathDialog(false);
    }

    /**
     * 上传成功后回调函数
     */
    const handleUploadSuccess = (target: 'url' | 'cover', result: string) => {
        setResourcePath(prev => ({
            ...prev,
            [target]: result
        }));
        resourcePathForm.setFieldsValue({
            [target]: result
        });
        if (target === 'cover') {
            setShowCoverDialog(false);
        } else {
            setShowUploadDialog(false);
        }
    }

    /**
     * 处理上传封面
     */
    const handleUploadCover = () => {
        const currentType = resourcePathForm.getFieldValue('type') || resourcePath.type;
        if (common.isEmpty(currentType)) {
            message.error('请选择资源类型！').then();
            return;
        }
        setShowCoverDialog(true);
    }

    /**
     * 处理上传文件
     */
    const handleUploadFile = () => {
        const currentType = resourcePathForm.getFieldValue('type') || resourcePath.type;
        if (!['funny'].includes(currentType)) {
            message.error('请选择有效资源类型！').then();
            return;
        }
        setShowUploadDialog(true);
    }

    const clearSearch = () => {
        setPagination(prev => ({
            ...prev,
            status: null,
            pageNumber: 1,
            resourceType: null
        }))
    }

    /**
     * 判断字段是否禁用
     */
    /**
     * 判断字段是否禁用
     */
    const isFieldDisabled = (field: string, type?: string) => {
        // 优先使用表单中的值，其次使用resourcePath中的值
        const currentType = type || resourcePathForm.getFieldValue('type') || resourcePath.type;

        switch (field) {
            case 'classify':
                return !['lovePhoto', 'funny', 'favorites'].includes(currentType);
            case 'introduction':
                return !['friendUrl', 'favorites'].includes(currentType);
            case 'url':
                return !['friendUrl', 'funny', 'favorites'].includes(currentType);
            default:
                return false;
        }
    }

    const titleVal = useWatch('title', resourcePathForm);
    const coverVal = useWatch('cover', resourcePathForm);
    const urlVal   = useWatch('url', resourcePathForm);

    // 三者都为空时才禁用
    const remarkDisabled = !(titleVal || coverVal || urlVal);

    const options = [
        {label: "友链", value: "friendUrl"},
        {label: "恋爱图片", value: "lovePhoto"},
        {label: "音乐", value: "funny"},
        {label: "收藏夹", value: "favorites"},
    ]

    const columns: ColumnsType<resourcePath> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 55,
            align: 'center',
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width:130,
            align: 'center',
        },
        {
            title: '分类',
            dataIndex: 'classify',
            key: 'classify',
            align: 'center',
        },
        {
            title: '简介',
            dataIndex: 'introduction',
            key: 'introduction',
            width:150,
            align: 'center',
        },
        {
            title: '封面',
            key: 'cover',
            align: 'center',
            render: (_, record) => (
                <Image
                    draggable={false}
                    src={record.cover}
                    alt="封面"
                    className="w-12 h-12 object-cover select-none"
                    preview={{
                        src: record.cover,
                    }}
                />
            ),
        },
        {
            title: '链接',
            key: 'url',
            align: 'center',
            width:125,
            render: (_, record) => (
                <a href={record.url} target="_blank"
                   className="text-sm text-gray-600 max-w-[200px] hover:text-themeBackground" title={record.url}>
                    {record.url}
                </a>
            )
        },
        {
            title: '资源类型',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
        },
        {
            title: '状态',
            key: 'status',
            align: 'center',
            width:75,
            render: (_, record) => (
                <div className="flex items-center justify-center select-none">
                    <Tag color={record.status ? 'success' : 'error'}>
                        {record.status ? '启用' : '禁用'}
                    </Tag>
                    <Switch
                        checked={record.status!}
                        onChange={() => changeStatus(record)}
                        size="small"
                    />
                </div>
            ),
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            align: 'center',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            width: 195,
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
                          onClick={() => handleEdit(record)}>
                        <EditOutlined/>
                        <span>编辑</span>
                    </span>

                    <Popconfirm
                        title="确认删除该资源路径？"
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

    return (
        <div className="h-full overflow-hidden flex flex-col select-none font-custom">
                <div className="mb-2 flex flex-row gap-2">
                    <Select
                        allowClear
                        value={pagination.resourceType}
                        options={options}
                        placeholder="资源路径类型"
                        className="mr-2 mb-2"
                        onChange={(e) => (setPagination(prev => ({...prev, resourceType: e})))}
                        style={{width: 130}}
                    />
                    <Select
                        allowClear
                        value={pagination.status}
                        options={[
                            {label: '启用', value: true},
                            {label: '禁用', value: false},
                        ]}
                        placeholder="状态"
                        className="mr-2 mb-2"
                        onChange={(e) => (setPagination(prev => ({...prev, status: e})))}
                        style={{width: 75}}
                    />
                    <Button type='primary' icon={<Edit size={15}/>}
                            onClick={() => setShowAddResourcePathDialog(true)}>新增资源类型</Button>
                    <button className="bg-red-500 mb-2 text-white hover:bg-red-400 px-2 rounded-md"
                            onClick={clearSearch}>清除参数
                    </button>
                </div>
                <ScrollTable<resourcePath>
                    columns={columns}
                    dataSource={resourcePaths}
                    rowKey="id"
                    pagination={false}
                    bodyHeight={402}
                    rowClassName="font-custom text-sm  select-text"
                />
                <ProPage
                    current={pagination.pageNumber}
                    size={pagination.pageSize}
                    total={pagination.total}
                    buttonCount={10}
                    onPageChange={handlePageChage}
                />

            <Modal
                title={<span className="text-base font-custom">资源路径</span>}
                open={showAddResourcePathDialog}
                onCancel={clearDialog}
                centered
                destroyOnHidden
                width={400}
                style={{
                    textAlign: 'center'
                }}
                footer={[
                    <Button key="cancel" onClick={clearDialog}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleAddResourcePath}>
                        提交
                    </Button>,
                ]}
            >
                <Form form={resourcePathForm}
                      style={{maxWidth: 400}} layout="horizontal"
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[{required: true, message: '请输入标题'}]}
                    >
                        <Input showCount maxLength={60} placeholder="请输入标题"/>
                    </Form.Item>

                    <Form.Item name="type" label="资源类型" rules={[{required: true, message: '请选择资源类型'}]}>
                        <Select
                            placeholder="请选择资源类型"
                            options={options}
                            onChange={(value) => setResourcePath(prev => ({...prev, type: value}))}
                        />
                    </Form.Item>

                    <Form.Item name="classify" label="分类">
                        <Input
                            showCount
                            maxLength={30}
                            placeholder="请输入分类"
                            disabled={isFieldDisabled('classify')}
                        />
                    </Form.Item>

                    <Form.Item name="introduction" label="简介">
                        <Input.TextArea
                            showCount
                            style={{resize: 'none'}}
                            maxLength={500}
                            placeholder="请输入简介"
                            disabled={isFieldDisabled('introduction')}
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item label="封面">
                        <div className="flex gap-2 font-custom text-sm">
                            <Form.Item name='cover' noStyle>
                                <Input
                                    placeholder="封面链接"
                                    className="flex-1"
                                />
                            </Form.Item>
                            <ProButton info='上传封面' before={constant.before_color_1} after={constant.after_color_1} onClick={handleUploadCover}/>
                        </div>
                    </Form.Item>

                    <Form.Item label="链接">
                        <div className="flex gap-2 font-custom text-sm">
                            <Form.Item name='url' noStyle>
                                <Input
                                    placeholder="资源链接"
                                    className="flex-1"
                                    disabled={isFieldDisabled('url')}
                                    value={resourcePathForm.getFieldValue('url')}
                                    onChange={(e) => resourcePathForm.setFieldsValue({ url: e.target.value })}
                                />
                            </Form.Item>
                            <ProButton before={constant.before_color_1} after={constant.after_color_1} onClick={handleUploadFile} info='上传文件'/>
                        </div>
                    </Form.Item>

                    <Form.Item name="remark" label="备注">
                        <Input.TextArea
                            showCount
                            maxLength={500}
                            style={{resize: 'none'}}
                            placeholder="请输入备注"
                            disabled={remarkDisabled}
                            rows={3}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span className="text-base font-custom">文件</span>}
                open={showUploadDialog}
                onCancel={() => setShowUploadDialog(false)}
                style={{
                    textAlign: 'center'
                }}
                destroyOnHidden
                centered
                footer={null} // 去除按钮
            >
                <FileUpload isAdmin={true}
                            prefix={resourcePath.type + 'Url'}
                            onUpload={(value) => handleUploadSuccess('url', value)}
                            maxNumber={1}
                            maxSize={10}
                            listType={'file'}
                            accept="image/*, video/*, audio/*"
                />
            </Modal>

            <Modal
                title={<span className="text-base font-custom">图片</span>}
                open={showCoverDialog}
                onCancel={() => setShowCoverDialog(false)}
                style={{
                    textAlign: 'center'
                }}
                destroyOnHidden
                centered
                footer={null} // 去除按钮
            >
                <FileUpload isAdmin={true}
                            prefix={resourcePath.type + 'Cover'}
                            onUpload={(value) => handleUploadSuccess('cover', value)}
                            maxNumber={1}
                            maxSize={5}
                            listType={'picture'}
                />
            </Modal>
        </div>
    )
}

export default ResourcePathList;
