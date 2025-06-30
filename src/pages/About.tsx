import React, {useState, useEffect, useRef} from 'react';
import {useStore} from '@hooks/useStore';
import TwoPoem from '@components/common/TwoPoem';
import Footer from '@components/common/footer';
import common from "@utils/common";

interface SayContent {
    talk: string[];
    reply: string[];
}

interface Message {
    id: number;
    side: 'left' | 'right';
    text: string;
    replies?: string[];
}

const About: React.FC = () => {
    const [sayShow, setSayShow] = useState(false);
    const [sayIndex, setSayIndex] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const store = useStore();

    const sayContent: SayContent[] = [
        {talk: ["Hi, there👋", "这是Onism的个人博客~"], reply: ["然后呢？ 😃", "少废话！ 🙄"]},
        {
            talk: ["😘", "本站平时仅用于交流和学习新知识", "如涉及侵权请联系站长删除对应资源，谢谢！！！"],
            reply: ["所以这个网站有什么用吗？ 😂"]
        },
        {talk: ["博主会将日常学习笔记和好的学习资源留在这里，帮助大家一起学习~😉"], reply: ["泰酷啦！😍", "这么好🥰"]},
        {talk: ["这么好的博客不关注支持一下吗~😘"], reply: ["这就收藏！", "支持支持！"]},
        {talk: ["主页有博主的微信联系方式，记得备注来意哦~"], reply: ["好的好的！"]},
        {talk: ["👋 👋 👋"], reply: []}
    ];

    const nextId = useRef(0);
    const timers = useRef<number[]>([]);

    const addMessage = (msg: Omit<Message, 'id'>) => {
        setMessages(prev => [...prev, {id: nextId.current++, ...msg}]);
    };

    const answer = (value: string) => {

        setMessages(prev => prev.filter(m => !m.replies));
        // 右边用户回复消息
        addMessage({side: 'right', text: value});

        timers.current.push(
            window.setTimeout(() => {
                say();
            }, 500)
        );
    };

    const say = () => {
        if (sayIndex >= sayContent.length) return;
        const current = sayContent[sayIndex];

        current.talk.forEach((text, idx) => {
            timers.current.push(
                window.setTimeout(() => {
                    addMessage({side: 'left', text});

                    if (idx === current.talk.length - 1 && current.reply) {
                        timers.current.push(
                            window.setTimeout(() => {
                                addMessage({side: 'left', text: '', replies: current.reply});
                                setSayIndex(prev => prev + 1);
                            }, 500)
                        );
                    }
                }, idx * 500)
            );
        });
    };

    useEffect(() => {
        // 在初始延迟后显示对话
        const initTimer = window.setTimeout(() => {
            setSayShow(true);
            say();
        }, 2000);

        return () => {
            clearTimeout(initTimer);
            timers.current.forEach(clearTimeout);
        };
    }, []);

    return (
        // 页面根容器采用flex布局，min-h-screen保证全屏高度，flex-col纵向排列
        <div className="flex flex-col min-h-screen bg-background">
            {/* 两句诗 */}
            <div className="animate-slide-top">
                <TwoPoem isHitokoto={true}/>
            </div>

            {/* 主体内容flex-1保证内容区自动撑开，Footer始终在底部 */}
            <div className="flex-1 animate-slide-bottom">
                <div className="text-center w-full lg:max-w-[1000px] md:max-w-[700px] sm:max-w-[600px] mx-auto my-0 pt-10 pb-14 px-5">
                    <h1 className="text-[40px] font-bold tracking-[5px] font-optima">后花园</h1>
                    {/* 对话框 */}
                    <div className="font-optima min-h-[450px] p-[5px] bg-maxLightGray rounded-[10px]">
                        <h4>与 {common.isEmpty(store.state.webInfo.webName) ? 'Onism' : store.state.webInfo.webName} 对话中...</h4>
                        {sayShow && (
                            <div id="say-container">
                                {messages.map(msg => (
                                    msg.replies ? (
                                        <div key={msg.id} className="mt-[-18px] mb-3 ml-2 flex justify-start">
                                            {msg.replies.map((reply, i) => (
                                                <span
                                                    key={i}
                                                    className="say-select cursor-pointer px-2 py-1 mr-3 mt-5 rounded text-white bg-black border border-black hover:border-b-themeBackground hover:text-themeBackground hover:shadow-md"
                                                    onClick={() => answer(reply)}
                                                >
                          {reply}
                        </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.side === 'left' ? 'justify-start' : 'justify-end'} my-3 animate-slide-bottom`}
                                        >
                      <span
                          className={`px-3 py-1 rounded-full ${msg.side === 'left' ? 'text-maxGreyFont bg-lightGray' : 'text-white bg-translucent'}`}
                      >
                        {msg.text}
                      </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* 页脚始终在底部 */}
            <Footer/>
        </div>
    );
};

export default About;
