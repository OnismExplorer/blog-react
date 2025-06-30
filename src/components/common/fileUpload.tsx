import React, {useEffect} from "react"
import {useState, useRef, type ChangeEvent} from "react"
import {X} from "lucide-react"
import {message} from "antd";
import {useAppContext} from "@hooks/useAppContext";
import {AxiosResponse} from "axios";
import {useStore} from "@hooks/useStore";
import {getDownloadUrl} from "@api/resource";

/**
 * 上传图片组件
 * @param isAdmin 是否为管理员上传
 * @param accept 允许上传的文件类型
 * @param prefix 上传路径前缀
 * @param listType 上传类型(图片/文件)
 * @param maxSize 单个文件最大体积（MB）
 * @param maxNumber 最多上传文件数
 * @param multiplable 是否支持多选
 * @param beforeExecute 上传前的钩子, 返回 false 时中断上传
 * @param onUpload 上传成功后的回调
 */
interface FileUploadProps {
    isAdmin?: boolean
    prefix?: string
    listType?: "picture" | "file"
    accept?: string
    maxSize?: number
    maxNumber?: number
    header?: React.ReactNode
    beforeExecute?: () => boolean | Promise<boolean>
    onUpload?: (url: string) => void
}

interface FileItem {
    uid: string
    name: string
    size: number
    type: string
    status: "ready" | "uploading" | "success" | "error"
    url?: string
    percent?: number
    raw: File
    response?: AxiosResponse
    error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
                                                   isAdmin = false,
                                                   prefix = "",
                                                   listType = "picture",
                                                   accept = "image/*",
                                                   maxSize = 5,
                                                   maxNumber = 5,
                                                   header,
                                                   beforeExecute,
                                                   onUpload,
                                               }) => {
    const [fileList, setFileList] = useState<FileItem[]>([])
    // 是否拖拽上传
    const [isDragging, setIsDragging] = useState(false)
    // 是否点击上传
    const [isClick, setIsClick] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {common, constant} = useAppContext();
    const {state} = useStore();
    const [qiniuDownload,setQiniuDownload] = useState<string>();

    useEffect(() => {
        getDownloadUrl()
            .then((res) => {
                setQiniuDownload(res);
            })
    }, []);

    const handleClick = async () => {
        if (beforeExecute) {
            const ok = await beforeExecute()
            if (!ok) return
        }

        fileInputRef.current?.click()
        setIsClick(true)
        setTimeout(() => setIsClick(false), 200)
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (beforeExecute) {
            const ok = await beforeExecute()
            if (!ok) return
        }

        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return ;
        }
        handleFiles(Array.from(e.target.files))
    }

    const handleFiles = (files: File[]) => {
        if (fileList.length + files.length > maxNumber) {
            message.warning(`最多只能上传 ${maxNumber} 个文件!`).then();
            return
        }

        const newFiles = files
            .map((file) => {
                if (file.size > maxSize * 1024 * 1024) {
                    message.warning(`文件大小不能超过 ${maxSize}M!`).then();
                    return null
                }

                return {
                    uid: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: "ready" as const,
                    raw: file,
                }
            })
            .filter(Boolean) as FileItem[]

        setFileList((prev) => [...prev, ...newFiles])
    }

    const handleRemove = (uid: string) => {
        setFileList((prev) => prev.filter((file) => file.uid !== uid))
    }

    const customUpload = async (file: FileItem) => {
        let suffix = ""
        if (file.name.lastIndexOf(".") !== -1) {
            suffix = file.name.substring(file.name.lastIndexOf("."))
        }

        const username = !common.isEmpty(state.currentUser.username)
            ? (state.currentUser.username ?? '').replace(/[^a-zA-Z]/g, '') + state.currentUser.id
            : (state.currentAdmin.username ?? '').replace(/[^a-zA-Z]/g, '') + state.currentAdmin.id;

        const key = `${prefix}/${username}${new Date().getTime()}${Math.floor(Math.random() * 1000)}${suffix}`

        try {
            // Update file status to uploading
            setFileList((prev) =>
                prev.map((item) => (item.uid === file.uid ? {
                    ...item,
                    status: "uploading" as const,
                    percent: 0
                } : item)),
            )

            // 获取上传 token
            const tokenResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/qiniu/getUpToken?key=${key}`, {
                headers: {
                    Authorization: isAdmin ? localStorage.getItem("adminToken") || "" : localStorage.getItem("userToken") || "",
                },
            })

            const tokenData = await tokenResponse.json()

            if (tokenData.code !== 200) {
                return Promise.reject(tokenData.message || "获取上传凭证失败")
            }

            // Create form data for upload
            const formData = new FormData()
            formData.append("token", tokenData.data)
            formData.append("key", key)
            formData.append("file", file.raw)

            // Upload file to Qiniu
            const xhr = new XMLHttpRequest()
            xhr.open("POST", constant.qiniuUrl)

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100)
                    setFileList((prev) => prev.map((item) => (item.uid === file.uid ? {...item, percent} : item)))
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText)
                    const url = `${qiniuDownload}${response.key}`

                    // Update file status to success
                    setFileList((prev) =>
                        prev.map((item) => (item.uid === file.uid ? {
                            ...item,
                            status: "success" as const,
                            url,
                            response
                        } : item)),
                    )

                    // 保存资源
                    common.saveResource(prefix, url, file.size, file.raw.type, isAdmin)
                    if (onUpload) {
                        onUpload(url)
                    }
                } else {
                    handleUploadError(file.uid, "上传失败")
                }
            }

            xhr.onerror = () => {
                handleUploadError(file.uid, "网络异常")
            }

            xhr.send(formData)
        } catch (error) {
            handleUploadError(file.uid, error instanceof Error ? error.message : "上传失败")
        }
    }

    const handleUploadError = (uid: string, errorMessage: string) => {
        setFileList((prev) =>
            prev.map((item) => (item.uid === uid ? {...item, status: "error" as const, error: errorMessage} : item)),
        )
        message.error(errorMessage).then();
    }

    const submitUpload = () => {
        fileList.forEach((file) => {
            if (file.status === "ready") {
                customUpload(file).then()
            }
        })
    }

    return (
        <div className="w-full select-none font-custom text-sm">
            <div className="flex items-center justify-center mb-2">
                {header}
            </div>
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isClick ? "border-themeBackground bg-orange-100" : isDragging ? "border-primary border-blue-500 bg-blue-100" : "border-gray-300 hover:border-blue-500"
                }`}
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input type="file" ref={fileInputRef} hidden className="hidden" multiple accept={accept}
                       onClick={(e) => e.stopPropagation()}
                       onChange={handleFileChange}/>
                <div className="flex flex-col items-center justify-center hover:border-blue-500">
                    <svg viewBox="0 0 1024 1024" className="w-10 h-10 mb-2">
                        <path
                            d="M666.2656 629.4528l-113.7664-112.4864c-20.7872-20.5824-54.3232-20.5312-75.1104 0.1024l-113.3056 112.4864c-20.8896 20.736-21.0432 54.528-0.256 75.4688 20.736 20.8896 54.528 21.0432 75.4688 0.256l22.6304-22.4256v189.5936c0 29.44 23.9104 53.3504 53.3504 53.3504s53.3504-23.9104 53.3504-53.3504v-189.5424l22.6816 22.4256a53.1456 53.1456 0 0 0 37.5296 15.4112c13.7728 0 27.4944-5.2736 37.9392-15.8208 20.6336-20.9408 20.4288-54.7328-0.512-75.4688z"
                            fill="#FFE37B"
                        ></path>
                        <path
                            d="M820.992 469.504h-5.376c-3.072-163.328-136.3456-294.8096-300.4416-294.8096S217.856 306.1248 214.784 469.504H209.408c-100.7104 0-182.3744 81.664-182.3744 182.3744s81.664 182.3744 182.3744 182.3744h209.7664V761.856c-30.208 5.5808-62.464-3.3792-85.6576-26.7264-37.3248-37.5808-37.0688-98.5088 0.512-135.7824l113.3056-112.4864c37.2224-36.9664 97.8432-37.0176 135.168-0.1536l113.7664 112.4864c18.2272 18.0224 28.3648 42.0864 28.5184 67.7376 0.1536 25.6512-9.728 49.8176-27.7504 68.0448a95.40096 95.40096 0 0 1-68.3008 28.5184c-5.9392 0-11.776-0.512-17.5104-1.5872v72.3456h209.7664c100.7104 0 182.3744-81.664 182.3744-182.3744S921.7024 469.504 820.992 469.504z"
                            fill="#8C7BFD"
                        ></path>
                    </svg>
                    <div className="text-gray-600">拖拽上传 / 点击上传</div>
                </div>
            </div>

            <div className="mt-2 text-sm text-gray-500 text-center">
                {listType === "picture" ? (
                    <p>
                        一次最多上传{maxNumber}张图片，且每张图片不超过{maxSize}M！
                    </p>
                ) : (
                    <p>
                        一次最多上传{maxNumber}个文件，且每个文件不超过{maxSize}M！
                    </p>
                )}
            </div>

            {fileList.length > 0 && (
                <div
                    className={`mt-4 ${listType === "picture" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" : ""}`}>
                    {fileList.map((file) => (
                        <div
                            key={file.uid}
                            className={`relative ${
                                listType === "picture"
                                    ? "border rounded-md overflow-hidden w-32 h-32"
                                    : "flex items-center p-2 border rounded-md mb-2"
                            }`}
                        >
                            {listType === "picture" ? (
                                <>
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                        {file.status === "uploading" ? (
                                            <div className="text-center">
                                                <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-primary h-2.5 rounded-full"
                                                        style={{width: `${file.percent || 0}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-xs mt-1">{file.percent || 0}%</span>
                                            </div>
                                        ) : file.url ? (
                                            <img
                                                src={file.url || "/placeholder.svg"}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-xs p-2 truncate">{file.name}</div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(file.uid)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                                    >
                                        <X className="w-4 h-4"/>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 truncate">{file.name}</div>
                                    {file.status === "uploading" && (
                                        <div className="w-20 mx-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-primary h-2.5 rounded-full"
                                                     style={{width: `${file.percent || 0}%`}}></div>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(file.uid)}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-4 h-4"/>
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="text-center mt-5">
                <button onClick={submitUpload}
                        className="py-2 px-5 rounded-md bg-lightGreen hover:bg-themeBackground text-white">
                    上传
                </button>
            </div>
        </div>
    )
}

export default FileUpload
