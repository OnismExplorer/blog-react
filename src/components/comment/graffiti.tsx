import React, {useEffect, useRef, useState} from "react";
import {message} from "antd";
import classNames from "classnames";
import "tailwindcss/tailwind.css";
import  {useStore} from "@hooks/useStore";
import {ApiResponse} from "@utils/request";
import {getDownloadUrl} from "@api/resource";
import ProButton from "../common/proButton";
import {useAppContext} from "@hooks/useAppContext";

type GraffitiProps = {
    showComment: () => void;
    addGraffitiComment: (comment: string) => void;
};

const Graffiti: React.FC<GraffitiProps> = ({showComment, addGraffitiComment}) => {
    const {state} = useStore(); // 获取状态
    const {common,constant,request} = useAppContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [canvasMoveUse, setCanvasMoveUse] = useState(false);
    const [preDrawAry, setPreDrawAry] = useState<ImageData[]>([]);
    const [nextDrawAry, setNextDrawAry] = useState<ImageData[]>([]);
    const [middleAry, setMiddleAry] = useState<ImageData[]>([]);
    const [config, setConfig] = useState({
        lineWidth: state.toolbar.visible ? 10 : 5,
        lineColor: "#8154A3",
        shadowBlur: 2,
    });
    const [qiniuDownload,setQiniuDownload] = useState<string>();
    const colors = ["#8154A3", "#fef4ac", "#0018ba", "#ffc200", "#f32f15", "#cccccc", "#5ab639"];
    const brushSize = [
        {className: "text-sm", lineWidth: 5},
        {className: "text-base", lineWidth: 10},
        {className: "text-lg", lineWidth: 15},
    ];

    const controls = [
        {
            title: "上一步",
            action: "prev",
            isActive: preDrawAry.length > 0,
        },
        {
            title: "下一步",
            action: "next",
            isActive: nextDrawAry.length > 0,
        },
        {
            title: "清除",
            action: "clear",
            isActive: preDrawAry.length > 0 || nextDrawAry.length > 0,
        },
    ];

    // 初始化
    useEffect(() => {
        getDownloadUrl()
            .then((res) => {
                setQiniuDownload(res);
            })
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d", {willReadFrequently: true});
            if (context) {
                contextRef.current = context;
                initDraw(context);
                setCanvasStyle(context);
            }
        }
    },[config]); // 根据状态变化重新初始化

    const initDraw = (context: CanvasRenderingContext2D) => {
        const preData = context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        setMiddleAry([preData]);
    };

    const setCanvasStyle = (context: CanvasRenderingContext2D) => {
        context.lineWidth = config.lineWidth;
        context.shadowBlur = config.shadowBlur;
        context.shadowColor = config.lineColor;
        context.strokeStyle = config.lineColor;
    };

    const canvasDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setCanvasMoveUse(true);
        const {offsetX, offsetY} = e.nativeEvent;
        const context = contextRef.current;
        if (context) {
            context.beginPath();
            context.moveTo(offsetX, offsetY);
            setPreDrawAry([...preDrawAry, context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
        }
    };

    const canvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasMoveUse) {
            const {offsetX, offsetY} = e.nativeEvent;
            const context = contextRef.current;
            if (context) {
                context.lineTo(offsetX, offsetY);
                context.stroke();
            }
        }
    };

    const canvasUp = () => {
        setCanvasMoveUse(false);
        const context = contextRef.current;
        if (context) {
            const preData = context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            setMiddleAry([...middleAry, preData]);
            context.beginPath();
        }
    };

    const setColor = (color: string) => {
        setConfig({...config, lineColor: color});
    };

    const setBrush = (size: number) => {
        setConfig({...config, lineWidth: size});
    };

    const controlCanvas = (action: string) => {
        const context = contextRef.current;
        if (!context) return;

        switch (action) {
            case "prev":
                if (preDrawAry.length > 0) {
                    const newPreDrawAry = [...preDrawAry];
                    const popData = newPreDrawAry.pop()!;
                    setPreDrawAry(newPreDrawAry);
                    setNextDrawAry([...nextDrawAry, middleAry[middleAry.length - newPreDrawAry.length - 2]]);
                    context.putImageData(popData, 0, 0);
                }
                break;
            case "next":
                if (nextDrawAry.length > 0) {
                    const newNextDrawAry = [...nextDrawAry];
                    const popData = newNextDrawAry.pop()!;
                    setNextDrawAry(newNextDrawAry);
                    setPreDrawAry([...preDrawAry, middleAry[middleAry.length - newNextDrawAry.length - 2]]);
                    context.putImageData(popData, 0, 0);
                }
                break;
            case "clear":
                clearContext();
                setMiddleAry([middleAry[0]]);
                break;
            default:
                break;
        }
    };

    const clearContext = () => {
        const context = contextRef.current;
        if (context) {
            context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }
        setPreDrawAry([]);
        setNextDrawAry([]);
    };

    const getImage = async () => {
        if (common.isEmpty(state.currentUser)) {
            message.error("请先登录！").then();
            return;
        }
        if (preDrawAry.length < 1) {
            message.warning("你还没画呢~");
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL("image/png");
        const [header, base64Data] = dataURL.split(",");
        const mimeType = header.match(/:(.*?);/)?.[1] || "image/png";
        // 将 Base64 转换为二进制
        const binaryString = atob(base64Data);
        const binaryLength = binaryString.length;
        const u8arr = new Uint8Array(binaryLength);
        for (let i = 0; i < binaryLength; i++) {
            u8arr[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([u8arr], {type: mimeType});
        const key = `graffiti/${state.currentUser.username?.replace(/[^a-zA-Z]/g, '')}${state.currentUser.id}${Date.now()}${Math.floor(Math.random() * 1000)}.png`;
        const fd = new FormData();
        fd.append("file", blob);
        fd.append("key", key);

        try {
            request.get<string>(import.meta.env.VITE_BASE_URL + "/qiniu/getUpToken", {key: key})
                .then((res) => {
                    if (common.isEmpty(res.data)) {
                        fd.append("token", res.data.data);

                        request.uploadQiniu<unknown,ApiResponse<{hash:string,key:string}>>(constant.qiniuUrl, fd)
                            .then((res) => {
                                if (common.isEmpty(res.data.key)) {
                                    clearContext();
                                    const url = qiniuDownload + res.data.key;
                                    common.saveResource("graffiti", url, blob.size, blob.type);
                                    const img = "<你画我猜," + url + ">";
                                    addGraffitiComment(img);
                                }
                            })
                            .catch((error: unknown) => {
                                clearContext();
                                if (error instanceof Error) {
                                     message.error(error.message);
                                    return;
                                } else {
                                    message.error("发生未知错误");
                                    return;
                                }
                            });
                    }
                })
                .catch((error: unknown) => {
                    clearContext();
                    if (error instanceof Error) {
                        message.error(error.message);
                        return;
                    } else {
                        message.error("发生未知错误");
                        return;
                    }
                });
            clearContext();
        } catch (error: unknown) {
            clearContext();
            if (error instanceof Error) {
                message.error(error.message);
                return
            } else {
                message.error("发生未知错误");
                return
            }
        }
    };

    return (
        <div>
            <div
                className="p-2"
                onMouseMove={(e) => e.target !== canvasRef.current && setCanvasMoveUse(false)}
            >
                <div className="border-2 rounded overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={766}
                        height={400}
                        className="block"
                        onMouseDown={canvasDown}
                        onMouseUp={canvasUp}
                        onMouseMove={canvasMove}
                    />
                </div>
            </div>

            <div className="p-2">
                <div className="flex items-center mb-2">
                    <span className="text-sm">画笔颜色</span>
                    <div className="flex ml-8">
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={classNames("w-4 h-4 rounded-full cursor-pointer mr-5 transition", {
                                    "w-5 h-5": config.lineColor === color,
                                })}
                                style={{background: color}}
                                onClick={() => setColor(color)}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center mb-2">
                    <span className="text-sm">画笔大小</span>
                    <div className="flex ml-8">
                        {brushSize.map((pen, index) => (
                            <i
                                key={index}
                                className={classNames("cursor-pointer mr-5", pen.className, {
                                    "bg-theme-background text-white rounded-full p-1": config.lineWidth === pen.lineWidth,
                                })}
                                onClick={() => setBrush(pen.lineWidth)}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center mb-2">
                    <span className="text-sm">操作</span>
                    <div className="flex ml-12">
                        {controls.map((control, index) => (
                            <i
                                key={index}
                                title={control.title}

                                className={classNames("cursor-pointer mr-5 text-sm", {
                                    "text-gray-500 cursor-not-allowed": !control.isActive,
                                    "text-black": control.isActive,
                                })}
                                onClick={() => control.isActive && controlCanvas(control.action)}
                            >
                                {control.title}
                            </i>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-5">
                    <ProButton onClick={showComment} info={"文字"} before={constant.before_color_1}
                               after={constant.after_color_1}/>
                    <ProButton info={"提交"} before={constant.before_color_2} after={constant.after_color_2}
                               onClick={getImage}/>
                </div>
            </div>
        </div>
    );
};

export default Graffiti;
