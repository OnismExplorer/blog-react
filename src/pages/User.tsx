import React, {useEffect, useRef, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {useStore} from "@hooks/useStore";
import {user,LoginParams} from "@type/user";
import {Avatar, Input, message, Modal, Radio} from "antd";
import ProButton from "@components/common/proButton";
import Image from "@components/common/image";
import {UserOutlined} from "@ant-design/icons";
import FileUpload from "@components/common/fileUpload";
import TwoPoem from "@components/common/TwoPoem";
import {useNavigate} from "react-router-dom";
import {
    getCode,
    handleForgetPassword,
    handleLogin,
    handleRegist,
    handleUpdateAccountInfo,
    handleUpdateUserInfo
} from "@api/user";
import {getRandomResource} from "@api/webInfo";

interface DialogParamsType {
    flag?: number; // 标记：1.手机号 2.邮箱
    place?: string; // 地址：手机号/邮箱
    code?: string; // 验证码
    password?: string; // 密码
}

const User: React.FC<user> = () => {

    const {common, constant} = useAppContext();
    const store = useStore();
    const locked = useRef<boolean>(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
    const [props, setProps] = useState<user>({
        username: "",
        password: "",
        code: "",
        phoneNumber: ""
    })
    // 验证码
    const [codeString, setCodeString] = useState<string>('验证码');
    // 登录参数
    const [loginParams, setLoginParams] = useState<LoginParams>({
        account: "",
        password: "",
        isAdmin: false,
    });
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [passwordFlag, setPasswordFlag] = useState<number>(2); // 找回密码标记(1: 手机号 2:邮箱)
    // 验证码
    const [code, setCode] = useState<string>("");
    // 设置当前用户
    const [currentUser, setCurrentUser] = useState<user>(store.state.currentUser);
    const [imgError, setImgError] = useState<boolean>(false);
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState<string>();

    useEffect(() => {
        getImageUrl().then();
    }, []);

    const getImageUrl = async () => {
        const result = await getRandomResource("cover");
        setImageUrl(result.data);
    }

    const checkParams = (params: DialogParamsType) => {
        /*        if(props.dialogTitle === "修改手机号" || props.dialogTitle === "绑定手机号" || (props.dialogTitle === "找回密码" && props.passwordFlag === 1)) {
                    params.flag = 1;
                    if(common.isEmpty(props.phoneNumber)) {
                        message.error("请输入手机号！")
                            .then(()=>{return false});
                    }
                    if (!/^1[345789]\d{9}$/.test(props.phoneNumber ?? "")) {
                        message.error("手机号格式有误！")
                            .then(()=>{return false});
                    }
                    params.place = props.phoneNumber
                    return true;
                } else */
        if (dialogTitle.includes("邮箱") || (dialogTitle === "找回密码" && passwordFlag === 2)) {
            params.flag = 2;
            if (common.isEmpty(props.email)) {
                message.error("请输入邮箱！")
                    .then();
                return false
            }
            if (!/^[\w.+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(props.email ?? '')) {
                message.error("邮箱格式有误！")
                    .then();
                return false
            }
            params.place = props.email;
            return true;
        }
        return false;
    }

    const checkParameters = () => {
        if (common.isEmpty(currentUser.username)) {
            message.error("请输入用户名").then();
            return false;
        }

        if (currentUser.username?.indexOf(" ") !== -1) {
            message.error("用户名不能包含空格！").then();
            return false;
        }

        return true;
    }


    useEffect(() => {
        const savedTime = sessionStorage.getItem("verify_sent_time");
        const savedPlace = sessionStorage.getItem("verify_place");

        if (savedPlace) {
            if (passwordFlag === 1) {
                setProps(prev => ({...prev, phoneNumber: savedPlace}))
            } else {
                setProps(prev => ({...prev, email: savedPlace}))
            }
        }

        if (savedTime) {
            const elapsed = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
            const remain = 60 - elapsed;

            if (remain > 0) {
                startCountDown(remain);
            }
        }
    }, []);

    const startCountDown = (duration: number) => {
        setCodeString(duration.toString());

        // 清理旧的倒计时
        if (intervalId) {
            clearInterval(intervalId);
        }

        const newIntervalId = setInterval(() => {
            setCodeString(prev => {
                if (prev === "0") {
                    clearInterval(newIntervalId);
                    return "验证码";
                } else {
                    return (parseInt(prev) - 1).toString();
                }
            })
        }, 1000)

        setIntervalId(newIntervalId);
    }

    // 获取验证码
    const fetchCode = () => {
        if (locked.current || codeString !== '验证码') {
            message.warning("请稍后重试！").then();
            return;
        }
        const params: DialogParamsType = {};
        if (!checkParams(params)) {
            return;
        }

        // 加锁
        locked.current = true;

        // 目前只有邮箱验证
        getCode({flag: params.flag, place: params.place})
            .then(() => {
                message.success("验证码已发送，请注意及时查收！").then();

                // 保存当前时间戳和邮箱
                sessionStorage.setItem('verify_sent_time', Date.now().toString());
                sessionStorage.setItem('verify_place', params.place ?? '');

                // 设置倒计时
                startCountDown(60);
            })
            .finally(() => {
                // 释放锁
                locked.current = false;
            });
    }

    const login = () => {
        if (common.isEmpty(loginParams.account) || common.isEmpty(loginParams.password)) {
            message.error("请输入账号或密码！").then();
            return;
        }

        // 发送登录请求
        handleLogin(loginParams)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    store.dispatch({type: "LOAD_CURRENT_USER", payload: result})
                    // 设置缓存
                    localStorage.setItem("userToken", result.accessToken ?? "")
                    setLoginParams({
                        account: "",
                        password: "",
                        isAdmin: false,
                    })
                    // 跳转至首页
                    navigate(-1);
                }
            })
    }

    const handleRegister = () => {
        if (common.isEmpty(props.username) || common.isEmpty(props.password)) {
            message.error("请输入用户名或密码").then();
            return;
        }

        if (dialogTitle === "邮箱验证码" && common.isEmpty(props.email)) {
            message.error("请输入邮箱").then();
            return;
        }

        if (common.isEmpty(code)) {
            message.error("请输入验证码").then();
            return;
        }

        if (props.username?.indexOf(" ") !== -1 || props.password?.indexOf(" ") !== -1) {
            message.error("用户名或密码不能包含空格！").then();
            return;
        }

        const user: user = {
            username: props.username.trim(),
            code: code.trim(), // 设置验证码
            password: props.password.trim(),
            gender: 0, // 性别先设置为私密
        }

        if (dialogTitle === "邮箱验证码") {
            user.email = props.email;
        }

        // 发送请求
        handleRegist(user)
            .then((res) => {
                const result = res.data;
                store.dispatch({type: "LOAD_CURRENT_USER", payload: result})
                // 保存用户 token
                localStorage.setItem("userToken", result.accessToken ?? "");
                // 清理表单数据
                setProps(prev => ({
                    ...prev,
                    username: "",
                    password: "",
                    code: "",
                }))
                setCode("");

                message.success("注册成功！", 300).then(() => {
                    // 跳转至主页
                    navigate('/')
                });
            })
    }

    // 打开对话框
    const openDialog = (value: string) => {
        if (value === "邮箱验证码") {
            if (common.isEmpty(props.email)) {
                message.error("请输入邮箱").then();
                return false;
            }
            if (!/^[\w.+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(props.email ?? '')) {
                message.error("邮箱格式有误！")
                    .then();
                return false;
            }
        }

        setDialogTitle(value);
        setShowDialog(true);
    }

    // 提交提示框
    const submitDialog = () => {
        if (dialogTitle === "修改头像") {
            if (common.isEmpty(props.avatar)) {
                message.error("请上传头像！").then();
                return;
            } else {
                const user: user = {
                    avatar: props.avatar?.trim()
                }

                // 发送请求
                handleUpdateUserInfo(user)
                    .then((res) => {
                        const result = res.data;
                        if (!common.isEmpty(result)) {
                            store.dispatch({type: "LOAD_CURRENT_USER", payload: result});
                            setCurrentUser(store.state.currentUser);
                            // 清理对话框
                            clearDialog();
                            message.success("修改成功").then();
                        }
                    })
            }
        } else if (dialogTitle === "修改手机号" || dialogTitle === "绑定手机号" || dialogTitle === "修改邮箱" || dialogTitle === "绑定邮箱") {
            updateAccountInfo();
        } else if (dialogTitle === "找回密码") {
            if (passwordFlag === 1 || passwordFlag === 2) {
                updateAccountInfo();
            } else {
                message.error("请选择找回方式！").then();
                return;
            }
        } else if (dialogTitle === "邮箱验证码") {
            setShowDialog(false);
        }
    }

    const submitUserInfo = () => {
        if (!checkParameters()) {
            return;
        }

        const user: user = {
            username: currentUser.username?.trim(),
            gender: currentUser.gender,
            introduction: currentUser.introduction?.trim(),
        }

        Modal.confirm({
            title: '提示',
            content: '确认保存？',
            onOk() {
                handleUpdateUserInfo(user)
                    .then((res) => {
                        const result = res.data;
                        if (!common.isEmpty(result)) {
                            store.dispatch({type: "LOAD_CURRENT_USER", payload: result})
                            setCurrentUser(store.state.currentUser);
                            message.success("修改成功！", 0.03).then(() => {
                                // 重新渲染该页面
                                window.location.reload();
                            });
                        }
                    })
            },
            onCancel() {
                message.success("已取消保存！").then();
            }
        })
    }

    const updateAccountInfo = () => {
        if (common.isEmpty(props.code)) {
            message.error("请输入验证码！").then();
            return;
        }
        if (common.isEmpty(props.password)) {
            message.error("请输入密码！").then();
            return;
        }
        const params = {
            code: props.code?.trim(),
            password: props.password?.trim()
        };

        if (!checkParams(params)) {
            return;
        }

        if (dialogTitle === "找回密码") {
            handleForgetPassword(params)
                .then(() => {
                    clearDialog();
                    message.success("修改成功，请重新登录！").then();
                })
        } else {
            handleUpdateAccountInfo(params)
                .then(() => {
                    clearDialog();
                    // 清除缓存
                    store.dispatch({type: "LOAD_CURRENT_USER", payload: {}})
                    message.success("修改成功，请重新登录！").then();
                    // 跳转至登录页面
                    navigate('/user');
                })
        }
    }

    const handleAddPicture = (avatar: string) => {
        setProps(prev => ({
            ...prev,
            avatar: avatar
        }))
        submitDialog();
    }

    const clearDialog = () => {
        setProps(prev => ({
            ...prev,
            password: "",
            phoneNumber: "",
            email: "",
            avatar: "",
            code: "",
        }))
        setShowDialog(false);
        setCode("");
        setDialogTitle("");
        setPasswordFlag(2);
    }

    // 提供鉴权表单
    const renderAuthForm = () => {
        return (
            <div className="h-screen w-full flex items-center justify-center relative">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        className="w-full h-full"
                        src={imageUrl}
                        zoomable={false}
                        draggable={false}
                        title={null} // 禁用 title
                        lazy
                    />
                </div>

                <div
                    className={`opacity-95 rounded-[10px] shadow-[0_15px_30px_miniMask,0_10px_10px_miniMask] relative overflow-hidden w-[750px] max-w-full min-h-[450px] m-2.5`}
                >
                    {/* 注册容器 */}
                    <div
                        className={`absolute w-1/2 h-full transition-all duration-500 ease-in-out ${
                            isSignUp ? "translate-x-full opacity-100 z-10" : "translate-x-0 opacity-0 -z-10"
                        }`}
                    >
                        <div className="flex flex-col justify-center items-center h-full bg-background px-5">
                            <h1 className="text-xl font-bold mb-4">注册</h1>
                            <input
                                value={props.username}
                                onChange={(e) => setProps(prev => ({...prev, username: e.target.value}))}
                                type="text"
                                maxLength={20}
                                placeholder="用户名"
                                className="bg-lightGray rounded-[2px] border-none py-3 px-4 my-2.5 w-full outline-none leading-normal"
                            />
                            <input
                                value={props.password}
                                onChange={(e) => setProps(prev => ({...prev, password: e.target.value}))}
                                type="password"
                                maxLength={50}
                                placeholder="密码"
                                className="bg-lightGray rounded-[2px] border-none py-3 px-4 my-2.5 w-full outline-none leading-normal"
                            />
                            <input
                                value={props.email}
                                onChange={(e) => setProps(prev => ({...prev, email: e.target.value}))}
                                type="email"
                                placeholder="请输入邮箱"
                                className="bg-lightGray rounded-[2px] border-none py-3 px-4 my-2.5 w-full outline-none leading-normal"
                            />
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                type="text"
                                placeholder="验证码"
                                disabled={common.isEmpty(props.email)}
                                className={`rounded-[2px] border-none py-3 px-4 my-2.5 w-full outline-none leading-normal ${common.isEmpty(props.email) ? 'cursor-not-allowed' : 'bg-lightGray'}`}
                            />
                            <a className="text-fontColor text-sm no-underline m-0 hover:text-themeBackground" href="#"
                               onClick={() => openDialog("邮箱验证码")}>
                                获取验证码
                            </a>
                            <button
                                onClick={handleRegister}
                                className="rounded-full border-none bg-red-400 text-white text-base font-bold py-3 px-11 tracking-wider cursor-pointer mt-4 hover:animate-scale"
                            >
                                注册
                            </button>
                        </div>
                    </div>

                    {/* 登录容器 */}
                    <div
                        className={`absolute left-0 w-1/2 h-full transition-all duration-500 ease-in-out ${
                            isSignUp ? "translate-y-full -z-10" : "z-10"
                        }`}
                    >
                        <div className="flex flex-col justify-center items-center h-full bg-background px-5">
                            <h1 className="text-xl font-bold mb-4">登录</h1>
                            <input
                                value={loginParams.account}
                                onChange={(e) => setLoginParams(prev => ({...prev, account: e.target.value}))}
                                type="text"
                                placeholder="用户名/邮箱"
                                className="bg-gray-100 rounded-[2px] border-none py-3 px-4 my-2.5 w-full outline-none leading-normal"
                            />
                            <input
                                value={loginParams.password}
                                onChange={(e) => setLoginParams(prev => ({...prev, password: e.target.value}))}
                                type="password"
                                placeholder="密码"
                                className="bg-gray-100 rounded-[2px] border-none py-3 px-4 my-2.5 w-full outline-none leading-normal"
                            />
                            <a className=" text-sm no-underline ml-3 my-4 hover:text-themeBackground" href="#"
                               onClick={() => openDialog("找回密码")}>
                                忘记密码？
                            </a>
                            <button
                                onClick={login}
                                className="rounded-full border-none bg-red-400 text-white text-base font-bold py-3 px-11 tracking-wider cursor-pointer hover:animate-scale"
                            >
                                登录
                            </button>
                        </div>
                    </div>

                    {/* 覆盖容器 */}
                    <div
                        className={`absolute left-1/2 w-1/2 h-full overflow-hidden transition-all duration-500 ease-in-out z-20 ${
                            isSignUp ? "-translate-x-full" : ""
                        }`}
                    >
                        <div
                            className={`bg-gradient-to-r from-red-400 to-red-500 text-white relative left-[-100%] h-full w-[200%] transition-all duration-500 ease-in-out ${
                                isSignUp ? "translate-x-1/2" : ""
                            }`}
                        >
                            {/* 左侧覆盖面板 */}
                            <div
                                className={`absolute top-0 flex flex-col justify-center items-center h-full w-1/2 transition-all duration-500 ease-in-out ${
                                    isSignUp ? "translate-y-0" : "-translate-y-[50%]"
                                }`}
                            >
                                <h1 className="text-xl font-bold">已有帐号？</h1>
                                <p className="text-sm tracking-wider my-5 mx-0">请登录🚀</p>
                                <button
                                    className="rounded-full bg-transparent border border-white text-white text-base font-bold py-3 px-11 tracking-wider cursor-pointer hover:animate-scale"
                                    onClick={() => setIsSignUp(false)}
                                >
                                    前往登录
                                </button>
                            </div>

                            {/* 右侧覆盖面板 */}
                            <div
                                className={`absolute right-0 top-0 flex flex-col justify-center items-center h-full w-1/2 transition-all duration-500 ease-in-out ${
                                    isSignUp ? "translate-y-[20%]" : "translate-y-0"
                                }`}
                            >
                                <h1 className="text-xl font-bold">没有帐号？</h1>
                                <p className="text-sm tracking-wider my-5 mx-0">立即注册</p>
                                <button
                                    className="rounded-full bg-transparent border border-white text-white text-base font-bold py-3 px-11 tracking-wider cursor-pointer hover:animate-scale"
                                    onClick={() => setIsSignUp(true)}
                                >
                                    注册
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUserInfo = () => {
        if (common.isEmpty(currentUser)) {
            return null;
        }

        return (
            <div className="h-screen w-full flex items-center justify-center relative animate-hideToShow">
                {/* 背景图片 */}
                <div className="absolute inset-0">
                    {!imgError ? (
                        <Image
                            className=""
                            src={imageUrl}
                            zoomable={false}
                            draggable={false}
                            lazy={true}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div slot="error" className="w-full h-full"></div>
                    )}
                </div>

                <div
                    className="shadow-box-mini rounded-[10px] overflow-hidden bg-white bg-opacity-80 w-4/5 z-10 mt-[70px] h-[calc(100vh-90px)] mb-5 flex flex-col md:flex-row">
                    <div
                        className="h-3/5 md:h-full w-full md:w-1/2 bg-maxMaxWhiteMask flex flex-col items-center overflow-y-auto p-5 max-md:pt-1 overscroll-y-auto scrollbar-none">
                        <div>
                            <Avatar
                                size={60}
                                src={currentUser.avatar}
                                icon={<UserOutlined/>}
                                onClick={() => openDialog('修改头像')}
                                className="cursor-pointer select-none transition-all duration-500 hover:rotate-[360deg]"
                            />
                        </div>
                        <div className="flex justify-center items-center mt-3 text-xs">
                            <div className="text-right">
                                <div className="h-14 text-center leading-[55px]">用户名：</div>
                                {/*<div className="h-14 text-center leading-[55px]">手机号：</div>*/}
                                <div className="h-14 text-center leading-[55px]">邮箱：</div>
                                <div className="h-14 text-center leading-[55px]">性别：</div>
                                <div className="h-14 text-center leading-[55px]">简介：</div>
                            </div>
                            <div className="text-left">
                                <div className="h-14 flex items-center">
                                    <Input
                                        maxLength={20}
                                        value={currentUser.username}
                                        onChange={e => setCurrentUser(prev => ({...prev, username: e.target.value}))}
                                        className="bg-maxLightGray border-none text-sm"
                                    />
                                </div>
                                {/*                                <div className="h-14 flex items-center">
                                    {currentUser.phoneNumber ? (
                                        <div>
                                            {currentUser.phoneNumber}
                                            <span
                                                className="text-white text-xs cursor-pointer bg-themeBackground px-1 py-[1px] rounded-[0.2rem] ml-2"
                                                onClick={() => openDialog('修改手机号')}
                                            >
                        修改
                      </span>
                                        </div>
                                    ) : (
                                        <div>
                      <span
                          className="text-white text-xs cursor-pointer bg-themeBackground px-1 py-[1px] rounded-[0.2rem] ml-2"
                          onClick={() => openDialog('绑定手机号')}
                      >
                        绑定手机号
                      </span>
                                        </div>
                                    )}
                                </div>*/}
                                <div className="h-14 flex items-center">
                                    {currentUser.email ? (
                                        <div>
                                            {currentUser.email}
                                            <span
                                                className="text-white text-xs cursor-pointer bg-themeBackground px-1 py-[1px] rounded-[0.2rem] ml-2"
                                                onClick={() => openDialog('修改邮箱')}
                                            >
                        修改
                      </span>
                                        </div>
                                    ) : (
                                        <div>
                      <span
                          className="text-white text-xs cursor-pointer bg-themeBackground px-1 py-[1px] rounded-[0.2rem] ml-2"
                          onClick={() => openDialog('绑定邮箱')}
                      >
                        绑定邮箱
                      </span>
                                        </div>
                                    )}
                                </div>
                                <div className="h-14 flex items-center justify-center text-center">
                                    <Radio.Group
                                        value={currentUser.gender}
                                        onChange={e => setCurrentUser(prev => ({...prev, gender: e.target.value}))}
                                    >
                                        <Radio value={0}
                                               className="mr-2  font-custom text-sm justify-center text-center">秘密</Radio>
                                        <Radio value={1}
                                               className="mr-2  font-custom text-sm justify-center text-center">男</Radio>
                                        <Radio value={2}
                                               className=" font-custom text-sm justify-center text-center">女</Radio>
                                    </Radio.Group>
                                </div>
                                <div className="h-14 flex items-center">
                                    <Input.TextArea
                                        value={currentUser.introduction}
                                        onChange={e => setCurrentUser(prev => ({
                                            ...prev,
                                            introduction: e.target.value
                                        }))}
                                        maxLength={60}
                                        showCount // 显示字数
                                        autoFocus
                                        style={{resize: 'none'}} // 禁止拖拽
                                        className="bg-maxLightGray border-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-5">
                            <ProButton
                                info="提交"
                                onClick={submitUserInfo}
                                before={constant.before_color_2}
                                after={constant.after_color_2}
                            />
                        </div>
                    </div>
                    <div
                        className="w-full h-2/5 md:h-full my-auto mx-auto items-center justify-center md:w-1/2 bg-maxWhiteMask">
                        <TwoPoem isHitokoto className="md:min-h-screen"/>
                    </div>
                </div>
            </div>
        )
    }

    const renderDialogContent = () => {
        if (dialogTitle === "修改手机号" || dialogTitle === "绑定手机号") {
            return (
                <div className="my-3 space-y-3">
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">手机号</span>
                        <Input value={props.phoneNumber}
                               className="flex-1"
                               onChange={e => setProps(prev => ({...prev, phoneNumber: e.target.value}))}/>
                    </div>

                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">验证码</span>
                        <Input value={code}
                               className="flex-1"
                               onChange={e => setCode(e.target.value)}/>
                    </div>
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">密码</span>
                        <Input.Password value={props.password}
                                        className="flex-1"
                                        onChange={e => setProps(prev => ({...prev, password: e.target.value}))}/>
                    </div>
                </div>
            );
        } else if (dialogTitle === "修改邮箱" || dialogTitle === "绑定邮箱") {
            return (
                <div className="my-3 space-y-3">
                    {/* 邮箱 */}
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">邮箱</span>
                        <Input
                            className="flex-1"
                            value={props.email}
                            onChange={e => setProps(prev => ({...prev, email: e.target.value}))}
                        />
                    </div>

                    {/* 验证码 */}
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">验证码</span>
                        <Input
                            className="flex-1"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                        />
                    </div>

                    {/* 密码 */}
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">密码</span>
                        <Input.Password
                            className="flex-1"
                            value={props.password}
                            onChange={e => setProps(prev => ({...prev, password: e.target.value}))}
                        />
                    </div>
                </div>
            );
        } else if (dialogTitle === "修改头像") {
            return <FileUpload prefix="userAvatar" onUpload={handleAddPicture} maxSize={1} maxNumber={1}/>;
        } else if (dialogTitle === "找回密码") {
            return (
                <div className="my-3 space-y-3">
                    <div className="flex justify-center items-center mb-5">
                        <Radio.Group value={passwordFlag} onChange={e => setPasswordFlag(e.target.value)}>
                            {/*<Radio value={1} className="mr-[10px]">手机号</Radio>*/}
                            <Radio value={2}>邮箱</Radio>
                        </Radio.Group>
                    </div>
                    {passwordFlag === 1 ? (
                        <>
                            <div className="flex items-center">
                                <span className="w-16 text-right mr-3">手机号</span>
                                <Input value={props.phoneNumber}
                                       className="flex-1"
                                       onChange={e => setProps(prev => ({...prev, phoneNumber: e.target.value}))}/>
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-right mr-3">验证码</span>
                                <Input className="flex-1" value={code} onChange={e => setCode(e.target.value)}/>
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-right mr-3">新密码</span>
                                <Input.Password maxLength={50} value={props.password} className="flex-1"
                                                onChange={e => setProps(prev => ({
                                                    ...prev,
                                                    password: e.target.value
                                                }))}/>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center">
                                <span className="w-16 text-right mr-3">邮箱</span>
                                <Input value={props.email}
                                       onChange={e => setProps(prev => ({...prev, email: e.target.value}))}/>
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-right mr-3">验证码</span>
                                <Input value={code} onChange={e => setCode(e.target.value)}/>
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-right mr-3">新密码</span>
                                <Input.Password maxLength={30} value={props.password}
                                                onChange={e => setProps(prev => ({
                                                    ...prev,
                                                    password: e.target.value
                                                }))}/>
                            </div>
                        </>
                    )}
                </div>
            );
        } else if (dialogTitle === "邮箱验证码") {
            return (
                <div className="my-3 space-y-3">
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">邮箱</span>
                        <Input value={props.email}
                               className="flex-1"
                               onChange={e => setProps(prev => ({...prev, email: e.target.value}))}/>
                    </div>
                    <div className="flex items-center">
                        <span className="w-16 text-right mr-3">验证码</span>
                        <Input value={code} className="flex-1" onChange={e => setCode(e.target.value)}/>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="select-none font-custom">
            {/* 登录注册表单或用户配置文件 */}
            {common.isEmpty(currentUser) && renderAuthForm() || renderUserInfo()}

            {/* 对话框模态 */}
            <Modal
                title={
                    <span className="font-comic text-[20px] sm:text-[24px]">{dialogTitle}</span>
                }
                open={showDialog}
                onCancel={clearDialog}
                width="100%"
                footer={null}
                style={{textAlign: "center"}}
                centered
                className="max-w-[95vw] sm:max-w-[500px]"
                maskClosable={false}
            >
                <div className="flex flex-col justify-center items-center">
                    {renderDialogContent()}

                    {dialogTitle !== "修改头像" && (
                        <div className="flex mt-6">
                            {(dialogTitle === "修改手机号" || dialogTitle === "绑定手机号" || dialogTitle === "修改邮箱" || dialogTitle === "绑定邮箱" || dialogTitle === "找回密码" || dialogTitle === "邮箱验证码") && (
                                <ProButton
                                    info={codeString}
                                    onClick={fetchCode}
                                    before={constant.before_color_1}
                                    after={constant.after_color_1}
                                    className="mr-5"
                                />
                            )}
                            <ProButton
                                info="提交"
                                onClick={submitDialog}
                                before={constant.before_color_2}
                                after={constant.after_color_2}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default User;
