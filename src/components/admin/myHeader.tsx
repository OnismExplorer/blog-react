import React from 'react';
import {Avatar, Dropdown, message} from 'antd';
import {useNavigate} from 'react-router-dom';
import {UserOutlined} from '@ant-design/icons';
import {handleLogout} from "@api/user";
import {useStore} from "@hooks/useStore";
import {Menu, MenuItem} from "@components/common/menu";

const MyHeader: React.FC = () => {
    const navigate = useNavigate();

    const store = useStore();

    const logout = () => {
        handleLogout(true)
            .then(() => {
                message.success("已退出登录").then();
            })
            .finally(() => {
                localStorage.removeItem("adminToken");
                store.dispatch({type: 'LOAD_CURRENT_ADMIN', payload: {}})
                window.location.replace("/");
            })
    };

    return (
        <div className="select-none font-custom flex justify-between text-fontColor items-center bg-sideBarBackground h-[70px] px-[50px]">
            <div onClick={() => navigate('/admin/welcome')} className="cursor-pointer text-fontColor ml-[17px] text-[22px] leading-[70px] hover:text-themeBackground">后台管理</div>
            <div className="flex items-center justify-end mr-1">
                <div
                    className="flex items-center h-[70px] cursor-pointer mr-5 text-xs leading-[70px]"
                    onClick={() => navigate('/')}
                >
                    <svg
                        viewBox="0 0 1024 1024"
                        width="25"
                        height="25"
                        style={{verticalAlign: '-6px'}}
                    >
                        <path d="M221.4 152.6h141.8V396h-141.8V152.6z" fill="#FAD996"></path>
                        <path
                            d="M363.4 152.6c-9-16.6-138.2-14.2-142 0-3 11.4-23.6 287 15.8 182.4 10.4-27.4 22.6-47.6 37.2-78.6 10.6-22.6 22-42.4 32.6-54.4 16.6-18.6 18 9.6 33.6 22.6 41.6 34.4 31.8-55.6 22.8-72z"
                            fill="#F9F8F7"></path>
                        <path
                            d="M834.2 851c0 24.8-20.2 45-45 45H234.8c-24.8 0-45-20.2-45-45v-370h1.2l321.2-270 321.2 270h0.6l0.2 370z"
                            fill="#FAD996"></path>
                        <path
                            d="M833.4 481l-321.2-270-1.8 1.6V896h278.8c24.8 0 45-20.2 45-45l-0.2-370h-0.6z"
                            fill="#F7C872"></path>
                        <path
                            d="M62 548L432.6 166.2s81.2-90.6 171.8 0c79 79 343.6 400 343.6 400s-55.4 41-125.2 14.2c-37.8-14.4-118.2-68-133.4-150.8-11-60.2-45.8 29-60.8-38.2-9.4-42.2-67.2-96.6-67.2-96.6s-48.4-55.4-100.2 0c-13.8 14.8-11.4 134.6-44 128-26.4-5.2-20-105.6-27-81.2-9.6 33-25 61-54.4 47.2-33.2-15.6-42.4 79.6-64.8 112.8-17.2 25.4-23.8-45.8-40.4-29.2-21.2 21-2.4 94-39.4 108s-132.8-2-129.2-32.4z"
                            fill="#F9F8F7"></path>
                        <path
                            d="M512 126.2v144c28.8 1 49.4 24.6 49.4 24.6s57.8 54.4 67.2 96.6c15 67.2 49.8-22 60.8 38.2 15.2 82.8 95.6 136.4 133.4 150.8 69.8 26.8 125.2-14.2 125.2-14.2s-264.6-321-343.6-400c-33.2-33.2-65.2-42-92.4-40z"
                            fill="#EFEBE8"></path>
                        <path d="M405.2 495h99.8v99.8h-99.8v-99.8zM405.2 609.2h99.8v99.8h-99.8v-99.8z"
                              fill="#FB8A5D"></path>
                        <path d="M519 495h99.8v99.8h-99.8v-99.8zM519 609.2h99.8v99.8h-99.8v-99.8z"
                              fill="#EA6D4B"></path>
                    </svg>
                    <span className="hover:text-themeBackground">&nbsp;首页</span>
                </div>

                <div className="flex items-center">
                    <Dropdown
                        trigger={['click']}
                        dropdownRender={() => (
                            <Menu mode={'vertical'} className='bg-background shadow-lg rounded-md'>
                                <MenuItem onClick={logout}>退出</MenuItem>
                            </Menu>
                        )}
                    >
                        <Avatar
                            className="cursor-pointer transition-all duration-500 hover:rotate-[360deg]"
                            size={40} icon={<UserOutlined/>} src={store.state.currentAdmin.avatar}/>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

export default MyHeader;
