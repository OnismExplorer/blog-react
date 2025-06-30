import React, {JSX, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    HomeOutlined,
    ToolOutlined,
    UserOutlined,
    FileTextOutlined,
    BookOutlined,
    CommentOutlined,
    MessageOutlined,
    PaperClipOutlined,
    CreditCardOutlined,
    HeartOutlined,
} from '@ant-design/icons';
import {Menu} from "../common/menu";
import {useStore} from "@hooks/useStore";

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const store = useStore();

    const items = [
        {
            icon: <HomeOutlined/>,
            key: '/admin/main',
            label: '系统首页',
            isBoss: true,
        },
        {
            icon: <ToolOutlined/>,
            key: '/admin/webEdit',
            label: '网站设置',
            isBoss: true,
        },
        {
            icon: <UserOutlined/>,
            key: '/admin/userList',
            label: '用户管理',
            isBoss: true,
        },
        {
            icon: <FileTextOutlined/>,
            key: '/admin/postList',
            label: '文章管理',
            isBoss: false,
        },
        {
            icon: <BookOutlined/>,
            key: '/admin/sortList',
            label: '分类管理',
            isBoss: true,
        },
        {
            icon: <CommentOutlined/>,
            key: '/admin/commentList',
            label: '评论管理',
            isBoss: false,
        },
        {
            icon: <MessageOutlined/>,
            key: '/admin/treeHoleList',
            label: '留言管理',
            isBoss: true,
        },
        {
            icon: <PaperClipOutlined/>,
            key: '/admin/resourceList',
            label: '资源管理',
            isBoss: true,
        },
        {
            icon: <CreditCardOutlined/>,
            key: '/admin/resourcePathList',
            label: '资源路径管理',
            isBoss: true,
        },
        {
            icon: <HeartOutlined/>,
            key: '/admin/loveList',
            label: '表白墙管理',
            isBoss: true,
        },
    ];

    // 筛选出当前用户可见的菜单项
    const [filteredItems,setFilteredItems] = useState<{icon:JSX.Element,key:string,label:string,isBoss:boolean}[]>();

    useEffect(() => {
        const role = store.state.currentAdmin.role;
        setFilteredItems(items.filter(item => role === 'boss' || !item.isBoss));
    }, [store.state.currentAdmin.role]);

    // 菜单点击事件
    const handleMenuClick = (e: { key: string }) => {
        navigate(e.key);
    };

    return (
        <div className="absolute font-custom text-sm text-fontColor  left-0 top-[70px] bottom-0 overflow-y-scroll bg-sideBarBackground scrollbar-none">
            <Menu
                className="w-[200px] items-center justify-center"
                mode="vertical"
                onClick={handleMenuClick}
                defaultSelectedKeys={[location.pathname]}
                items={filteredItems}
                highlightable
                underlinable
                itemClassName='m-1'
            >
            </Menu>
        </div>
    );
};

export default Sidebar;
