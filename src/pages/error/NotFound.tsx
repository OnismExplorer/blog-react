import React from 'react';
import {useNavigate} from "react-router-dom";
import logoTransparent from '@assets/svg/logo/logo-transparent.svg'
import rocket from "@assets/svg/rocket.svg";
import earth from "@assets/svg/earth.svg";
import moon from "@assets/svg/moon.svg";
import astronaut from "@assets/svg/astronaut.svg";

/**
 * 404 Not Found 页面
 */
const NotFoundPage: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div
            className="relative font-custom h-screen overflow-hidden font-dosis select-none bg-bgPuple bg-repeat-x bg-cover bg-left-top">
            <div className="w-full h-full bg-overlayStars bg-repeat bg-contain bg-left-top relative">

                {/* Navbar */}
                <header className="flex  items-center justify-between pt-4 px-6">
                    {/*logo*/}
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logoTransparent} width={110} alt="Logo"/>
                    </div>
                    <nav
                        className="hidden md:flex cursor-pointer uppercase tracking-wider text-white text-sm font-bold">
                        <ul className="flex items-center">
                            <li className="px-4">
                                <a onClick={() => navigate('/')} target="_blank"
                                   className="hover:text-yellow-400 transition duration-300">首页</a>
                            </li>
                            <li className="px-4">
                                <a onClick={() => navigate('/about')} rel="noopener noreferrer"
                                   className="hover:text-yellow-400 transition duration-300">关于</a>
                            </li>
                            <li className="px-4">
                                <a onClick={() => navigate('/message')} rel="noopener noreferrer"
                                   className="hover:text-yellow-400 transition duration-300">留言</a>
                            </li>
                            <li className="px-4">
                                <a onClick={() => navigate('/')} rel="noopener noreferrer"
                                   className="py-2 px-6 border border-yellow-400 rounded-full font-medium hover:bg-yellow-400 hover:text-white transform hover:scale-105 shadow hover:shadow-lg transition duration-300">返回首页</a>
                            </li>
                        </ul>
                    </nav>
                </header>

                {/*中心部分*/}
                <div
                    className="flex flex-col font-bold items-center pt-[120px] px-5 text-center z-10 relative space-y-3">
                    <div className='text-[200px] text-white font-bold'>404</div>
                    <div className='text-[20px] text-white  pointer-events-none '>星图上没有标注这里</div>
                    <div className='text-[20px] text-white  pointer-events-none '>宇航小分队正在搜寻这块太空碎片</div>
                    <div className='text-[20px] text-white  pointer-events-none '>也许下一站会有更多奇遇...</div>
                    <div onClick={() => navigate(-1)}
                         className="cursor-pointer mt-10 py-3 px-4 border border-yellow-400 rounded-full font-medium text-sm text-white text-center hover:bg-themeBackground hover:text-white transform hover:scale-105 shadow hover:shadow-lg transition duration-300">返回上一页
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none">
                    {/* 火箭 */}
                    <img
                        src={rocket}
                        width={40}
                        alt="火箭"
                        className="absolute animate-rocket-movement top-3/4 left-[calc(20%-20px)]"
                    />

                    {/* 月亮和地球 */}
                    <div className="absolute" style={{top: '20%', left: '15%', zIndex: 90}}>
                        <img
                            src={earth}
                            width={100}
                            alt="地球"
                            className="animate-spin-earth hover:spin-earth-on-hover"
                        />
                    </div>
                    <img
                        src={moon}
                        width={80}
                        alt="月亮"
                        className="absolute"
                        style={{top: '12%', left: '25%'}}
                    />

                    {/* 宇航员 */}
                    <div className="absolute animate-move-astronaut top-[60%] right-[10%] will-change-transform">
                        <img
                            src={astronaut}
                            width={140}
                            alt="宇航员"
                            className="pointer-events-none animate-rotate-astronaut"
                        />
                    </div>
                </div>

                {/*星星 */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute bg-white rounded-full w-1 h-1 opacity-30" style={{
                        top: '80%',
                        left: '25%',
                        animation: 'glow-star 2s infinite ease-in-out alternate 1s'
                    }}/>
                    <div className="absolute bg-white rounded-full w-1 h-1 opacity-30" style={{
                        top: '20%',
                        left: '40%',
                        animation: 'glow-star 2s infinite ease-in-out alternate 3s'
                    }}/>
                    <div className="absolute bg-white rounded-full w-1 h-1 opacity-30" style={{
                        top: '25%',
                        left: '25%',
                        animation: 'glow-star 2s infinite ease-in-out alternate 5s'
                    }}/>
                    <div className="absolute bg-white rounded-full w-1 h-1 opacity-30" style={{
                        top: '75%',
                        left: '80%',
                        animation: 'glow-star 2s infinite ease-in-out alternate 7s'
                    }}/>
                    <div className="absolute bg-white rounded-full w-1 h-1 opacity-30" style={{
                        top: '90%',
                        left: '50%',
                        animation: 'glow-star 2s infinite ease-in-out alternate 9s'
                    }}/>
                </div>

            </div>
        </div>
    );
};

export default NotFoundPage;
