import React from "react";
import MyHeader from "@components/admin/myHeader";
import Sidebar from "@components/admin/sidebar";
import {Outlet} from "react-router-dom";
import ToggleTheme from "@components/common/toggleTheme";

const Admin: React.FC = () => {

    return (
        <div>
            <MyHeader/>
            <Sidebar/>
            <div className="absolute left-[200px] right-0 top-[70px] bottom-0 transition-[left] duration-300 ease-in-out">
                <div className="bg-background w-auto h-full p-[30px] overflow-y-auto scrollbar-none ">
                    <Outlet/>
                </div>
            </div>
            {/*切换暗黑/正常模式按钮*/}
            <ToggleTheme />
        </div>
    )
}

export default Admin
