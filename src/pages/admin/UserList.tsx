import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Button, Form, Image, Input, message, Modal, Popconfirm, Radio, Select, Switch, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import {User} from "lucide-react";
import React, {useEffect, useState} from "react";
import {getUserList, handleChangeUser, handleDeleteUser, handleSaveUser, handleUpdateUser} from "@api/user";
import {useAppContext} from "@hooks/useAppContext";
import {page} from "@type/page";
import {user} from "@type/user";
import ProPage from "@components/common/proPage";
import ScrollTable from "@components/common/scrollTable";
import {getRandomResource} from "@api/webInfo";

interface Pagination extends page {
    searchKey: string;
    userStatus: boolean | null;
    userType: number | null;
}


const UserList: React.FC = () => {

    const {common} = useAppContext();
    const [users, setUsers] = useState<user[]>([])
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        searchKey: '',
        userStatus: null,
        userType: null,
    })
    const [user, setUser] = useState<user>({
        username: "",
        password: "",
        email: "",
        avatar: "",
        userStatus: true,
        gender: 0
    });

    const [changeUser, setChangeUser] = useState<{ id: number | null, userType: number | null }>({
        id: null,
        userType: null,
    });

    const [editVisiable, setEditVisiable] = useState<boolean>(false);
    const [addVisiable, setAddVisiable] = useState<boolean>(false);
    const [updateVisiable, setUpdateVisiable] = useState<boolean>(false);
    const [userForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const getUsers = () => {
        getUserList(pagination)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setUsers(result.records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.totalRow
                    }))
                }
            })
    }

    useEffect(() => {
        getUsers();
    }, [pagination.pageNumber, pagination.searchKey, pagination.userType, pagination.userStatus]);

    const saveUser = async () => {
        try {
            const values = await userForm.validateFields();
            const userData = {
                ...values,
            }

            // 设置一个随机头像
            getRandomResource('avatar')
                .then((res) => {
                    userData.avatar = res.data
                })

            handleSaveUser(userData)
                .then(() => {
                    message.success('保存成功！').then();
                    setAddVisiable(false);
                    // 重置表单数据
                    userForm.resetFields();
                    getUsers();
                })
        } catch {
            //
        }
    }

    const updateUser = (user: user) => {
        setUser(user);
        userForm.setFieldsValue(user);
        setUpdateVisiable(true);
    }

    const handleUpdate = () => {
        handleUpdateUser(user)
            .then(() => {
                message.success('修改成功！').then();
                setUpdateVisiable(false);
                getUsers();
            })
    }

    const handleUserChange = (type: 'status' | 'type', param: Record<string, unknown>) => {
        handleChangeUser(type, param)
            .then(() => {
                message.success('修改成功！').then();
                getUsers();
            })
    }

    const removeUser = (uid: number | null) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered: true,
            content: '确认删除该用户？',
            okType: 'danger',
            style: {textAlign: 'center'},
            width: 200,
            onOk() {
                handleDeleteUser(uid)
                    .then(() => {
                        message.success('删除成功！').then();
                        setPagination(prev => ({
                            ...prev,
                            pageNumber: 1,
                        }))
                        getUsers();
                    })
            }
        })
    }

    const handleEditUser = (uid: number | null, userType: number | null) => {
        setChangeUser({
            id: uid,
            userType: userType,
        })
        setEditVisiable(true);
    }

    const handlePageChange = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber
        }))
    }

    const handleClose = () => {
        setChangeUser({
            id: null,
            userType: null
        })
        setEditVisiable(false);
    }

    const getGender = (gender: number) => {
        const genders = {
            1: {label: '男', color: 'blue'},
            2: {label: '女', color: 'red'},
            0: {label: '保密', color: 'green'}
        };
        return genders[gender as keyof typeof genders] || {label: '保密', color: 'green'};
    }

    const getUserType = (userType: number) => {
        const types = {
            0: {label: 'Boss', color: 'gold'},
            1: {label: '管理员', color: 'blue'},
            2: {label: '普通用户', color: 'green'}
        };
        return types[userType as keyof typeof types] || {label: '普通用户', color: 'green'};
    }

    const columns: ColumnsType<user> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 55,
            align: 'center'
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            align: 'center'
        },
        {
            title: '手机号',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            align: 'center'
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            align: 'center'
        },
        {
            title: '用户状态',
            key: 'userStatus',
            align: 'center',
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2 select-none">
                    <div className="flex items-center justify-center">
                        <Tag color={record.userStatus ? 'success' : 'error'}>
                            {record.userStatus ? '启用' : '禁用'}
                        </Tag>
                        <Switch
                            checked={record.userStatus!}
                            onChange={() => handleUserChange('status', {userId: record.id, status: !record.userStatus})}
                            size="small"
                        />
                    </div>
                </div>
            )
        },
        {
            title: '头像',
            key: 'avatar',
            align: 'center',
            render: (_, record) => (
                <Image
                    src={record.avatar}
                    alt="avatar"
                    draggable={false}
                    preview={{
                        src: record.avatar,
                    }}
                    className="w-10 h-10 object-cover select-none"
                />
            )
        },
        {
            title: '性别',
            key: 'gender',
            align: 'center',
            render: (_, record) => {
                const genderInfo = getGender(record.gender!);
                return (
                    <Tag color={genderInfo.color}>{genderInfo.label}</Tag>
                )
            }
        },
        {
            title: '简介',
            dataIndex: 'introduction',
            key: 'introduction',
            align: 'center'
        },
        {
            title: '用户类型',
            key: 'userType',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const typeInfo = getUserType(record.userType!);
                return (
                    <Tag
                        color={typeInfo.color}
                        className="cursor-pointer"
                        onClick={() => handleEditUser(record.id!, record.userType!)}
                    >
                        {typeInfo.label}
                    </Tag>
                );
            }
        },
        {
            title: '注册时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            width: 195,
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 140,
            render: (_, record) => (
                <div
                    className="flex flex-row justify-center gap-1 cursor-pointer select-none">
                    <span className='flex flex-row gap-1 items-center justify-center text-blue-500 hover:text-blue-400'
                          onClick={() => updateUser(record)}>
                        <EditOutlined/>
                        <span>编辑</span>
                    </span>
                    <Popconfirm
                        title="确认删除该用户？"
                        onConfirm={() => removeUser(record.id!)}
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
            )
        }
    ];

    const clearSearch = () => {
        setPagination(prev => ({
            ...prev,
            userStatus: null,
            userType: null
        }))
    }

    const closeDialog = () => {
        setAddVisiable(false);
        setUpdateVisiable(false);
        setUser({
            id: null,
            username: "",
            password: "",
            email: "",
            avatar: "",
            userStatus: true,
            gender: 0
        })
        userForm.resetFields();
    }

    return (
        <div className='h-full overflow-hidden flex flex-col select-none font-custom'>
            <div>
                <div className='mb-2 flex flex-row gap-2'>
                    <Select
                        allowClear
                        value={pagination.userType}
                        options={[
                            {label: 'Boss', value: 0},
                            {label: '管理员', value: 1},
                            {label: '普通用户', value: 2},
                        ]}
                        placeholder="用户类型"
                        className="mr-2 mb-2"
                        onChange={(e) => (setPagination(prev => ({...prev, userType: e})))}
                        style={{width: 100}}
                    />
                    <Select
                        allowClear
                        value={pagination.userStatus}
                        options={[
                            {label: '正常', value: true},
                            {label: '禁用', value: false},
                        ]}
                        placeholder="用户状态"
                        className="mr-2 mb-2"
                        onChange={(e) => (setPagination(prev => ({...prev, userStatus: e})))}
                        style={{width: 100}}
                    />
                    <button className="bg-red-500 mb-2 text-white hover:bg-red-400 px-2 rounded-md"
                            onClick={clearSearch}>清除参数
                    </button>
                    <Button type='primary' icon={<User size={16}/>}
                            onClick={() => setAddVisiable(true)}>新增用户</Button>
                </div>
                <ScrollTable<user>
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={false}
                    bodyHeight={402}
                    rowClassName="font-custom text-sm  select-text"
                />
                <ProPage
                    current={pagination.pageNumber}
                    size={pagination.pageSize}
                    total={pagination.total}
                    buttonCount={5}
                    onPageChange={handlePageChange}
                />
            </div>
            {/*对话框部分*/}
            <Modal
                title="修改用户类型"
                open={editVisiable}
                destroyOnClose
                style={{textAlign: 'center'}}
                onOk={async () => {
                    const values = await editForm.validateFields();
                    handleUserChange('type', {userId: changeUser.id, userType: values.userType})
                    setEditVisiable(false);
                }}
                onCancel={handleClose}
                width={400}
            >
                <div className="flex justify-center py-4">
                    <Form form={editForm} layout="vertical">
                        <Form.Item name="userType" initialValue={changeUser.userType}
                                   rules={[{required: true, message: '请选择用户类型'}]}>
                            <Radio.Group buttonStyle='solid'>
                                <Radio.Button value={0}>Boss</Radio.Button>
                                <Radio.Button value={1}>管理员</Radio.Button>
                                <Radio.Button value={2}>普通用户</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            <Modal
                title={<span className="text-base font-custom font-normal">新增用户</span>}
                open={addVisiable}
                destroyOnClose
                style={{textAlign: 'center'}}
                onOk={saveUser}
                width={300}
                centered
                onCancel={closeDialog}
            >
                <Form form={userForm} layout='horizontal' className='mt-4' style={{maxWidth: 300}}>
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{required: true, message: '请输入用户名'}]}
                    >
                        <Input maxLength={20} showCount/>
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                    >
                        <Input.Password placeholder='(不设置默认为 123456)' maxLength={50}/>
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[
                            {required: true, message: '请输入邮箱'},
                            {type: 'email', message: '请输入有效的邮箱地址'}
                        ]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item label="用户状态" name="userStatus" valuePropName="checked" initialValue={true}>
                        <div className="flex items-center gap-2">
                            <span>未启用</span>
                            <Switch/>
                            <span>启用</span>
                        </div>
                    </Form.Item>

                    <Form.Item label="性别" name="gender" initialValue={0}>
                        <Radio.Group>
                            <Radio value={0}>保密</Radio>
                            <Radio value={1}>男</Radio>
                            <Radio value={2}>女</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span className="text-base font-custom font-normal">更新信息</span>}
                open={updateVisiable}
                destroyOnClose
                style={{textAlign: 'center'}}
                width={300}
                centered
                onOk={handleUpdate}
                onCancel={closeDialog}
            >
                <Form form={userForm} layout='horizontal' className='mt-4' style={{maxWidth: 300}}>
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{required: true, message: '请输入用户名'}]}
                    >
                        <Input
                            maxLength={20}
                            showCount
                            onChange={(e) => setUser(prev => ({...prev, username: e.target.value}))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                    >
                        <Input.Password
                            maxLength={50}
                            onChange={(e) => setUser(prev => ({...prev, password: e.target.value}))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[
                            {required: true, message: '请输入邮箱'},
                            {type: 'email', message: '请输入有效的邮箱地址'}
                        ]}
                    >
                        <Input
                            onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))}
                        />
                    </Form.Item>

                    <Form.Item label="用户状态">
                        <div className="flex items-center gap-2">
                            <span>未启用</span>
                            <Form.Item name="userStatus" noStyle>
                                <Switch
                                    onChange={(checked) => setUser(prev => ({...prev, userStatus: checked}))}
                                />
                            </Form.Item>
                            <span>启用</span>
                        </div>
                    </Form.Item>

                    <Form.Item label="性别" name="gender">
                        <Radio.Group
                            onChange={(e) => setUser(prev => ({...prev, gender: e.target.value}))}
                        >
                            <Radio value={0}>保密</Radio>
                            <Radio value={1}>男</Radio>
                            <Radio value={2}>女</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserList;
