import React, {useEffect, useState} from "react";
import {Bath, Bed, CloudSun, Coffee, Leaf, Moon, Star, Sun} from "lucide-react";
import {useStore} from "@hooks/useStore";
import {useAppContext} from "@hooks/useAppContext";
import {Button} from "antd";
import {useNavigate} from "react-router-dom";

/**
 * 后台欢迎页
 */
const Welcome: React.FC = () => {

    const store = useStore();
    const [todayDate, setTodayDate] = useState<string>();
    const {time} = useAppContext();
    const nagivate = useNavigate();

    /**
     * 获取问候语
     */
    const getGreeting = () => {
        const hour = time.getHourNumber()

        // 深夜（0-6）
        if (hour < 6) {
            return {
                text: "夜深了，早点休息",
                icon: Moon,
                // 文字颜色：温暖的黄
                textClassName: "text-yellow-400",
                // 图标颜色：稍浅的灰
                iconClassName: "text-gray-400",
                background: "bg-gradient-to-br from-gray-900 to-gray-800"
            }
        }
        // 上午（6-12）
        if (hour < 12) {
            return {
                text: "早上好",
                icon: CloudSun,
                // 文字颜色：选用偏深的橙色
                textClassName: "text-orange-600",
                // 图标颜色：柔和的金黄色
                iconClassName: "text-yellow-500",
                // 背景：从浅橙渐变到浅黄
                background: "bg-gradient-to-br from-orange-200 to-yellow-100"
            }
        }
        // 下午（12-18）
        if (hour < 18) {
            return {
                text: "下午好",
                icon: Sun,
                // 文字颜色：深蓝
                textClassName: "text-blue-700",
                // 图标颜色：明亮的金黄，表现午后阳光
                iconClassName: "text-yellow-500  animate-rotate",
                // 背景：浅蓝→更浅蓝，模拟空旷的午后晴空
                background: "bg-gradient-to-br from-blue-200 to-blue-100"
            }
        }
        // 晚上（18-24）
        return {
            text: "晚上好",
            icon: Moon,
            textClassName: "text-white",
            // 图标颜色：更浅的黄，营造月光般微弱闪烁感
            iconClassName: "text-yellow-300",
            background: "bg-gradient-to-br from-blue-600 to-blue-400"
        }
    }


    const greeting = getGreeting();

    useEffect(() => {
        const intervalId = setInterval(() => setTodayDate(time.getTimeString('chinese') + " " + time.getWeekdayName()), 1000)
        return () => clearInterval(intervalId);
    }, [time]);


    // 获取标语
    const getSlogan = () => {
        // 深夜
        if (time.getHourNumber() < 6) {
            return {text: '万籁俱寂，早睡早起~', icon: Bed, className: 'text-yellow-400'}
        }
        // 上午
        if (time.getHourNumber() < 12) return {text: '准备好开始新的一天了吗？', icon: Leaf, className: 'text-green-600'}
        // 下午
        if (time.getHourNumber() < 18) return {
            text: '午间充电完毕，下午继续加油~',
            icon: Coffee,
            className: 'text-blue-700'
        }
        // 晚上
        return {text: '夜幕降临，聆听自己内心的声音', icon: Bath, className: 'text-white'}
    }

    const slogan = getSlogan();

    // 快速操作
    const quickActions = [
        {key: '/admin/articleEdit', label: "写新文章", icon: "✍️", color: "bg-blue-50 text-blue-700 border-blue-200"},
        {key: '/admin/main', label: "查看统计", icon: "📊", color: "bg-green-50 text-green-700 border-green-200"},
        {key: '/admin/userList', label: "管理用户", icon: "👥", color: "bg-purple-50 text-purple-700 border-purple-200"},
        {key: '/admin/treeHoleList', label: "查看留言", icon: "✉️", color: "bg-yellow-50 text-yellow-700 border-yellow-200"},
        {key: '/admin/commentList', label: "评论管理", icon: "💬", color: "bg-red-50 text-red-700 border-red-200"},
        {key: '/admin/resourceList', label: "管理资源", icon: "🗂", color: "bg-violet-50 text-violet-700 border-violet-200"},
        {key: '/admin/loveList', label: "表白墙", icon: "💞", color: "bg-pink-50 text-pink-700 border-pink-200"},
        {key: '/admin/webEdit', label: "网站设置", icon: "⚙️", color: "bg-gray-50 text-gray-700 border-gray-200"},
    ];


    return (
        <div className="flex flex-col  p-4 py-1 select-none">
            <div
                className="flex mb-12 mt-3 justify-center items-center bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] mx-auto overflow-y-auto scrollbar-none">
                {/* 头部 */}
                <div
                    className={`relative ${greeting.background} p-5 text-white rounded-t-2xl w-full flex flex-col items-center text-center`}>
                    <div className="p-1 bg-white/20 rounded-full mb-4">
                        <greeting.icon className={`w-10 h-10 ${greeting.iconClassName}`}/>
                    </div>
                    <div className={greeting.textClassName}>
                        <h1 className="text-3xl font-bold mb-2">
                            {greeting.text}，{store.state.currentAdmin.username ?? store.state.webInfo.webName}！
                        </h1>
                        <p className="text-base lg:text-lg mb-4">{todayDate}</p>
                        <div className="flex justify-center items-center gap-2">
                            <slogan.icon className={`w-6 h-6 ${slogan.className}`}/>
                            <span>{slogan.text}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 快速操作 */}
            <section className='px-3'>
                <div className="flex items-center gap-2 mb-3">
                    <Star className="w-6 h-6 text-yellow-600 mb-3 animate-scale-1-infinite"/>
                    <h2 className="text-xl font-semibold text-fontColor">快速操作</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((action, index) => (
                        <Button
                            key={index}
                            onClick={() => nagivate(action.key)}
                            variant="outlined"
                            className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color} hover:shadow-md transition-all`}
                        >
                            <span className="text-xl">{action.icon}</span>
                            <span className="text-sm font-medium">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Welcome;
