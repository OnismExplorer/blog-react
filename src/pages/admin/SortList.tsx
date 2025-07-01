import {Button, Form, Input, InputNumber, message, Modal, Popconfirm, Radio, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {ChevronsDownUp, ChevronsUpDown} from "lucide-react";
import React, {useEffect, useState} from 'react';
import {useAppContext} from '@hooks/useAppContext';
import type {sort} from '@type/sort';
import type {label} from '@type/label';
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {
    getSortInfo,
    handleDeleteSortOrLabel,
    handleSaveOrUpdateLabel,
    handleSaveOrUpdateSort
} from "@api/webInfo";
import {page} from "@type/page";

const SortList: React.FC = () => {
    const {common} = useAppContext();
    const [showSortDialog, setShowSortDialog] = useState<boolean>(false);
    const [showLabelDialog, setShowLabelDialog] = useState<boolean>(false);
    const [sortInfo, setSortInfo] = useState<sort[]>([]);
    const [sortItem, setSortItem] = useState<sort>({
        id: null,
        sortName: '',
        sortDescription: '',
        sortType: null,
        priority: null
    });
    const [labelItem, setLabelItem] = useState<label>({id: null, sortId: null, labelName: '', labelDescription: ''});

    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [pagination, setPagination] = useState<page>({
        pageNumber: 1,
        pageSize: 5,
    });

    const [sortForm] = Form.useForm();
    const [labelForm] = Form.useForm();

    useEffect(() => {
        fetchSortInfo();
    }, []);

    // 获取分类并确保 labels 字段为数组
    const fetchSortInfo = () => {
        getSortInfo()
            .then(res => {
                const data = res.data;
                if (!common.isEmpty(data)) {
                    const list = data.map(item => ({
                        ...item,
                        labels: Array.isArray(item.labels) ? item.labels : []
                    }));
                    // 进行分页操作
                    setSortInfo(list.slice((pagination.pageNumber - 1) * pagination.pageSize, pagination.pageNumber * pagination.pageSize));
                    setPagination(prev => ({
                        ...prev,
                        total: data.length
                    }))
                }
            })
    };

    // 实时监听 pageNumber，实现翻页功能
    useEffect(() => {
        fetchSortInfo();
    }, [pagination.pageNumber]);

    const handleToggle = (key: React.Key) => {
        setExpandedRowKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handlePageChange = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: pageNumber
        }))
    }

    const sortColumns: ColumnsType<sort> = [
        {title: 'ID', dataIndex: 'id', width: 60, align: 'center'},
        {title: '分类名称', dataIndex: 'sortName', align: 'center'},
        {title: '分类描述', dataIndex: 'sortDescription', align: 'center'},
        {
            title: '分类类型', dataIndex: 'sortType', align: 'center',
            render: t => (t === 0 ? '导航栏分类' : '普通分类'),
        },
        {title: '优先级', dataIndex: 'priority', width: '80px', align: 'center'},
        {
            title: '标签数',
            dataIndex: 'labels',
            width: 80,
            align: 'center',
            render: (labels: label[] = []) => labels.length,
        },
        {title: '文章总数', dataIndex: 'countOfSort', width: '90px', align: 'center'},
        {
            title: '操作', key: 'action', width: '250px', align: 'center',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => openSortDialog(record)}>编辑</Button>
                    <Button type="link" onClick={() => handleToggle(record.id!)}>
                        {expandedRowKeys.includes(record.id!) ? '收起标签' : '查看标签'}
                    </Button>
                    <Popconfirm
                        title="确认删除分类？"
                        okText='确认'
                        okType="danger"
                        cancelText='取消'
                        onConfirm={() => handleDelete(record.id, 1)}>
                        <Button type="link" danger>删除</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    const expandedRowRender = (parent: sort) => {
        const labelCols: ColumnsType<label> = [
            {title: 'ID', dataIndex: 'id', width: 60, align: 'center'},
            {title: '标签名称', dataIndex: 'labelName', align: 'center'},
            {title: '标签描述', dataIndex: 'labelDescription', align: 'center'},
            {title: '文章总数', dataIndex: 'countOfLabel', align: 'center'},
            {
                title: '操作', key: 'action', align: 'center',
                render: (_, record) => (
                    <>
                        <Button type="link" onClick={() => openLabelDialog(parent.id, record)}>编辑</Button>
                        <Popconfirm
                            title="是否删除标签？"
                            okText='确认'
                            okType="danger"
                            cancelText='取消'
                            onConfirm={() => handleDelete(record.id, 2)}>
                            <Button type="link" danger>删除</Button>
                        </Popconfirm>
                    </>
                ),
            },
        ];

        return (
            <>
                <Button type="primary" size="small" onClick={() => openLabelDialog(parent.id)}
                        style={{marginBottom: 8}}>
                    新增标签
                </Button>
                <Table<label>
                    columns={labelCols}
                    dataSource={parent.labels}
                    rowKey="id"
                    pagination={false}
                    bordered
                />
            </>
        );
    };

    const handleDelete = (id: number | null, flag: number) => {

        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okType: "danger",
            width: '15%',
            style: {alignItems: 'center', textAlign: 'center'},
            centered: true,
            onOk() {
                handleDeleteSortOrLabel(flag,id)
                    .then(() => {
                        message.success('删除成功').then();
                        setPagination(prev => ({
                            ...prev,
                            pageNumber:1,
                        }))
                        fetchSortInfo();
                    })
                    .catch(err => {
                        message.error(err.message).then();
                    });
            },
        });
    };

    const handleClose = () => {
        setShowSortDialog(false);
        setShowLabelDialog(false);
    };

    const openSortDialog = (item?: sort) => {
        sortForm.resetFields();
        if (item) {
            setSortItem(item);
            sortForm.setFieldsValue(item);
        } else {
            setSortItem({id: null, sortName: '', sortDescription: '', sortType: null, priority: null});
        }
        setShowSortDialog(true);
    };

    const handleSaveSort = async () => {
        try {
            const values = await sortForm.validateFields();
            const payload = {...sortItem, ...values};

            await handleSaveOrUpdateSort(payload.id, payload);
            message.success('保存成功');
            fetchSortInfo();
            handleClose();
        } catch {
            // AntD 自动处理字段校验提示
        }
    };

    const openLabelDialog = (sortId: number | null, lab?: label) => {
        labelForm.resetFields();
        if (lab) {
            setLabelItem(lab);
            labelForm.setFieldsValue(lab);
        } else {
            setLabelItem({id: null, sortId, labelName: '', labelDescription: ''});
        }
        setShowLabelDialog(true);
    };

    const handleSaveLabel = async () => {
        try {
            const values = await labelForm.validateFields();
            const payload = {...labelItem, ...values};

            await handleSaveOrUpdateLabel(payload.id, payload);
            message.success('保存成功');
            fetchSortInfo();
            handleClose();
        } catch {
            // AntD 自动处理字段校验提示
        }
    };

    const toggleAll = () => {
        if (expandedRowKeys.length > 0) {
            setExpandedRowKeys([]);
        } else {
            const allKeys = sortInfo.map(item => item.id!) as React.Key[];
            setExpandedRowKeys(allKeys);
        }
    };

    return (
        <div className="select-none">
            {/* 展开/收起全部标签按钮 */}
            <button
                className=" rounded-full w-[46px] h-[46px] bg-blue-500 hover:bg-blue-600 text-white"
                onClick={toggleAll}
                style={{position: 'fixed', top: 152, right: 40, zIndex: 200}}
            >
                {expandedRowKeys.length > 0 ?
                    <div className="flex flex-col items-center justify-center">
                        <ChevronsDownUp size={15}/>
                        <div className="text-[10px]">收起</div>
                        <div className="text-[10px]">全部</div>
                    </div>
                    :
                    <div className="flex flex-col items-center justify-center">
                        <ChevronsUpDown size={15}/>
                        <div className="text-[10px]">展开</div>
                        <div className="text-[10px]">全部</div>
                    </div>
                }
            </button>

            <Button type="primary" onClick={() => openSortDialog()} style={{marginBottom: 16}}>新增分类</Button>
            <ScrollTable<sort>
                columns={sortColumns}
                dataSource={sortInfo}
                rowKey="id"
                pagination={false}
                offsetHeight={170} // 距离底部预留 170px 给分页按钮
                rowClassName="font-custom text-sm"
                expandable={{
                    showExpandColumn: false,
                    expandedRowKeys,
                    expandedRowRender,
                }}
                bordered
            />

            <ProPage
                current={pagination.pageNumber}
                size={pagination.pageSize}
                total={pagination.total}
                buttonCount={5}
                onPageChange={handlePageChange}
            />

            <Modal
                title={<span className='font-custom text-base'>分类</span>}
                open={showSortDialog}
                styles={{
                    body: {
                        justifyItems: 'center',
                        alignItems: 'center',
                        fontFamily: 'font-custom'
                    }
                }}
                style={{justifyItems: 'center', alignItems: 'center', textAlign: 'center'}}
                onOk={handleSaveSort}
                onCancel={handleClose}
                destroyOnHidden
                okText="提交">
                <Form form={sortForm}
                      style={{maxWidth: 300}} layout="horizontal">
                    <Form.Item name="sortType" label="分类类型" rules={[{required: true, message: '请选择类型'}]}>
                        <Radio.Group buttonStyle='solid'>
                            <Radio.Button value={0}>导航栏分类</Radio.Button>
                            <Radio.Button value={1}>普通分类</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="sortName" label="分类名称"
                               rules={[{required: true, message: '请输入名称'}]}><Input showCount
                                                                                        maxLength={20}/></Form.Item>
                    <Form.Item name="sortDescription" label="分类描述"
                               rules={[{required: true, message: '请输入描述'}]}><Input showCount
                                                                                        maxLength={80}/></Form.Item>
                    <Form.Item
                        name="priority"
                        label="优先级(数字越小优先级越高)"
                        rules={[{required: true, message: '请输入优先级'}]}
                    >
                        <InputNumber type='number' controls={false} style={{width: '100%'}}/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span className='font-custom text-base'>标签</span>}
                open={showLabelDialog}
                onOk={handleSaveLabel}
                styles={{
                    body: {
                        justifyItems: 'center',
                        alignItems: 'center',
                        fontFamily: 'font-custom'
                    }
                }}
                centered
                style={{justifyItems: 'center', alignItems: 'center', textAlign: 'center'}}
                onCancel={handleClose}
                destroyOnHidden
                okText="提交" cancelText="取消">
                <Form form={labelForm} style={{maxWidth: 250}} layout="horizontal">
                    <Form.Item name="labelName" label="标签名称"
                               rules={[{required: true, message: '请输入名称'}]}><Input showCount
                                                                                        maxLength={20}/></Form.Item>
                    <Form.Item name="labelDescription" label="标签描述"
                               rules={[{required: true, message: '请输入描述'}]}><Input showCount
                                                                                        maxLength={80}/></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SortList;
