import {EditOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Form, Image, Input, message, Modal, Select, Switch, Tag} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {getAdminWebInfo, handleUpdateWebInfo} from "@api/webInfo";
import FileUpload from "@components/common/fileUpload";
import {useAppContext} from "@hooks/useAppContext";
import {webInfo} from "@type/webInfo";
import debounce from 'lodash/debounce';

const WebEdit: React.FC = () => {
    const {common} = useAppContext();
    const [promptVisible, setPromptVisiable] = useState<boolean>(false);
    const [noticeVisible, setNoticeVisible] = useState<boolean>(false);
    const [noticeValue, setNoticeValue] = useState<string>("");
    const [randomNameVisible, setRandomNameVisible] = useState<boolean>(false);
    const [randomName, setRandomName] = useState<string>("");
    const [randomAvatarVisible, setRandomAvatarVisible] = useState<boolean>(false);
    const [randomAvatar, setRandomAvatar] = useState<string>("");
    const [randomCoverVisible, setRandomCoverVisible] = useState<boolean>(false);
    const [randomCover, setRandomCover] = useState<string>("");
    const [webInfo, setWebInfo] = useState<webInfo>({
        id: null,
        webName: "",
        webTitle: "",
        footer: "",
        backgroundImage: "",
        avatar: "",
        waifuJson: "",
        status: false
    });
    const [notices, setNotices] = useState<string[]>([]);
    const [randomAvatars, setRandomAvatars] = useState<string[]>([]);
    const [randomNames, setRandomNames] = useState<string[]>([]);
    const [randomCovers, setRandomCovers] = useState<string[]>([]);
    const [pageOption, setPageOption] = useState<number>(0);
    const [webForm] = Form.useForm<webInfo>();

    useEffect(() => {
        getWebInfo();
    }, []);

    const getWebInfo = () => {
        getAdminWebInfo()
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    webForm.setFieldsValue(result);
                    setWebInfo(result);
                    setNotices(result.notices!);
                    setRandomNames(result.randomName!);
                    setRandomAvatars(result.randomAvatar!);
                    setRandomCovers(result.randomCover!);
                }
            })
    }

    const changeWebInfoStatus = (status: boolean) => {
        handleUpdateWebInfo({id: webInfo.id, status: status})
            .then(() => {
                message.success('保存成功！').then();
            })
    }

    const handleSubmit = () => {
        webForm.validateFields().then((values) => {
            const payload = {...values, ...webInfo};
            handleUpdate(payload)
        })
            .catch(() => {
                message.error('请完善必填项！').then();
            })
    }

    const handleUpdate = (param: webInfo | Record<string, unknown>) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered: true,
            content: '确认保存？',
            okType: 'danger',
            style: {alignItems: 'center', justifyItems: 'center'},
            onOk() {
                handleUpdateWebInfo(param)
                    .then(() => {
                        message.success('保存成功！').then();
                    })
            }
        })
    }

    const handleReset = () => {
        webForm.resetFields();
        getWebInfo();
        message.success('已重置！').then();
    }

    // 使用 useMemo 创建一个防抖版本的 handleReset
    const debouncedHandleReset = useMemo(
        () =>
            debounce(handleReset, 1500, {
                leading: true,  // 第一次点击时立即执行
                trailing: false, // 冷却结束后不执行
            }),
        [webForm] // 依赖项，确保在 webForm 实例变化时重新创建（通常不会变）
    );

    // 防止组件卸载后依然尝试执行
    useEffect(() => {
        // 返回一个清理函数
        return () => {
            debouncedHandleReset.cancel(); // 取消任何待执行的防抖函数
        };
    }, [debouncedHandleReset]);

    const saveArrayData = (arrayName: string, data: string[]) => {
        const param = {
            id: webInfo.id,
            [arrayName]: data
        };
        handleUpdate(param);
    };

    const handleInputConfirm = (
        inputValue: string,
        array: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        setVisible: React.Dispatch<React.SetStateAction<boolean>>,
        setValue: React.Dispatch<React.SetStateAction<string>>
    ) => {
        if (inputValue && !array.includes(inputValue)) {
            setter([...array, inputValue]);
        }
        setVisible(false);
        setValue('');
    };

    const handleClose = (e: React.MouseEvent<HTMLElement>, array: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        e.preventDefault();
        const newArray = array.filter(i => i !== item);
        setter(newArray);
    };

    /**
     * 页面切片
     */
    const pageSlice = (
        title: string, // 标题
        dataName: string,
        inputValue: string,
        setValue: React.Dispatch<React.SetStateAction<string>>,
        datas: string[],
        datasSetter: React.Dispatch<React.SetStateAction<string[]>>,
        dataVisible: boolean,
        setDataVisible: React.Dispatch<React.SetStateAction<boolean>>,
        footer: ReactNode | null,
        needImage: boolean,
        direction: 'horizontal' | 'vertical',
    ) => {

        return (
            <>
                <Tag
                    className="top-0 z-10 font-custom text-base flex flex-row gap-x-2 px-2 items-center w-full text-left bg-lightYellow border-none h-10 leading-10 m-1 text-fontColor">
                    <svg viewBox="0 0 1024 1024" width="20" height="20" style={{verticalAlign: "-4px"}}>
                        <path
                            d="M767.1296 808.6528c16.8448 0 32.9728 2.816 48.0256 8.0384 20.6848 7.1168 43.52 1.0752 57.1904-15.9744a459.91936 459.91936 0 0 0 70.5024-122.88c7.8336-20.48 1.0752-43.264-15.9744-57.088-49.6128-40.192-65.0752-125.3888-31.3856-185.856a146.8928 146.8928 0 0 1 30.3104-37.9904c16.2304-14.5408 22.1696-37.376 13.9264-57.6a461.27104 461.27104 0 0 0-67.5328-114.9952c-13.6192-16.9984-36.4544-22.9376-57.0368-15.8208a146.3296 146.3296 0 0 1-48.0256 8.0384c-70.144 0-132.352-50.8928-145.2032-118.7328-4.096-21.6064-20.736-38.5536-42.4448-41.8304-22.0672-3.2768-44.6464-5.0176-67.6864-5.0176-21.4528 0-42.5472 1.536-63.232 4.4032-22.3232 3.1232-40.2432 20.48-43.52 42.752-6.912 46.6944-36.0448 118.016-145.7152 118.4256-17.3056 0.0512-33.8944-2.9696-49.3056-8.448-21.0432-7.4752-44.3904-1.4848-58.368 15.9232A462.14656 462.14656 0 0 0 80.4864 348.16c-7.6288 20.0192-2.7648 43.008 13.4656 56.9344 55.5008 47.8208 71.7824 122.88 37.0688 185.1392a146.72896 146.72896 0 0 1-31.6416 39.168c-16.8448 14.7456-23.0912 38.1952-14.5408 58.9312 16.896 41.0112 39.5776 79.0016 66.9696 113.0496 13.9264 17.3056 37.2736 23.1936 58.2144 15.7184 15.4112-5.4784 32-8.4992 49.3056-8.4992 71.2704 0 124.7744 49.408 142.1312 121.2928 4.9664 20.48 21.4016 36.0448 42.24 39.168 22.2208 3.328 44.9536 5.0688 68.096 5.0688 23.3984 0 46.4384-1.792 68.864-5.1712 21.3504-3.2256 38.144-19.456 42.7008-40.5504 14.8992-68.8128 73.1648-119.7568 143.7696-119.7568z"
                            fill="#8C7BFD"></path>
                        <path
                            d="M511.8464 696.3712c-101.3248 0-183.7568-82.432-183.7568-183.7568s82.432-183.7568 183.7568-183.7568 183.7568 82.432 183.7568 183.7568-82.432 183.7568-183.7568 183.7568z m0-265.1648c-44.8512 0-81.3568 36.5056-81.3568 81.3568S466.9952 593.92 511.8464 593.92s81.3568-36.5056 81.3568-81.3568-36.5056-81.3568-81.3568-81.3568z"
                            fill="#FFE37B"></path>
                    </svg>
                    <span>{title}</span>
                </Tag>
                <div className='flex flex-row items-center'>
                    <div className={`mt-1 flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
                        {datas.map((data, index) => (
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <Tag
                                    key={index}
                                    closable
                                    onClose={(e) => handleClose(e, datas, data, datasSetter)}
                                    className="m-2 py-2 px-3 bg-sky-100 text-blue-500 text-xs font-custom select-text"
                                >
                                    {data}
                                </Tag>
                                {needImage && (
                                    <Image
                                        width={42}
                                        height={42}
                                        src={data}
                                        className="rounded"
                                    />
                                )}
                            </div>
                        ))}

                        {dataVisible ? (
                            <Input
                                type="text"
                                size="small"
                                className="w-48 m-2 p-2"
                                value={inputValue}
                                onChange={(e) => setValue(e.target.value)}
                                onBlur={() => handleInputConfirm(inputValue, datas, datasSetter, setDataVisible, setValue)}
                                onPressEnter={() => handleInputConfirm(inputValue, datas, datasSetter, setDataVisible, setValue)}
                            />
                        ) : (
                            <Button
                                size="small"
                                type="dashed"
                                onClick={() => setDataVisible(true)}
                                icon={<PlusOutlined/>}
                                className="m-2 p-[18px] w-40"
                            >
                                {title}
                            </Button>
                        )}
                    </div>
                </div>
                {footer && (
                    footer
                )}

                <div className="text-center mb-6 mt-3">
                    <Button type="primary" className='px-5 py-[18px]' onClick={() => saveArrayData(dataName, datas)}>
                        保存
                    </Button>
                </div>
            </>
        )
    }

    const columns = [
        {
            title: '公告', // 标题
            dataName: 'notices',
            inputValue: noticeValue,
            setValue: setNoticeValue,
            datas: notices,
            datasSetter: setNotices,
            dataVisible: noticeVisible,
            setDataVisible: setNoticeVisible,
            footer: null
        },
        {
            title: '随机名称', // 标题
            dataName: 'randomName',
            inputValue: randomName,
            setValue: setRandomName,
            datas: randomNames,
            datasSetter: setRandomNames,
            dataVisible: randomNameVisible,
            setDataVisible: setRandomNameVisible,
            footer: null
        },
        {
            title: '随机头像', // 标题
            dataName: 'randomAvatar',
            inputValue: randomAvatar,
            setValue: setRandomAvatar,
            datas: randomAvatars,
            datasSetter: setRandomAvatars,
            dataVisible: randomAvatarVisible,
            setDataVisible: setRandomAvatarVisible,
            footer: <FileUpload isAdmin={true} prefix='randomAvatar' maxSize={1} maxNumber={5} listType='picture'
                                onUpload={(url) => setRandomAvatars([...randomAvatars, url])}/>
        },
        {
            title: '随机封面', // 标题
            dataName: 'randomCover',
            inputValue: randomCover,
            setValue: setRandomCover,
            datas: randomCovers,
            datasSetter: setRandomCovers,
            dataVisible: randomCoverVisible,
            setDataVisible: setRandomCoverVisible,
            footer: <FileUpload isAdmin={true} prefix='randomCover' maxSize={1} maxNumber={5} listType='picture'
                                onUpload={(url) => setRandomCovers([...randomCovers, url])}/>
        }
    ]

    const pageOptions = [
        {value: 0, label: '基础信息'},
        {value: 1, label: '公告'},
        {value: 2, label: '随机名称'},
        {value: 3, label: '随机头像'},
        {value: 4, label: '随机封面'},
    ]

    const webPage = [
        <>
            <Tag
                className="top-0 z-10 font-custom text-base flex flex-row gap-x-2 px-2 items-center w-full text-left bg-lightYellow border-none h-10 leading-10 text-fontColor">
                <svg viewBox="0 0 1024 1024" width="20" height="20" style={{verticalAlign: "-4px"}}>
                    <path
                        d="M767.1296 808.6528c16.8448 0 32.9728 2.816 48.0256 8.0384 20.6848 7.1168 43.52 1.0752 57.1904-15.9744a459.91936 459.91936 0 0 0 70.5024-122.88c7.8336-20.48 1.0752-43.264-15.9744-57.088-49.6128-40.192-65.0752-125.3888-31.3856-185.856a146.8928 146.8928 0 0 1 30.3104-37.9904c16.2304-14.5408 22.1696-37.376 13.9264-57.6a461.27104 461.27104 0 0 0-67.5328-114.9952c-13.6192-16.9984-36.4544-22.9376-57.0368-15.8208a146.3296 146.3296 0 0 1-48.0256 8.0384c-70.144 0-132.352-50.8928-145.2032-118.7328-4.096-21.6064-20.736-38.5536-42.4448-41.8304-22.0672-3.2768-44.6464-5.0176-67.6864-5.0176-21.4528 0-42.5472 1.536-63.232 4.4032-22.3232 3.1232-40.2432 20.48-43.52 42.752-6.912 46.6944-36.0448 118.016-145.7152 118.4256-17.3056 0.0512-33.8944-2.9696-49.3056-8.448-21.0432-7.4752-44.3904-1.4848-58.368 15.9232A462.14656 462.14656 0 0 0 80.4864 348.16c-7.6288 20.0192-2.7648 43.008 13.4656 56.9344 55.5008 47.8208 71.7824 122.88 37.0688 185.1392a146.72896 146.72896 0 0 1-31.6416 39.168c-16.8448 14.7456-23.0912 38.1952-14.5408 58.9312 16.896 41.0112 39.5776 79.0016 66.9696 113.0496 13.9264 17.3056 37.2736 23.1936 58.2144 15.7184 15.4112-5.4784 32-8.4992 49.3056-8.4992 71.2704 0 124.7744 49.408 142.1312 121.2928 4.9664 20.48 21.4016 36.0448 42.24 39.168 22.2208 3.328 44.9536 5.0688 68.096 5.0688 23.3984 0 46.4384-1.792 68.864-5.1712 21.3504-3.2256 38.144-19.456 42.7008-40.5504 14.8992-68.8128 73.1648-119.7568 143.7696-119.7568z"
                        fill="#8C7BFD"></path>
                    <path
                        d="M511.8464 696.3712c-101.3248 0-183.7568-82.432-183.7568-183.7568s82.432-183.7568 183.7568-183.7568 183.7568 82.432 183.7568 183.7568-82.432 183.7568-183.7568 183.7568z m0-265.1648c-44.8512 0-81.3568 36.5056-81.3568 81.3568S466.9952 593.92 511.8464 593.92s81.3568-36.5056 81.3568-81.3568-36.5056-81.3568-81.3568-81.3568z"
                        fill="#FFE37B"></path>
                </svg>
                <span>基础信息</span>
            </Tag>
            <Form
                form={webForm}
                className='mt-5 items-center'
                layout="horizontal"
                labelCol={{span: 2}}
                onFinish={handleSubmit}
                initialValues={webInfo}
            >
                <Form.Item
                    label="网站名称"
                    name="webName"
                    rules={[
                        {required: true, message: '请输入网站名称'},
                        { min: 1, max: 10, message: '长度在 1 到 10 个字符' }
                    ]}
                >
                    <Input className='font-custom text-sm' placeholder='请输入网站名称' />
                </Form.Item>

                <Form.Item
                    label="网站标题"
                    name="webTitle"
                    rules={[{required: true, message: '请输入网站标题'}]}
                >
                    <Input className='font-custom text-sm'/>
                </Form.Item>

                <Form.Item
                    label="页脚"
                    name="footer"
                    rules={[{required: true, message: '请输入页脚'}]}
                >
                    <Input className='font-custom text-sm' placeholder='请输入页脚'/>
                </Form.Item>

                <Form.Item
                    label="状态"
                    rules={[{required: true, message: '请选择状态'}]}
                    name="status"
                    valuePropName="checked"
                >
                    <Switch onChange={changeWebInfoStatus}/>
                </Form.Item>

                <Form.Item
                    label="背景图片"
                    name='backgroundImage'
                    rules={[{required: true, message: '请输入背景图片'}]}
                >
                    <div className="flex items-center gap-2">
                        <Input className='font-custom text-sm' placeholder='请输入背景图片 URL'
                               value={webInfo.backgroundImage}
                               onChange={(e) => {
                                   const value = e.target.value
                                   webForm.setFieldValue('backgroundImage', value);
                                   setWebInfo(prev => ({...prev, backgroundImage: value}));
                               }}
                        />
                        {webInfo.backgroundImage && (
                            <Image
                                width={40}
                                height={40}
                                src={webInfo.backgroundImage}
                                className="rounded"
                            />
                        )}
                    </div>
                </Form.Item>

                <Form.Item
                    label="头像"
                    name='avatar'
                    rules={[{required: true, message: '请上传头像'}]}
                >
                    <div className="flex items-center gap-2">
                        <Input className='font-custom text-sm' placeholder='请输入头像 URL'
                               value={webInfo.avatar}
                               onChange={(e) => {
                                   const value = e.target.value
                                   webForm.setFieldValue('avatar', value);
                                   setWebInfo(prev => ({...prev, avatar: value}));
                               }}
                        />
                        {webInfo.avatar && (
                            <Image
                                width={40}
                                height={40}
                                src={webInfo.avatar}
                                className="rounded"
                            />
                        )}
                    </div>
                </Form.Item>

                <Form.Item label="提示">
                    <div className="flex items-center gap-2">
                        <TextArea
                            rows={5}
                            style={{resize: 'none'}}
                            disabled={!promptVisible}
                            className='font-custom text-sm'
                            value={webInfo.waifuJson}
                            onChange={(e) => {
                                const value = e.target.value
                                webForm.setFieldValue('waifuJson', value);
                                setWebInfo(prev => ({...prev, waifuJson: value}));
                            }}
                        />
                        <EditOutlined
                            className="text-blue-500 cursor-pointer text-lg"
                            onClick={() => setPromptVisiable(!promptVisible)}
                        />
                    </div>
                </Form.Item>

                <Form.Item>
                    <div className="text-center mb-1">
                        <Button type="primary" className='px-5 py-[18px]' htmlType="submit">
                            保存
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </>,
        pageSlice(columns[0].title, columns[0].dataName, columns[0].inputValue, columns[0].setValue, columns[0].datas, columns[0].datasSetter, columns[0].dataVisible, columns[0].setDataVisible, columns[0].footer, false, 'horizontal'),
        pageSlice(columns[1].title, columns[1].dataName, columns[1].inputValue, columns[1].setValue, columns[1].datas, columns[1].datasSetter, columns[1].dataVisible, columns[1].setDataVisible, columns[1].footer, false, 'horizontal'),
        pageSlice(columns[2].title, columns[2].dataName, columns[2].inputValue, columns[2].setValue, columns[2].datas, columns[2].datasSetter, columns[2].dataVisible, columns[2].setDataVisible, columns[2].footer, true, 'vertical'),
        pageSlice(columns[3].title, columns[3].dataName, columns[3].inputValue, columns[3].setValue, columns[3].datas, columns[3].datasSetter, columns[3].dataVisible, columns[3].setDataVisible, columns[3].footer, true, 'vertical')
    ]

    return (
        <div className='h-full overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col select-none'>
            <div className='text-center'>
                <Select
                    allowClear
                    rootClassName='font-custom'
                    options={pageOptions}
                    placeholder="网站信息"
                    className="mb-2"
                    onChange={e => setPageOption(e ?? 0)} // 这样默认为 “基础信息”
                    style={{width: 120}}
                />
            </div>
            {webPage[pageOption]}
            <div className="text-center">
                <Button type="primary" className='py-5 px-4' danger onClick={debouncedHandleReset}>
                    重置所有修改
                </Button>
            </div>
        </div>
    )
}

export default WebEdit;
