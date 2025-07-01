import React, { useEffect, useState } from 'react';
import {Tag} from "antd";
import {useStore} from "@hooks/useStore";

interface FooterProps {
    showFooter?: boolean; // 默认值为 true
    footerText?: string; // 用于显示的 footer 文本
}

const Footer: React.FC<FooterProps> = ({ showFooter = true ,footerText = "失之东隅， 收之桑榆"}) => {
    const [appRunTime, setAppRunTime] = useState("");
    // 获取当前年份
    const year = new Date().getFullYear();
    const store = useStore();

    useEffect(() => {
        const timer = setInterval(() => {
            const staytimeGap = new Date().getTime() - new Date('2023-07-28 00:00:00').getTime();
            const stayDay = Math.floor(staytimeGap / (3600 * 1000 * 24));
            const leave = staytimeGap % (3600 * 1000 * 24);
            const stayHour = Math.floor(leave / (3600 * 1000));
            const leave1 = leave % (3600 * 1000);
            const stayMin = Math.floor(leave1 / (60 * 1000));
            const leave2 = leave1 % (60 * 1000);
            const staySec = Math.floor(leave2 / 1000);
            setAppRunTime(`${stayDay}天${stayHour}时${stayMin}分${staySec}秒`);
        }, 1000);

        return () => clearInterval(timer); // 清理定时器
    }, []);

    if (!showFooter) return null; // 如果 showFooter 为 false，则不渲染组件

    return (
        <div className="select-none animate-hideToShow duration-2000">
            <div
                className="rounded-t-[1.5rem] bg-gradient-to-r from-[#ee7752] via-[#e73c7e] to-[#23a6d5] text-center text-white bg-[length:300%_300%] animate-gradientBG duration-[10s] ease-in-out infinite">
                <div className="font-comic font-bold pt-2 pb-1 text-[18px] select-none">
                    {footerText}
                    <br/>
                </div>
                <Tag color="blue">该网站已经运行：{appRunTime}</Tag>
                <div className="pt-2 pb-2 text-[18px] text-[#595A5A] justify-center items-center select-none">
                    <a className="text-[#595A5A] no-underline transition-all duration-300 hover:text-orange-500 pr-3"
                       href="https://beian.miit.gov.cn/" target="_blank"
                       rel="noopener noreferrer">ICP 备案号</a>
                    @<a href="https://onism.cn"
                        className="text-[#595A5A] no-underline transition-all duration-300 hover:text-orange-500">{year} {store.state.webInfo.webName}</a>
                </div>
            </div>
        </div>
    );
};

export default Footer;
