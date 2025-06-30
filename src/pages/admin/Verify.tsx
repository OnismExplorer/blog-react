import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAppContext} from "@hooks/useAppContext";
import {Avatar, message} from "antd";
import {useStore} from "@hooks/useStore";
import ProButton from "@components/common/proButton";
import Loading from "@components/common/loading";
import {ApiError} from "@error/ApiError";
import {handleLogin, handleVerify} from "@api/user";
import {LoginParams} from "@type/user";

const Verify: React.FC = () => {

    const [searchParams] = useSearchParams();
    const {common, constant} = useAppContext();
    const redirect = searchParams.get('redirect') || '/admin';
    const store = useStore();
    const [account, setAccount] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    // 跳转
    const navigate = useNavigate();

    // tokenState：null 表示“还没验证”；true 表示“校验通过”；false 表示“无 token 或校验失败”
    const [tokenState, setTokenState] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            // 本地没 token，一定让用户填写表单登录
            setTokenState(false);
            return;
        }

        // 本地有 token，需要去后端验证
        (async () => {
            try {
                await handleVerify();
                // 验证通过，直接跳转到 redirectTo
                setTokenState(true);
                navigate(redirect, {replace: true});
            } catch (err) {
                message.error(err instanceof ApiError ? err.message : '非法操作');
                // 验证失败，删掉假 token，留在登录表单
                localStorage.removeItem('adminToken');
                localStorage.removeItem('currentAdmin');
                setTokenState(false);
            }
        })();
    }, [navigate, redirect]);

    // 如果正在校验阶段，直接返回空或者一个 Loading
    if (tokenState === null) {
        return <Loading/>;
    }


    const login = () => {
        if (common.isEmpty(account) || common.isEmpty(password)) {
            message.error("请输入账号或密码！").then();
            return;
        }

        // 封装参数
        const params: LoginParams = {
            account: account,
            password: password,
            isAdmin: true
        }

        // 发送请求
        handleLogin(params)
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    // 设置缓存
                    localStorage.setItem('adminToken', result.accessToken ?? '');
                    store.dispatch({type: 'LOAD_CURRENT_ADMIN', payload: result});
                    setAccount('');
                    setPassword('');
                    navigate(redirect);
                }
            })
    }

    return (
        <div
            className='flex justify-center items-center select-none h-screen bg-verifyImage bg-center bg-cover bg-repeat font-custom'>
            <div className='bg-maxWhiteMask pt-[30px] px-10 pb-[5px] relative rounded-md max-md:px-6'>
                <div className='absolute left-1/2 -translate-y-[10%] -translate-x-1/2 top-[-25px]'>
                    <Avatar size={60} src={store.state.webInfo.avatar}/>
                </div>

                {/*账号输入框*/}
                <div
                    className='my-[25px] flex items-center border border-gray-300 rounded-md mx-auto max-md:max-w-[270px]'>
                    <span className='px-3 text-gray-600'>账号</span>
                    <input type='text'
                           value={account}
                           onChange={(e) => setAccount(e.target.value)}
                           placeholder='请输入账号'
                           className='outline-none flex-1 p-2 border border-l-gray-300 rounded-r-md max-md:w-52'
                    />
                </div>

                {/*密码输入框*/}
                <div className="my-[25px]  flex items-center border border-gray-300 rounded-md max-md:max-w-[270px]">
                    <span className="px-3 text-gray-600">密码</span>
                    <input type='password'
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder='请输入密码'
                           className='outline-none flex-1 p-2 border border-l-gray-300 rounded-r-md max-md:w-52'
                    />
                </div>

                {/*提交按钮*/}
                <div className='my-[25px] items-center '>
                    <ProButton info='提交' onClick={login} before={constant.before_color_2}
                               after={constant.after_color_2}
                               className='mx-auto'
                    />
                </div>
            </div>
        </div>
    );
}

export default Verify;
