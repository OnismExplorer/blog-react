import React, {useEffect, useRef, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {CircleXIcon} from "lucide-react";
import {Avatar,MenuProps as AntMenuProps, Dropdown, message} from "antd";
import {Outlet, useNavigate} from "react-router-dom";
import {useStore} from "@hooks/useStore";
import {LoginOutlined, LogoutOutlined, MenuOutlined, UserOutlined} from "@ant-design/icons";
import {Menu, MenuProps} from "@components/common/menu";
import Drawer from "@components/common/drawer";
import ToggleTheme from "@components/common/toggleTheme";
import {handleLogout} from "@api/user";
import {getSortInfo} from "@api/webInfo";
import {getWebInfo} from "@api/webInfo";
import avatar from '@assets/img/onism.jpg'

const Home: React.FC = () => {

    const {common} = useAppContext();
    const store = useStore();
    const [toolButton, setToolButton] = useState(false)
    const [scrollTop, setScrollTop] = useState(0)
    const [toolbarDrawer, setToolbarDrawer] = useState(false)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const navigate = useNavigate();
    const oldScrollTopRef = useRef(0); // 记录上一次滚动位置
    const cdTopRef = useRef<HTMLDivElement | null>(null); // 用于控制 cd-top 按钮位置
    const [isHiding, setIsHiding] = useState<boolean>(false);

    // 头部标签
    const headerItems: MenuProps['items'] = [
        {key: "/", icon:'🏡', label: '首页',},
        {key: "/love", icon:'🧡', label: '告白墙',},
        {key: "/travel", icon:'🌏', label: '旅拍',},
        {key: "/favorite", icon:'🧰', label: '百宝箱',},
        {key: "/funny", icon:'🎹', label: '音乐',},
        {key: "/message", icon:'📪', label: '留言',},
        {key: "/friend", icon:'🎎', label: '友链',},
        {key: "/about", icon:'🎈', label: '关于',},
    ]

    //用户下拉菜单
    const userMenuItems: MenuProps['items'] = !common.isEmpty(store.state.currentUser)
        ? [
            {
                key: 'profile',
                icon: <UserOutlined size={45}/>,
                label: (<span>个人中心</span>),
            },
            {
                key: 'logout',
                icon: <LogoutOutlined size={45}/>,
                label: (<span className='text-red-500'>退出</span>),
            },
        ]
        : [
            {
                key: 'login',
                icon: <LoginOutlined size={45}/>,
                label: (<span className='hover:text-blue-500'>登录</span>),
            },
        ];

    // 回到顶部
    const backTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // 顺滑的方式
        })

        setIsHiding(true); // 触发动画

        // 动画时间结束后重置状态
        setTimeout(() => {
            setToolButton(false);
            setIsHiding(false);
        }, 500); // 500ms = 动画持续时间
    }

    // 处理桌面端跳转
    const handleNavigation = (path: string) => {
        navigate(path)
    }

    // 处理移动端菜单跳转
    const handleSmallMenu = (path: string) => {
        navigate(path);
        setToolbarDrawer(false);
    }

    // 用户登出
    const logout = () => {
        handleLogout(false)
            .then(() => {
                message.success("已退出登录！").then();
            })

        // 清除缓存
        store.dispatch({type: 'LOAD_CURRENT_USER', payload: {}})
        localStorage.removeItem('userToken');
        // 跳转回首页
        handleNavigation('/');
    }

    // 处理移动端用户登出
    const handleSmallMenuLogout = () => {
        logout();
        setToolbarDrawer(false);
    }

    // 处理移动端菜单点击事件
    const handleMobileMenuClick: MenuProps['onClick'] = ({key}) => {
        // 关闭侧边栏
        setToolbarDrawer(false);
        if (key === 'logout') {
            handleSmallMenuLogout();
        } else {
            handleNavigation('/user')
        }
    }

    // 处理菜单点击事件
    const handleMenuClick:AntMenuProps['onClick'] = ({key}) => {
        if (key === 'logout') {
            handleSmallMenuLogout();
        } else {
            handleNavigation('/user')
        }
    }

    const handleResize = () => {
        const docWidth = document.body.clientWidth
        setIsMobile(docWidth < 1100)
    }

    useEffect(() => {
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // 监听 scroll，实时更新 scrollTop
    useEffect(() => {
        const handleScroll = () => {
            setScrollTop(document.documentElement.scrollTop || document.body.scrollTop);
        };
        window.addEventListener("scroll", handleScroll);

        const toolbarStatus = {
            enter: false,
            visible: true,
        }

        store.dispatch({type: 'CHANGE_TOOLBAR_STATUS', payload: toolbarStatus});

        // 获取数据
        fetchWebInfo();
        fetchSortInfo();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []); // 第一次加载

    // 处理滚动条
    useEffect(() => {
        const oldScrollTop = oldScrollTopRef.current;
        const scrollDifference = scrollTop - oldScrollTop;

        // 增加阈值避免抖动
        const SCROLL_THRESHOLD = 8;
        const ENTER_THRESHOLD = window.innerHeight / 4;

        const enter = scrollTop > ENTER_THRESHOLD;
        const isShow = scrollTop > window.innerHeight + 30;

        // 简化的显示逻辑
        let visible: boolean; // 默认显示

        if (scrollTop > ENTER_THRESHOLD && scrollDifference > SCROLL_THRESHOLD) {
            // 向下滚动超过阈值时隐藏
            visible = false;
        } else if (scrollDifference < -SCROLL_THRESHOLD || scrollTop <= ENTER_THRESHOLD) {
            // 向上滚动或接近顶部时显示
            visible = true;
        } else {
            // 保持当前状态，避免频繁切换
            visible = store.state.toolbar.visible;
        }

        // 回到顶部按钮逻辑保持不变
        if (scrollTop <= 0 && toolButton && !isHiding) {
            setIsHiding(true);
            setTimeout(() => {
                setToolButton(false);
                setIsHiding(false);
            }, 500);
        } else if (isShow && !isHiding) {
            setToolButton(true);
        }

        if (cdTopRef.current && !common.mobile() && !isMobile) {
            if (isShow) {
                const newTop = window.innerHeight > 950 ? 0 : window.innerHeight - 950;
                cdTopRef.current.style.top = `${newTop}px`;
            } else {
                cdTopRef.current.style.top = "-900px";
            }
        }

        // 提交状态更新
        store.dispatch({type: "CHANGE_TOOLBAR_STATUS", payload: {enter, visible}});

        // 更新旧值
        oldScrollTopRef.current = scrollTop;
    }, [isMobile, scrollTop, toolButton, isHiding]);

    // 获取数据
    const fetchSortInfo = () => {
        // 加载分类列表数据
        getSortInfo()
            .then(res => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    // 将数据注入
                    store.dispatch({type: 'LOAD_SORT_INFO', payload: result});
                }
            })
            .catch(err => {
                console.error('加载分类列表失败：', err);
            });
    }

    const fetchWebInfo = () => {
        // 加载网站信息数据
        getWebInfo()
            .then((res) => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    // 注入数据
                    store.dispatch({type: 'LOAD_WEB_INFO', payload: result});
                }
            })
            .catch(err => {
                console.error('加载网站信息失败：', err.message);
            })
    }

    return (
        <div className='select-none font-custom'>

            {/*导航栏*/}
            <div
                className={`
          fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 lg:px-8
          transition-all duration-300 ease-in-out select-none
          ${store.state.toolbar.visible ? "translate-y-0" : "-translate-y-full"}
          ${
                    !store.state.toolbar.enter && !common.mobile()
                        ? "bg-black/35 text-gray-900 dark:bg-gray-900/95 dark:text-white"
                        :  store.state.toolbar.enter
                            ? "backdrop-blur-sm text-black bg-white"
                            : "bg-black/25 "
                }
        `}
            >
                {/*网站标题*/}
                <div className="flex-shrink-0">
                    <h2
                        className={`my-auto text-xl font-bold transition-colors font-custom ${!store.state.toolbar.enter  ? 'text-white hover:text-blue-500' : 'text-black hover:text-themeBackground'}`}
                        onClick={() => handleNavigation("/")}
                    >
                        {store.state.webInfo.webName}
                    </h2>
                </div>

                {/*手机导航按钮*/}
                {isMobile || common.mobile() ? (
                    <>
                        <MenuOutlined
                            onClick={() => setToolbarDrawer(true)}
                            className={`transition-colors ${!store.state.toolbar.enter  ? 'text-white hover:text-blue-500' : 'text-black hover:text-themeBackground'}`}
                            size={50}
                        />
                        <Drawer
                            title={<span className={'w-full text-center text-base text-white font-bold font-custom'}>欢迎光临</span>}
                            placement="left"
                            maskClosable
                            closeIcon={<CircleXIcon className='text-black'/>}
                            visible={toolbarDrawer}
                            width={'60%'}
                            maskClassName='bg-[rgba(0,0,0,0.5)]'
                            drawerClassName='bg-toolbar bg-no-repeat bg-cover'
                            onClose={() => setToolbarDrawer(false)}
                        >
                            <Menu
                                mode="vertical"
                                items={headerItems}
                                labelClassName={`flex items-center gap-3 text-base text-gray-700 hover:text-themeBackground`}
                                className='items-center font-custom justify-center'
                                onClick={(item) => handleSmallMenu(item.key)}
                            />
                            <Menu
                                mode="vertical"
                                styles={{marginTop: 20}}
                                items={userMenuItems}
                                onClick={handleMobileMenuClick}
                                labelClassName={`flex items-center gap-3 text-base text-gray-700 hover:text-themeBackground`}
                                className='items-center font-custom justify-center'
                            />
                        </Drawer>
                    </>
                ) : (
                    <div className='flex items-center justify-center'>
                        <Menu
                            mode="horizontal"
                            items={headerItems}
                            defaultSelectedKeys={[location.pathname]}
                            onClick={(item) => handleNavigation(item.key)}
                            styles={{
                                flex: 1,
                                background: 'transparent',
                            }}
                            underlinable // 启用下划线
                            labelClassName={`flex items-center gap-3 text-base hover:text-themeBackground ${!store.state.toolbar.enter? 'text-white' : 'text-black font-bold'}`}
                        />
                        <Dropdown
                            className='mx-2 hover:text-themeBackground'
                            placement='bottom'
                            trigger={['hover']}
                            menu={{
                                items: userMenuItems as AntMenuProps['items'],
                                onClick: handleMenuClick
                            }}
                        >
                            <Avatar
                                className='transition-all duration-500 hover:rotate-[360deg]'
                                size={45}
                                src={common.isEmpty(store.state.currentUser) && common.isEmpty(store.state.currentUser.avatar) ? avatar : store.state.currentUser.avatar}
                                icon={<UserOutlined/>}
                            />
                        </Dropdown>
                    </div>
                )}
            </div>

            {/*主体内容区域*/}
            <div id="main-container" className='select-text'>
                {/* Outlet 是路由组件的占位符，渲染当前匹配到的子路由 */}
                <Outlet/>
            </div>

            {/*回到顶部按钮：桌面端*/}
            {(!common.mobile() || isMobile) && toolButton && (
                <div
                    ref={cdTopRef}
                    style={{
                        zIndex: 1000,
                        transition: "top 0.5s ease-in-out, transform 0.5s ease-in-out",
                        transform: isHiding ? "translateY(-100%)" : "translateY(0)",
                    }}
                    onClick={backTop}
                    className='fixed bg-toTop bg-no-repeat bg-center w-[70px] h-[880px] bg-contain right-[5vh] top-[-900px]'
                />
            )}
            <div
                className='fixed right-[3vh] bottom-[3vh] animate-slide-bottom z-[100] cursor-pointer text-lg flex flex-col items-end w-[60px]'>
                {(common.mobile() || isMobile) && toolButton && (
                    <div
                        className='bottom-[38px] left-[2px] relative transition-all duration-300 ease-in hover:top-[-15px] animate-hideToShow hover:animate-showToHide'
                        style={{
                            transition: "top 0.5s ease-in-out, transform 0.5s ease-in-out",
                            transform: isHiding ? "translateY(-100%)" : "translateY(0)",
                        }}
                        onClick={backTop}
                    >
                        {/*回到顶部按钮：移动端*/}
                        <svg viewBox="0 0 1024 1024" width="50" height="50">
                            <path
                                d="M696.741825 447.714002c2.717387-214.485615-173.757803-312.227566-187.33574-320.371729-10.857551 5.430775-190.050127 103.168727-187.33274 320.371729-35.297037 24.435488-73.306463 65.1623-67.875688 135.752376 5.430775 70.589076 76.018851 119.460051 103.168726 116.745664 27.152875-2.716387 19.004713-21.7221 19.004713-21.7221l8.148162-38.011425s40.721814 59.732525 51.583363 59.732525h146.609927c13.574938 0 51.585363-59.732525 51.585363-59.732525l8.147162 38.011425s-8.147162 19.005713 19.004713 21.7221c27.148876 2.714388 97.738951-46.156588 103.168727-116.745664s-32.57965-111.316888-67.876688-135.752376z m-187.33574-2.713388c-5.426776 0-70.589076-2.717387-78.733239-78.737238 2.713388-73.306463 73.306463-78.733239 78.733239-81.450626 5.430775 0 76.02385 8.144163 78.736238 81.450626-8.143163 76.019851-73.305463 78.737238-78.736238 78.737238z m0 0"
                                fill="#000000"></path>
                            <path
                                d="M423.602441 746.060699c6.47054-6.297579 12.823107-7.017417 21.629121-2.784372 34.520213 16.582259 70.232157 19.645568 107.031855 9.116944 8.118169-2.323476 15.974396-5.475765 23.598677-9.22392 13.712907-6.73648 26.003134 0.8878 26.080116 16.13936 0.109975 22.574907-0.024994 45.142816 0.080982 67.709725 0.031993 7.464316-2.277486 13.322995-9.44387 16.608254-7.277358 3.333248-13.765895 1.961558-19.526595-3.264264-3.653176-3.313253-7.063407-6.897444-10.634601-10.304675-6.563519-6.259588-6.676494-6.25259-10.625603 1.603638-8.437097 16.80121-16.821205 33.623415-25.257302 50.423625-2.489438 4.953882-5.706713 9.196925-11.411426 10.775569-8.355115 2.315478-15.772442-1.070758-20.272427-9.867774-8.774021-17.15313-17.269104-34.453228-25.918153-51.669344-3.750154-7.469315-3.9891-7.479313-10.141712-1.514658-3.715162 3.602187-7.31435 7.326347-11.142486 10.800563-5.571743 5.060858-11.934308 6.269586-18.936728 3.207277-6.82746-2.984327-9.869774-8.483086-9.892769-15.685462-0.070984-23.506697-0.041991-47.018393-0.020995-70.532089 0.007998-4.679944 1.46467-8.785018 4.803916-11.538397z"
                                fill="#000000"></path>
                        </svg>
                    </div>
                )}

                {/*切换暗黑/正常模式按钮*/}
                <ToggleTheme />
            </div>
        </div>
    )
}

export default Home;
