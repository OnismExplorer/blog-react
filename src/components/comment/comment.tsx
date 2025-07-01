import React, { useEffect, useState, useCallback } from "react";
import { Avatar, message, Modal } from "antd";
import {ApiError} from "@error/ApiError";
import {comment} from "@type/comment";
import {getCommentList} from "@api/comment";
import {useStore} from "@hooks/useStore";
import {getDownloadUrl} from "@api/resource";
import ProPage from "../common/proPage";
import Graffiti from "./graffiti";
import CommentBox from "./commentBox";
import { useAppContext } from "@hooks/useAppContext";
import { AiOutlineEdit } from "react-icons/ai";
import { page } from "@type/page";

interface Pagination extends page {
    source: number;
    commentType: string;
    floorCommentId: number | null;
}

interface Props {
    source: number;
    type: string;
    userId: number;
}

const Comment: React.FC<Props> = ({ source, type, userId }) => {
    const { common, constant, request, time } = useAppContext();
    const store = useStore();
    const [isGraffiti, setIsGraffiti] = useState(false);
    const [total, setTotal] = useState(0);
    const [comments, setComments] = useState<comment[]>([]);
    const [replyDialogVisible, setReplyDialogVisible] = useState(false);
    const [floorComment, setFloorComment] = useState<comment | null>(null);
    const [replyComment, setReplyComment] = useState<comment | null>(null);

    const [loadingChildren, setLoadingChildren] = useState<number[]>([]);

    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        source,
        commentType: type,
        floorCommentId: null,
    });

    useEffect(() => {
        // 获取下载地址
        getDownloadUrl()
            .then((res) => {
                sessionStorage.setItem('qiniuDownload',res);
            })
    }, []);


    const processCommentContent = (content: string): string => {
        if (!content) return "";
        const processedContent = content.replace(/\n/g, '<br/>');
        return common.pictureReg(common.faceReg(processedContent));
    };

    const fetchComments = useCallback((fetchPagination: Pagination, parentComment?: comment, isExpanding?: boolean) => {
        const parentCommentId = parentComment ? parentComment.id : null;

        getCommentList("user",fetchPagination)
            .then((res) => {
                const result = res.data;
                if (result.records) {
                    const fetchedData = result;

                    if (parentComment) {
                        setComments(prevComments =>
                            prevComments.map(c => {
                                if (c.id === parentComment.id) {
                                    const updatedComment = { ...c };

                                    const processedRecords = fetchedData.records.map(child => ({
                                        ...child,
                                        commentContent: processCommentContent(child.commentContent)
                                    }));

                                    if (isExpanding) {
                                        updatedComment.childComments = {
                                            ...fetchedData,
                                            records: [
                                                ...c.childComments.records,
                                                ...processedRecords
                                            ]
                                        };
                                    } else {
                                        updatedComment.childComments = {
                                            ...fetchedData,
                                            records: processedRecords
                                        };
                                    }
                                    return updatedComment;
                                }
                                return c;
                            })
                        );
                    } else {
                        const processedRecords = fetchedData.records.map(c => {
                            const newChildren = c.childComments?.records?.map(cc => ({
                                ...cc,
                                commentContent: processCommentContent(cc.commentContent)
                            })) || [];

                            return {
                                ...c,
                                commentContent: processCommentContent(c.commentContent),
                                childComments: { ...c.childComments, records: newChildren }
                            }
                        });
                        setComments(processedRecords);
                        setPagination((prev) => ({ ...prev, total: fetchedData.totalRow }));
                    }
                }
            })
            .finally(() => {
               if (parentCommentId) {
                    setLoadingChildren(prev => prev.filter(id => id !== parentCommentId));
                }
            });
    }, []);


    const handleToPage = (pageNumber: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: pageNumber
        }));

        const commentElement = document.getElementById("comment-content-wrapper");
        if (commentElement) {
            window.scrollTo({
                top: commentElement.offsetTop,
                behavior: 'smooth'
            });
        }

    };

    const handleToChildPage = (currentFloorComment: comment) => {

        if (loadingChildren.includes(currentFloorComment.id)) {
            return;
        }

        setLoadingChildren(prev => [...prev, currentFloorComment.id]);

        const nextPage = currentFloorComment.childComments.pageNumber + 1;
        const childPage: Pagination = {
            pageNumber: nextPage,
            pageSize: 5,
            total: 0,
            source,
            commentType: type,
            floorCommentId: currentFloorComment.id
        };

        fetchComments(childPage, currentFloorComment, true);
    };

    const handleReplySubmit = async (commentContent: string) => {
        if (!replyComment || !floorComment) return;

        const newComment = {
            source,
            type,
            floorCommentId: floorComment.id,
            parentCommentId: replyComment.id,
            parentUserId: replyComment.userId,
            userId:store.state.currentUser.id,
            commentContent,
        };

        try {
            await request.post("/comment/saveComment", newComment);
            message.success("回复成功！");

            const childPage: Pagination = {
                pageNumber: 1,
                pageSize: 5,
                source,
                commentType: type,
                floorCommentId: floorComment.id
            };
            fetchComments(childPage, floorComment, false);
            fetchTotalComments();
            setReplyDialogVisible(false);
        } catch (error) {
            message.error(error instanceof ApiError ? error.message : "回复失败！");
        }
    };

    const handleCommentSubmit = async (commentContent: string) => {
        const newComment = { source, type, commentContent };
        try {
            await request.post("/comment/saveComment", newComment);
            message.success("评论成功！");

            if (pagination.pageNumber === 1) {
                fetchComments(pagination);
            } else {
                setPagination(prev => ({ ...prev, pageNumber: 1 }));
            }
            fetchTotalComments();
        } catch (error) {
            message.error(error instanceof ApiError ? error.message : "评论失败！");
        }
    };

    const fetchTotalComments = useCallback(() => {
        request
            .get<number>("/comment/getCommentCount", { source, type })
            .then((res) => {
                const result = res.data
                if (!common.isEmpty(result)) {
                    setTotal(result.data);
                }
            })
            .catch((error) => {
                message.error(error.message || "Failed to get comment count.").then();
            });
    }, [common, request, source, type]);


    const openReplyDialog = (commentToReply: comment, parentFloorComment: comment) => {
        setReplyComment(commentToReply);
        setFloorComment(parentFloorComment);
        setReplyDialogVisible(true);
    };

    const handleCloseDialog = () => {
        setReplyDialogVisible(false);
        setFloorComment(null);
        setReplyComment(null);
    };

    useEffect(() => {
        fetchTotalComments();
    }, [fetchTotalComments]);

    useEffect(() => {
        fetchComments(pagination);
    }, [pagination.pageNumber, fetchComments]);


    return (
        <div className="font-custom select-none">

            <div className="mb-10">
                <div className="text-lg font-bold flex items-center mb-3 mt-4">
                    <AiOutlineEdit className="font-bold text-[22px] text-yellow-500" aria-label="Edit Icon" />
                    <i className="font-optima text-[19px] text-yellow-500">留言</i>
                </div>
                <div>
                    {!isGraffiti ? (
                        <CommentBox onShowGraffiti={() => setIsGraffiti(true)} onSubmitComment={handleCommentSubmit} />
                    ) : (
                        <Graffiti showComment={() => setIsGraffiti(false)} addGraffitiComment={handleCommentSubmit} />
                    )}
                </div>
            </div>

            {comments.length > 0 ? (
                <div id="comment-content-wrapper">
                    <div className="text-lg mb-4">
                        <span>Comments | </span>
                        <span>{total} 条</span>
                    </div>
                    {comments.map((comment) => (
                        <div key={comment.id}>
                            <div className="flex mb-5">
                                <Avatar src={comment.avatar} size={35} shape="square" className="mr-2" />
                                <div className="flex-1 pl-1">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold text-orangeRed">{comment.username}</span>
                                            {comment.userId === userId && (
                                                <span className="text-green-500 ml-2 text-xs border border-green-500 rounded-md py-0.5 px-1">主人翁</span>
                                            )}
                                            <span className="text-gray-500 ml-3">{time.getDateDiff(comment.createTime)}</span>
                                        </div>
                                        <div className="text-xs cursor-pointer text-white bg-themeBackground rounded-md py-[3px] px-[6px]" onClick={() => openReplyDialog(comment, comment)}>
                                            {comment.childComments.totalRow > 0 && (<span>{comment.childComments.totalRow} 条</span>)}
                                            <span>回复</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 p-4 rounded my-2" dangerouslySetInnerHTML={{ __html: comment.commentContent }} />
                                    {/*回复*/}
                                    {comment.childComments.records.map((childItem) => (
                                        <div key={childItem.id} className="flex mt-3">
                                            <Avatar size={30} src={childItem.avatar} alt={childItem.username} shape="square" className="rounded-[5px]" />
                                            <div className="flex-1 pl-2">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <span className="text-orangeRed text-sm font-semibold mr-1">{childItem.username}</span>
                                                        {childItem.userId === userId && (
                                                            <span className="text-green-500 ml-2 text-xs border border-green-500 rounded-md py-0.5 px-1">主人翁</span>
                                                        )}
                                                        <span className="text-xs text-greyFont">{time.getDateDiff(childItem.createTime)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs cursor-pointer text-white bg-themeBackground rounded-md py-[3px] px-[6px]" onClick={() => openReplyDialog(childItem, comment)}>回复</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 mb-2 py-3 px-5 bg-commentContent rounded-xl text-black break-words">
                                                    {childItem.parentCommentId !== comment.id && childItem.parentUserId !== childItem.userId && (
                                                        <span className="text-blue-500 mr-1">@ {childItem.parentUsername}</span>
                                                    )}
                                                    <span dangerouslySetInnerHTML={{ __html: childItem.commentContent }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* 展开 */}
                                    {(comment.childComments.records.length || 0) < comment.childComments.totalRow && (
                                        <div className="flex justify-center mb-2 mt-3">
                                            <div
                                                className="py-1 px-5 border border-lightGray rounded-[3rem] text-greyFont cursor-pointer text-center text-xs hover:border-themeBackground hover:text-themeBackground hover:shadow-box-shadow"
                                                onClick={() => handleToChildPage(comment)}
                                            >
                                                {loadingChildren.includes(comment.id) ? 'Loading...' : '展开'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <hr className="border-1 border-gray-200 my-3" />
                        </div>
                    ))}
                    <ProPage
                        current={pagination.pageNumber}
                        size={pagination.pageSize}
                        total={pagination.total}
                        buttonCount={6}
                        color={constant.commentPageColor}
                        onPageChange={handleToPage}
                    />
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <i>来发第一个留言啦~</i>
                </div>
            )}

            <Modal className="font-custom" title={<span className="text-base font-custom">回复</span>} style={{textAlign:'center'}} open={replyDialogVisible} onCancel={handleCloseDialog} footer={null} destroyOnHidden>
                <CommentBox disableGraffiti onSubmitComment={handleReplySubmit} />
            </Modal>
        </div>
    );
};

export default Comment;
