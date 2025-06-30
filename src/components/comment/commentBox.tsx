import React, {useState} from "react";
import {message, Modal} from "antd";
import {PictureOutlined, SmileOutlined} from "@ant-design/icons";
import Emoji from "../common/emoji";
import {useStore} from "../../hooks/useStore";
import FileUpload from "../common/fileUpload";
import ProButton from "../common/proButton";
import constant from "../../utils/constant";
import common from "../../utils/common";

interface CommentBoxProps {
    disableGraffiti?: boolean;
    onSubmitComment: (content: string) => void;
    onShowGraffiti?: () => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({
                                                   disableGraffiti = true,
                                                   onSubmitComment,
                                                   onShowGraffiti,
                                               }) => {
    const {state} = useStore();
    const [commentContent, setCommentContent] = useState<string>("");
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [showPicture, setShowPicture] = useState<boolean>(false);
    const [pictureUrl, setPictureUrl] = useState<string>("");


    const openPicture = () => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
            return;
        }
        setShowPicture(true);
    };

    const addPicture = (url: string) => {
        setPictureUrl(url);
        savePicture();
    };

    const savePicture = () => {
        setCommentContent((prev) => prev + `<${state.currentUser.username},${pictureUrl}>`);
        setPictureUrl("");
        setShowPicture(false);
    };

    const addEmoji = (emoji: string) => {
        setCommentContent((prev) => prev + emoji);
    };

    const showGraffiti = () => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
            return;
        }
        setCommentContent("");
        // 只有在 onShowGraffiti 存在时才调用
        if (onShowGraffiti) {
            onShowGraffiti();
        }
    };

    const submitComment = () => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
            return;
        }

        if (!commentContent.trim()) {
            message.warning("你还没写呢~").then();
        }
        onSubmitComment(commentContent.trim());
        setCommentContent("");
    };

    return (
        <div className="space-y-4">
            {/* 评论对话框 */}
            <textarea
                className="border border-lightGray w-full text-sm min-h-[180px] resize-none rounded bg-commentURL bg-contain bg-no-repeat bg-[100%] mb-2.5 p-[15px] focus:outline-themeBackground"
                value={commentContent}
                style={{resize: 'none'}} // 禁止拖拽
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下点什么..."
                maxLength={1000}
            />

            {/* Buttons and Emoji */}
            <div className="flex justify-between items-center">
                <div className="flex">
                    <div
                        className={`cursor-pointer ${showEmoji ? "text-red-500" : ""}`}
                        onClick={() => setShowEmoji(!showEmoji)}
                    >
                        <SmileOutlined className="text-xl mr-3"/>
                    </div>
                    <div onClick={openPicture}>
                        <PictureOutlined className="text-xl"/>
                    </div>
                </div>
                <div className="flex gap-x-2">
                    {!disableGraffiti && (
                        <ProButton
                            info="涂鸦"
                            onClick={showGraffiti}
                            before={constant.before_color_1}
                            after={constant.after_color_1}
                        />
                    )}
                    <ProButton info="提交" onClick={submitComment} before={constant.before_color_2}
                               after={constant.after_color_2}/>
                </div>
            </div>

            {showEmoji && <Emoji showEmoji={true} onAddEmoji={addEmoji}/>}

            <Modal
                title="图片"
                open={showPicture}
                onCancel={() => setShowPicture(false)}
                footer={null}
                destroyOnClose
                centered
            >
                <FileUpload prefix="commentPicture" onUpload={addPicture} maxSize={5} maxNumber={5}/>
            </Modal>
        </div>
    );
};

export default CommentBox;
