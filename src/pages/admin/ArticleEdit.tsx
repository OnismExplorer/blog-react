import {ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {Button, Form, Image, Input, message, Modal, Select, Switch, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getArticleById, handleSaveOrUpdateArticle} from "@api/article";
import {getSortAndLabelList} from "@api/webInfo";
import FileUpload from "@components/common/fileUpload";
import {useAppContext} from "@hooks/useAppContext";
import {useStore} from "@hooks/useStore";
import {article} from "@type/article";
import {label} from "@type/label";
import {sort} from "@type/sort";
import {ApiResponse} from "@utils/request";
import MarkdownEditor from "@components/code/MarkdownEditor";
import {getDownloadUrl} from "@api/resource";


const ArticleEdit: React.FC = () => {

    // 获取文章 id
    const id = new URLSearchParams(location.search).get("id");
    const {common, constant, request} = useAppContext();
    const store = useStore();
    const [article, setArticle] = useState<article>({
        articleTitle: '',
        articleContent: '',
        articleCover: '',
        viewStatus: true,
        recommendStatus: false,
        commentStatus: false,
        sortId: null,
        labelId: null,
    });
    const [sorts, setSort] = useState<sort[]>([]);
    const [labels, setLabels] = useState<label[]>([]);
    const [sortLabels, setSortLabels] = useState<label[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [articleForm] = Form.useForm<article>();
    const navigate = useNavigate();
    const [qiniuDownload,setQiniuDownload] = useState<string>('');

    useEffect(() => {
        getDownloadUrl()
            .then((res) => {
                setQiniuDownload(res);
            })
    }, []);

    // 监听分类变化，更新标签选项
    useEffect(() => {
        if (article.sortId && labels.length > 0) {
            const filterLabels = labels.filter(l => l.sortId === article.sortId);
            setSortLabels(filterLabels);
            // 若当前选中标签不属于该分类，则清空
            if (article.labelId && !filterLabels.some(l => l.id === article.labelId)) {
                setArticle(prev => ({...prev, labelId: null}));
                articleForm.setFieldValue('labelId', null);
            }
        } else {
            setSortLabels([]);
        }
    }, [article.sortId, labels, article.labelId, articleForm]);

    useEffect(() => {
        getSortsAndLabels();
    }, []);

    const getSortsAndLabels = () => {
        getSortAndLabelList()
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setSort(result.sorts);
                    setLabels(result.labels);

                    if (!common.isEmpty(id)) {
                        getArticle();
                    }
                }
            })
    }

    const getArticle = () => {
        getArticleById(id, true)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setArticle(result);
                }
            })
    }

    const handleImageUpload = async (image: string | File): Promise<string> => {
        // 若传入的是 url，则先解析并将其转换为 file
        if (typeof image === 'string') {
            // 若是本域名图片，则直接返回
            if (image.includes(qiniuDownload)) {
                return image;
            }

            const response = await fetch(image)
            if (!response.ok) {
                throw new Error(`拉取图片失败: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            const urlObj = new URL(image);
            const filename = urlObj.pathname.split('/').pop() || `upload_${Date.now()}`;
            image = new File([blob], filename, {type: blob.type});
        }

        const file = image as File;
        let suffix = "";
        if (file.name.lastIndexOf('.') !== -1) {
            suffix = file.name.substring(file.name.lastIndexOf('.'));
        }
        const key = "articlePicture" + "/" + store.state.currentAdmin.username?.replace(/[^a-zA-Z]/g, '') + store.state.currentAdmin.id + new Date().getTime() + Math.floor(Math.random() * 1000) + suffix;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("key", key);

        const tokenRes = await request.get<string>('/qiniu/getUpToken', {key: key}, true);
        const result = tokenRes.data;
        if (common.isEmpty(result)) {
            throw new Error('获取上传 Token 失败！');
        }
        fd.append("token", result.data);
        const uploadRes = await request.uploadQiniu<unknown, ApiResponse<{
            hash: string,
            key: string
        }>>(constant.qiniuUrl, fd)
        if (common.isEmpty(uploadRes.data.key)) {
            throw new Error('上传图片失败！');
        }

        const url = qiniuDownload + uploadRes.data.key;
        // 保存资源
        common.saveResource('articlePicture', url, file.size, file.type, true);

        return url;
    }

    const handleArticleCoverUpload = (url: string) => {
        setArticle(prev => ({...prev, articleCover: url}));
        articleForm.setFieldValue('articleCover', url);
    }

    const handleSubmit = () => {
        setLoading(true);
        if (article.viewStatus === false && !article.password?.trim()) {
            message.error('文章不可见时必须输入密码！').then();
            return;
        }

        articleForm.validateFields().then((values) => {
            const payload = {...values, ...article, id: common.parseNumber(id)};
            handleSaveArticle(payload)
        })
            .catch(() => {
                message.error('请完善必填项！').then();
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const handleSaveArticle = (article: article) => {
        Modal.confirm({
            title: (<span className="font-custom">提示</span>),
            centered: true,
            content: '确认保存？',
            okType: 'danger',
            style: {alignItems: 'center', justifyItems: 'center'},
            onOk() {
                handleSaveOrUpdateArticle(article)
                    .then(() => {
                        message.success('保存成功！')
                            .then(() => navigate('/admin/postList'));
                    })
            }
        })
    }

    const handleReset = () => {
        articleForm.resetFields();
        if (!common.isEmpty(id)) {
            getArticle();
        } else {
            setArticle({
                articleTitle: '',
                articleContent: '',
                commentStatus: false,
                recommendStatus: false,
                viewStatus: true,
                articleCover: '',
                sortId: null,
                labelId: null,
            });
        }
    }

    const handleFormChange = (changedValues: Partial<article>) => {
        setArticle(prev => ({...prev, ...changedValues}));
    };

    return (
        <div className='flex flex-col justify-center select-none'>
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
                <span>文章信息</span>
            </Tag>

            <Form
                form={articleForm}
                layout='horizontal'
                onValuesChange={handleFormChange}
                className='mt-5 flex flex-col gap-y-1'>
                <Form.Item
                    label="标题"
                    name="articleTitle"
                    rules={[{required: true, message: '请输入标题'}]}
                >
                    <Input maxLength={30} showCount placeholder="请输入文章标题"/>
                </Form.Item>
                <Form.Item
                    label="内容"
                    name="articleContent"
                    rules={[{required: true, message: '请输入内容'}]}
                >
                    <MarkdownEditor content={article.articleContent}
                                handleChange={(value) => {
                                    setArticle(prev => ({...prev, articleContent: value}));
                                    articleForm.setFieldValue('articleContent', value);
                                }}
                                uploadImage={handleImageUpload}
                    />
                </Form.Item>
                <Form.Item
                    label="是否启用评论"
                    name="commentStatus"
                    initialValue={false}
                    rules={[{required: true}]}
                >
                    <div className="flex items-center space-x-3">
                        <Tag color={article.commentStatus ? 'success' : 'error'}>
                            {article.commentStatus ? '是' : '否'}
                        </Tag>
                        <Switch
                            checked={article.commentStatus}
                            onChange={(checked) => {
                                setArticle(prev => ({...prev, commentStatus: checked}));
                                articleForm.setFieldValue('commentStatus', checked);
                            }}
                        />
                    </div>
                </Form.Item>

                <Form.Item
                    label="是否推荐"
                    initialValue={false}
                    name="recommendStatus"
                    rules={[{required: true}]}
                >
                    <div className="flex items-center space-x-3">
                        <Tag color={article.recommendStatus ? 'success' : 'error'}>
                            {article.recommendStatus ? '是' : '否'}
                        </Tag>
                        <Switch
                            checked={article.recommendStatus}
                            onChange={(checked) => {
                                setArticle(prev => ({...prev, recommendStatus: checked}));
                                articleForm.setFieldValue('recommendStatus', checked);
                            }}
                        />
                    </div>
                </Form.Item>

                <Form.Item
                    label="是否可见"
                    name="viewStatus"
                    initialValue={true}
                    rules={[{required: true}]}
                >
                    <div className="flex items-center space-x-3">
                        <Tag color={article.viewStatus ? 'success' : 'error'}>
                            {article.viewStatus ? '是' : '否'}
                        </Tag>
                        <Switch
                            checked={article.viewStatus}
                            onChange={(checked) => {
                                setArticle(prev => ({...prev, viewStatus: checked}));
                                articleForm.setFieldValue('viewStatus', checked);
                            }}
                        />
                    </div>
                </Form.Item>

                {!article.viewStatus && (
                    <Form.Item
                        label="不可见时的访问密码"
                        name="password"
                        rules={[{required: true, message: '请输入访问密码'}]}
                    >
                        <Input.Password maxLength={30} placeholder="请输入访问密码"/>
                    </Form.Item>
                )}

                <Form.Item
                    label="封面"
                    name="articleCover"
                    rules={[{required: true, message: '请选择封面'}]}
                >
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <Input
                                value={article.articleCover}
                                onChange={(e) => {
                                    setArticle(prev => ({...prev, articleCover: e.target.value}));
                                    articleForm.setFieldValue('articleCover', e.target.value);
                                }}
                                placeholder="封面图片URL"
                                className="flex-1"
                            />
                            {article.articleCover && (
                                <Image
                                    width={40}
                                    height={40}
                                    src={article.articleCover}
                                    alt="封面预览"
                                />
                            )}
                        </div>
                        <FileUpload isAdmin={true}
                                    prefix={'articleCover'}
                                    listType='picture'
                                    onUpload={handleArticleCoverUpload} maxSize={2} maxNumber={1}
                        />
                    </div>
                </Form.Item>

                <Form.Item
                    label="分类"
                    name="sortId"
                    rules={[{required: true}]}
                >
                    <Select
                        placeholder="请选择分类"
                        onChange={(value) => {
                            setArticle(prev => ({...prev, sortId: value}));
                        }}
                        options={sorts.map(item => (
                            {label: item.sortName, value: item.id}
                        ))}
                    />
                </Form.Item>

                <Form.Item
                    label="标签"
                    name="labelId"
                    rules={[{required: true}]}
                >
                    <Select placeholder="请选择标签"
                            disabled={!article.sortId}
                            options={sortLabels.map(item => (
                                {label: item.labelName, value: item.id}
                            ))}
                    />
                </Form.Item>
            </Form>

            {/* 操作按钮 */}
            <div className="flex justify-center space-x-4 mt-8 mb-6">
                <Button
                    type="primary"
                    icon={<SaveOutlined/>}
                    loading={loading}
                    onClick={handleSubmit}
                    size="large"
                >
                    保存
                </Button>
                <Button
                    danger
                    icon={<ReloadOutlined/>}
                    onClick={handleReset}
                    size="large"
                >
                    重置所有修改
                </Button>
            </div>
        </div>
    )
}

export default ArticleEdit;
