import React, {useState, useEffect} from 'react';
import {message, Modal, Radio, RadioChangeEvent} from 'antd';
import {useAppContext} from '@hooks/useAppContext';
import {useStore} from '@hooks/useStore';
import {weiYan} from '@type/weiYan';
import TwoPoem from '@components/common/TwoPoem';
import TreeHole from '@components/common/treeHole';
import ProPage from '@components/common/proPage';
import Footer from '@components/common/footer';
import CommentBox from '@components/comment/commentBox';
import {page} from "@type/page";
import {deleteWeiYan, getWeiYanList, saveWeiYan} from "@api/weiYan";
import {getDownloadUrl} from "@api/resource";


/**
 * 微言组件 - 用于展示和管理微言/树洞内容
 */
const WeiYan: React.FC = () => {
    // 状态管理
    const [treeHoleList, setTreeHoleList] = useState<weiYan[]>([]);
    const [pagination, setPagination] = useState<page>({
        pageNumber: 1,
        pageSize: 10
    });
    const [weiYanDialogVisible, setWeiYanDialogVisible] = useState<boolean>(false);
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [showFooter, setShowFooter] = useState<boolean>(false);

    // 获取上下文和状态
    const {common, constant} = useAppContext();
    const {state} = useStore();

    // 组件挂载时获取微言数据
    useEffect(() => {
        // 获取下载地址
        getDownloadUrl()
            .then((res) => {
                sessionStorage.setItem('qiniuDownload',res);
            })
        getWeiYan();
    }, []);

    // 切换页码
    const handlePageChange = (page: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: page
        }));

        // 平滑滚动到顶部
        window.scrollTo({
            top: 240,
            behavior: "smooth"
        });

        getWeiYan();
    };

    // 发布微言
    const launch = () => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
            return;
        }

        setWeiYanDialogVisible(true);
    };

    // 关闭对话框
    const handleClose = () => {
        setWeiYanDialogVisible(false);
    };

    // 提交微言
    const submitWeiYan = (content: string) => {
        const weiYan: weiYan = {
            id: null,
            source: null,
            content,
            isPublic,
            createTime: ""
        };

        saveWeiYan(weiYan)
            .then(() => {
                getWeiYan();
            })

        handleClose();
    };

    // 删除微言
    const deleteTreeHole = (id: number) => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
            return;
        }

        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okType: 'primary',
            centered: true,
            onOk() {
                deleteWeiYan(id)
                    .then(() => {
                        message.success('删除成功!').then();
                        setPagination(prev => ({
                            ...prev,
                            pageNumber: 1
                        }));
                        getWeiYan();
                    })
            },
            onCancel: () => {
                message.success('已取消删除!').then();
            }
        });
    };

    // 获取微言列表
    const getWeiYan = () => {
        getWeiYanList(pagination)
            .then((res) => {
                setShowFooter(false);
                const result = res.data;
                if (!common.isEmpty(result)) {
                    // 处理内容格式
                    const records = result.records.map((item) => {
                        let content = item.content.replace(/\n{2,}/g, '<div style="height: 12px"></div>');
                        content = content.replace(/\n/g, '<br/>');
                        content = common.faceReg(content);
                        content = common.pictureReg(content);
                        return {...item, content};
                    });

                    setTreeHoleList(records);
                    setPagination(prev => ({
                        ...prev,
                        total: result.totalRow
                    }));
                }

                setTimeout(() => {
                    setShowFooter(true);
                }, 0);
            })
    };

    // 处理单选按钮变化
    const handleRadioChange = (e: RadioChangeEvent) => {
        setIsPublic(e.target.value);
    };

    return (
        <div className="flex flex-col min-h-screen select-none">
            {/* 两句诗 */}
            <div className="animate-slide-top">
                <TwoPoem isHitokoto={true}/>
            </div>

            <div className="bg-background animate-hideToShow-2.5 flex-grow">
                <div className="mb-6 sm:mb-10 px-2 sm:px-0">
                    <TreeHole
                        treeHoleList={treeHoleList}
                        avatar={!common.isEmpty(state.currentUser) ? state.currentUser.avatar ?? "" : state.webInfo.avatar}
                        launch={launch}
                        deleteTreeHole={deleteTreeHole}
                    />
                    <ProPage
                        current={pagination.pageNumber}
                        size={pagination.pageNumber}
                        total={pagination.total}
                        buttonCount={3}
                        color={constant.pageColor}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* 页脚 - 始终位于底部 */}
            <div className="mt-auto">
                <Footer showFooter={showFooter}/>
            </div>

            {/* 微言对话框 */}
            <Modal
                title={
                    <span className="font-comic text-[20px] sm:text-[24px] m-2">微言</span>
                }
                style={{textAlign: "center"}}
                open={weiYanDialogVisible}
                onCancel={handleClose}
                width={window.innerWidth < 768 ? "90%" : "40%"}
                destroyOnClose
                centered
                footer={null}
            >
                <div>
                    <div className="flex justify-center items-center pb-3 sm:pb-5">
                        <Radio.Group value={isPublic} onChange={handleRadioChange}>
                            <Radio.Button
                                className="text-[16px] sm:text-[18px] font-bold font-custom px-3 sm:px-4"
                                value={true}>公开</Radio.Button>
                            <Radio.Button
                                className="text-[16px] sm:text-[18px] font-bold font-custom px-3sm:px-4"
                                value={false}>私密</Radio.Button>
                        </Radio.Group>
                    </div>
                    <CommentBox
                        disableGraffiti={true}
                        onSubmitComment={submitWeiYan}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default WeiYan;
