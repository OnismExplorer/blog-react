import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Button, DatePicker, Form, Image, Input, message, Modal, Popconfirm, Select, Switch, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import {Edit} from "lucide-react";
import React, {useEffect, useState} from "react";
import {changeFamilyStatus, getFamilyList, handleDeleteFamily, handleSaveOrUpdateFamily} from "@api/family";
import FileUpload from "@components/common/fileUpload";
import ProButton from "@components/common/proButton";
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {useAppContext} from "@hooks/useAppContext";
import {family} from "@type/family";
import {page} from "@type/page";
import dayjs, {Dayjs} from 'dayjs';

interface Pagination extends page {
    status: boolean | null;
}

const LoveList: React.FC = () => {

    const {constant} = useAppContext();
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        status: null,
    })
    const [families, setFamilies] = useState<family[]>([]);
    const [family, setFamily] = useState<family>({
        id: null,
        bgCover: '',
        manCover: '',
        womanCover: '',
        manName: '',
        womanName: '',
        timing: '',
        countdownTitle: '',
        countdownTime: '',
        status: false
    });
    const [formDialogVisible, setFormDialogVisible] = useState<boolean>(false);
    const [uploadDialogVisible, setUploadDialogVisible] = useState<boolean>(false);
    const [uploadType, setUploadType] = useState<string>('');
    const [familyForm] = Form.useForm<family>();

    useEffect(() => {
        getFamilies()
    }, [pagination.pageNumber, pagination.status]);

    const getFamilies = () => {
        getFamilyList(pagination)
            .then((res) => {
                const result = res.data;
                setFamilies(result.records);
                setPagination(prev => ({
                    ...prev,
                    total: result.totalRow
                }))
            })
    }

    const changeStatus = (id: number | null, status: boolean) => {
        changeFamilyStatus(id, status)
            .then(() => {
                message.success('修改成功！').then();
            })
    }

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered: true,
            content: '确认删除？',
            okType: 'danger',
            style: {alignItems: 'center', justifyItems: 'center'},
            onOk() {
                handleDeleteFamily(id).then(() => message.success('删除成功！').then());
            }
        })
    }

    const handleSave = async () => {
        try {
            const values = await familyForm.validateFields();
            const payload = {
                ...family,
                ...values,
                timing: values.timing ? (values.timing as Dayjs).format('YYYY-MM-DD HH:mm:ss') : '',
                countdownTime: values.countdownTime ? (values.countdownTime as Dayjs).format('YYYY-MM-DD HH:mm:ss') : ''
            };
            handleSaveOrUpdateFamily(payload)
                .then(() => {
                    message.success('保存成功！').then();
                    getFamilies();
                    setFormDialogVisible(false);
                })
        } catch {
            //
        }
    }

    const handleEdit = (item: family) => {
        setFamily(item);
        setFormDialogVisible(true);

        const formValues = {
            ...item,
            timing: item.timing ? dayjs(item.timing) : '',
            countdownTime: item.countdownTime ? dayjs(item.countdownTime) : '',
        };

        familyForm.setFieldsValue(formValues);
    }

    /**
     * 处理翻页
     */
    const handlePageChage = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber
        }));
        getFamilies();
    }

    const handleClose = () => {
        familyForm.resetFields();
        setFamily({
            id: null,
            bgCover: '',
            manCover: '',
            womanCover: '',
            manName: '',
            womanName: '',
            timing: '',
            countdownTitle: '',
            countdownTime: '',
            status: false
        })
        setFormDialogVisible(false);
    }

    const handleUploadSuccess = (result: string) => {
        setFamily(prev => ({
            ...prev,
            [uploadType]: result
        }));
        familyForm.setFieldsValue({
            [uploadType]: result
        });

        setUploadDialogVisible(false);
    }

    const columns: ColumnsType<family> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 55,
            align: 'center',
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            align: 'center',
        },
        {
            title: '男生昵称',
            dataIndex: 'manName',
            key: 'manName',
            align: 'center',
        },
        {
            title: '女生昵称',
            dataIndex: 'womanName',
            key: 'womanName',
            align: 'center',
        },
        {
            title: '背景封面',
            dataIndex: 'bgCover',
            key: 'bgCover',
            align: 'center',
            render: (url: string) => (
                <Image
                    src={url}
                    alt="背景封面"
                    className="w-10 h-10 object-cover"
                />
            ),
        },
        {
            title: '男生头像',
            dataIndex: 'manCover',
            key: 'manCover',
            align: 'center',
            render: (url: string) => (
                <Image
                    src={url}
                    alt="男生头像"
                    className="w-10 h-10 object-cover"
                />
            ),
        },
        {
            title: '女生头像',
            dataIndex: 'womanCover',
            key: 'womanCover',
            align: 'center',
            render: (url: string) => (
                <Image
                    src={url}
                    alt="女生头像"
                    className="w-10 h-10 object-cover"
                />
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 83,
            align: 'center',
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2 select-none">
                    <Tag color={record.status ? 'success' : 'error'}>
                        {record.status ? '启用' : '禁用'}
                    </Tag>
                    <Switch
                        checked={record.status!}
                        onChange={(checked) => changeStatus(record.id, checked)}
                        size="small"
                    />
                </div>
            ),
        },
        {
            title: '起点',
            dataIndex: 'timing',
            key: 'timing',
            align: 'center',
        },
        {
            title: '倒计时标题',
            dataIndex: 'countdownTitle',
            key: 'countdownTitle',
            align: 'center',
        },
        {
            title: '倒计时时间',
            dataIndex: 'countdownTime',
            key: 'countdownTime',
            align: 'center',
        },
        {
            title: '额外信息',
            dataIndex: 'familyInfo',
            key: 'familyInfo',
            align: 'center',
            ellipsis: true,
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
        <div className='select-none'>
            <div className="mb-2 flex flex-row gap-2">
                <Select
                    allowClear
                    value={pagination.status}
                    options={[
                        {label: '正常', value: true},
                        {label: '禁用', value: false},
                    ]}
                    placeholder="状态"
                    className="mr-2 mb-2"
                    onChange={(e) => (setPagination(prev => ({...prev, status: e})))}
                    style={{width: 120}}
                />
                <Button type='primary' icon={<Edit size={15}/>}
                        onClick={() => setFormDialogVisible(true)}>新增表白墙项</Button>
            </div>

            <ScrollTable<family>
                columns={columns}
                dataSource={families}
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
                open={formDialogVisible}
                onCancel={handleClose}
                onOk={handleSave}
                centered
                destroyOnClose
                width={400}
                style={{
                    textAlign: 'center'
                }}
            >
                <Form form={familyForm}
                      style={{maxWidth: 400}} layout="horizontal"
                >
                    <Form.Item name='manName' label="男主昵称"
                               rules={[{required: true, message: '请输入男主昵称'}]}>
                        <Input placeholder='请输入男主昵称' maxLength={20} showCount/>
                    </Form.Item>
                    <Form.Item name='womanName' label="女主昵称"
                               rules={[{required: true, message: '请输入女主昵称'}]}>
                        <Input placeholder='请输入女主昵称' maxLength={20} showCount/>
                    </Form.Item>
                    <Form.Item label='男主头像'>
                        <div className='flex gap-2 font-custom text-sm'>
                            <Form.Item name='manCover' noStyle
                                       rules={[{required: true, message: '请输入男主头像 URL'}]}>
                                <Input/>
                            </Form.Item>
                            <ProButton info='上传头像' before={constant.before_color_1} after={constant.after_color_1}
                                       onClick={() => {
                                           setUploadType('manCover');
                                           setUploadDialogVisible(true)
                                       }} className='w-[90px]'/>
                        </div>
                    </Form.Item>
                    <Form.Item label='女主头像'>
                        <div className='flex gap-2 font-custom text-sm'>
                            <Form.Item name='womanCover' noStyle
                                       rules={[{required: true, message: '请输入女主头像 URL'}]}>
                                <Input/>
                            </Form.Item>
                            <ProButton info='上传头像' before={constant.before_color_1} after={constant.after_color_1}
                                       onClick={() => {
                                           setUploadType('womanCover');
                                           setUploadDialogVisible(true);
                                       }} className='w-[90px]'/>
                        </div>
                    </Form.Item>
                    <Form.Item label='背景图片'>
                        <div className='flex gap-2 font-custom text-sm'>
                            <Form.Item name='bgCover' noStyle rules={[{required: true, message: '请输入背景图片 URL'}]}>
                                <Input/>
                            </Form.Item>
                            <ProButton info='上传背景' before={constant.before_color_1} after={constant.after_color_1}
                                       onClick={() => {
                                           setUploadType('bgCover');
                                           setUploadDialogVisible(true)
                                       }} className='w-[90px]'/>
                        </div>
                    </Form.Item>
                    <Form.Item label='爱的起点' name='timing'>
                        <DatePicker
                            showTime
                            format={{
                                format: "YYYY-MM-DD HH:mm:ss",
                                type: 'mask'
                            }}
                            size='middle'
                            placeholder="选择日期时间"
                            onChange={(date) => {
                                setFamily(prev => ({...prev, timing: date}))
                                familyForm.setFieldValue('timing', date);
                            }}
                        />
                    </Form.Item>
                    <Form.Item name='countdownTitle' label="倒计时标题">
                        <Input placeholder='请输入倒计时标题' maxLength={30} showCount/>
                    </Form.Item>
                    <Form.Item label='倒计时时间' name='countdownTime'>
                        <DatePicker
                            showTime
                            format={{
                                format: "YYYY-MM-DD HH:mm:ss",
                                type: 'mask'
                            }}
                            size='middle'
                            placeholder="选择日期时间"
                            onChange={(date) => {
                                setFamily(prev => ({...prev, countdownTime: date}))
                                familyForm.setFieldValue('countdownTime', date);
                            }}
                        />
                    </Form.Item>
                    <Form.Item label='额外信息' name='familyInfo'>
                        <Input.TextArea
                            showCount
                            maxLength={100}
                            style={{resize: 'none'}}
                            placeholder="用一句话描述恋爱经历..."
                            rows={3}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span
                    className="text-base font-custom">{uploadType === 'bgCover' ? '上传背景' : '上传头像'}</span>}
                open={uploadDialogVisible}
                onCancel={() => setUploadDialogVisible(false)}
                style={{
                    textAlign: 'center'
                }}
                destroyOnClose
                centered
                footer={null} // 去除按钮
            >
                <FileUpload isAdmin={true} prefix={`love/${uploadType}`} listType='picture' maxNumber={1} maxSize={2}
                            onUpload={handleUploadSuccess}/>
            </Modal>
        </div>
    )
}

export default LoveList;
