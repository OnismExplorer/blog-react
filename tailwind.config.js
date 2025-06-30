const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // 指定要扫描的文件路径
        "index.html",
        "./src/assets/css/font.css"
    ],
    theme: {
        fontSize: {
            'xs': '15px',    // 12px
            'sm': '16px',   // 14px
            'base': '20px',    // 16px
            'lg': '24px',  // 18px
            'xl': '28px',   // 20px
            '2xl': '32px',   // 24px
            // 自定义更多
            '3xl': '38px', // 30px
            '4xl': '48px',  // 36px
        },
        screens: { // 规定屏幕宽度大小
            xs: '400px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
        container: { // 规定样式容器尺寸大小
            center: true,       // 自动水平居中
            screens: {
                xs: '400px',
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
        },
        extend: {
            // 自定义颜色
            colors: {
                background: 'var(--background)',
                favoriteBg: 'var(--favoriteBg)',
                fontColor: 'var(--fontColor)',
                borderColor: 'var(--borderColor)',
                borderHoverColor: 'var(--borderHoverColor)',
                articleFontColor: 'var(--articleFontColor)',
                articleGreyFontColor: 'var(--articleGreyFontColor)',
                commentContent: 'var(--commentContent)',
                themeBackground: 'var(--themeBackground)',
                toolbarFont: 'var(--toolbarFont)',
                toolbarBackground: 'var(--toolbarBackground)',
                greyFont: 'var(--greyFont)',
                maxGreyFont: 'var(--maxGreyFont)',
                whiteMask: 'var(--whiteMask)',
                maxWhiteMask: 'var(--maxWhiteMask)',
                maxMaxWhiteMask: 'var(--maxMaxWhiteMask)',
                miniWhiteMask: 'var(--miniWhiteMask)',
                transparent: 'var(--transparent)',
                miniMask: 'var(--miniMask)',
                mask: 'var(--mask)',
                translucent: 'var(--translucent)',
                maxMask: 'var(--maxMask)',
                white: 'var(--white)',
                lightRed: 'var(--lightRed)',
                maxLightRed: 'var(--maxLightRed)',
                orangeRed: 'var(--orangeRed)',
                azure: 'var(--azure)',
                lightGray: 'var(--lightGray)',
                maxLightGray: 'var(--maxLightGray)',
                maxMaxLightGray: 'var(--maxMaxLightGray)',
                lightGreen: 'var(--lightGreen)',
                lightYellow: 'var(--lightYellow)',
                sliderTrack: 'var(--sliderTrack)',
                sliderThumb: 'var(--sliderThumb)',
                sideBarBackground: 'var(--sideBarBackground)',
            },
            // 自定义阴影
            boxShadow: {
                // 默认图片阴影：多层次柔和效果
                'img': 'var(--shadow-img)',
                // 悬停时加深浮起感
                'img-hover': 'var(--shadow-img-hover)',
                'article': 'var(--shadow-article)', // 文章卡片阴影
                'article-hover': 'var(--shadow-article-hover)', // 文章卡片悬停阴影
                'box-shadow': 'var(--shadow-box)',
                'avatar-hover': 'var(--shadow-avatar-hover)',
                'box-mini': 'var(--shadow-box-mini)',
                'music-player': 'var(--shadow-music-player)', // 音乐播放器
                'music-slider': 'var(--shadow-music-slider)',
                'music-active-button': 'var(--shadow-music-active-button)',
                'card-image': 'var(--shadow-card-image)',
            },
            // 自定义背景图片
            backgroundImage: {
                'gradualBackground': 'linear-gradient(to right bottom, #ee7752, #e73c7e, #23a6d5, #23d5ab)', // 渐变背景
                'gradualRed': 'linear-gradient(to right, #ff4b2b, #ff416c)', // 渐变红色背景
                'gradientBG': 'linear-gradient(-90deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', // 渐变背景
                'commentURL': "url('@assets/img/comment.png')", // 评论背景图片
                'springBg': "url('@assets/img/contact.png')", // 联系方式图片
                'admireImage': "url('@assets/img/admire.png')", // 赞赏图片
                'toTop': "url('@assets/img/toTop.png')", // 返回顶部图片
                'bannerWave1': "url('@assets/img/bannerwave1.png')", // 波浪图片1
                'bannerWave2': "url('@assets/img/bannerwave2.png')", // 波浪图片2
                'verifyImage': "url('@assets/img/verify.png')", // 验证图片
                'toolbar': "url('@assets/img/toolbar.png')", // 工具栏背景
                'love': "url('@assets/img/toolbar.png')", // 爱心图片
                'overlayStars': "url('@assets/svg/overlayStars.svg')",
                'bgPuple':"url('@assets/img/bgPuple.png')",
            },
            // 定义动画关键帧
            keyframes: {
                'slide-top': {
                    '0%': {opacity: '0', transform: 'translateY(-20%)'},
                    '100%': {opacity: '1', transform: 'translateY(0)'},
                },
                'slide-bottom': {
                    '0%': {opacity: '0', transform: 'translateY(20%)'},
                    '100%': {opacity: '1', transform: 'translateY(0)'},
                },
                'header-effect': {
                    '0%': {opacity: '0', transform: 'translateY(-50px)'},
                    '100%': {opacity: '1', transform: 'translateY(0)'},
                },
                'rotate': {
                    '0%': {opacity: '1', transform: 'rotate(0deg)'},
                    '100%': {opacity: '1', transform: 'rotate(360deg)'},
                },
                'hideToShow': {
                    'from': {opacity: '0'},
                    'to': {opacity: '1'},
                },
                'showToHide': {
                    '0%': {opacity: '1'},
                    '50%': {opacity: '0.5'},
                    '100%': {opacity: '0'},
                },
                'my-shake': {
                    '0%': {opacity: '1', transform: 'translateY(0px)'},
                    '30%': {opacity: '0.5', transform: 'translateY(25px)'},
                    '100%': {opacity: '1', transform: 'translateY(0px)'},
                },
                'scatter': {
                    '0%': {top: '0'},
                    '50%': {top: '-15px'},
                    '100%': {top: '0'},
                },
                'scale': {
                    '0%': {transform: 'scale(1)'},
                    '50%': {transform: 'scale(1.2)'},
                    '100%': {transform: 'scale(1)'},
                },
                'imgScale': {
                    '0%': {transform: 'scale(0.8, 0.8)'},
                    '70%': {transform: 'scale(1.3, 1.3)'},
                    '100%': {transform: 'scale(0.8, 0.8)'},
                },
                'jianBian': {
                    'to': {backgroundPosition: '-2000rem'},
                },
                'gradientBG': {
                    '0%': {backgroundPosition: '0 50%'},
                    '50%': {backgroundPosition: '100% 50%'},
                    '100%': {backgroundPosition: '0 50%'},
                },
                'weiYanShadowFlashing': {
                    '0%, 100%': {boxShadow: 'none'},
                    '50%': {boxShadow: '0 0 15px red'},
                },
                'zoomIn': {
                    '0%': {opacity: '0', transform: 'scale3d(.3, .3, .3)'},
                    '50%': {opacity: '1'},
                },
                'image-disappear': {
                    '0%': {width: '4rem', height: '4rem', opacity: '1', marginRight: '1rem'},
                    '100%': {width: '0', height: '0', opacity: '0', marginRight: '0'},
                },
                'content-expand': {
                    '0%': {width: 'calc(100% - 5rem)'},
                    '25%': {width: 'calc(100% - 3rem)'},
                    '50%': {width: 'calc(50% - 2rem)'},
                    '100%': {width: '100%'},
                },
                'passing': {
                    '0%': {transform: 'translateX(-150%)', opacity: '0'},
                    '50%': {transform: 'translateX(0)', opacity: '1'},
                    '100%': {transform: 'translateX(150%)', opacity: '0'},
                },
                'moveHead': {
                    "0%, 50%, 90%, 100%": {transform: "rotateZ(-10deg)"},
                    "30%": {transform: "translateX(6px) translateY(2px)"},
                    "35%": {transform: "translateX(-6px)"},
                    "10%, 20%, 40%": {transform: "rotateZ(0)"}
                },
                'moveEyebrow': {
                    "0%, 50%, 90%, 100%": {transform: "translateY(8px)"},
                    "10%, 20%, 40%": {transform: "translateY(-10px)"}
                },
                'moveMouth': {
                    "0%, 50%, 90%, 100%": {height: "20px", transform: "translateY(-10px)"},
                    "10%, 20%, 40%": {height: "40px", transform: "translateY(0)"}
                },
                'moveLeftArm': {
                    "0%, 50%, 90%, 100%": {transform: "rotateZ(22deg)"},
                    "10%, 20%, 40%": {transform: "rotateZ(0)"}
                },
                'moveHand': {
                    "0%, 50%, 90%, 100%": {transform: "translateY(0)"},
                    "10%, 20%, 40%": {transform: "translateY(-10px) rotateZ(15deg)"}
                },
                'moveBrainsText': {
                    "0%, 20%, 40%, 60%, 80%, 100%": {transform: "translateX(20px)"},
                    "10%, 30%, 50%, 70%, 90%": {transform: "translateX(-20px)"}
                },
                'moveBrainsBox': {
                    "0%, 50%, 90%, 100%": {opacity: "0"},
                    "10%, 20%, 40%": {opacity: "1"}
                },
                'gradient-x': {
                    '0%': {'background-position': '0% 50%'},
                    '100%': {'background-position': '100% 50%'},
                },
                // Add new keyframes
                'slideTop': {
                    '0%': {transform: 'translateY(-30px)', opacity: '0'},
                    '100%': {transform: 'translateY(0)', opacity: '1'},
                },
                'slideBottom': {
                    '0%': {transform: 'translateY(30px)', opacity: '0'},
                    '100%': {transform: 'translateY(0)', opacity: '1'},
                },
                'rotate360': {
                    '0%': {transform: 'rotate(0deg)'},
                    '100%': {transform: 'rotate(360deg)'},
                },
                'scroll-left': {
                    '0%': {left: '100%'},    // 从容器右侧开始
                    '100%': {left: '-10%'}, // 滚动至左侧外
                },
                'barrage-highlight': {
                    '0%, 100%': {boxShadow: '0 0 0 rgba(250, 204, 21, 0.4)'},
                    '50%': {boxShadow: '0 0 10px 2px rgba(250, 204, 21, 0.7)'}
                },
                'button-click': {
                    '0%': {transform: 'scale(1)'},
                    '50%': {transform: 'scale(0.95)'},
                    '100%': {transform: 'scale(1)'}
                },
                'rotate-disc': {
                    'from': {transform: 'rotate(0deg)'},
                    'to': {transform: 'rotate(360deg)'},
                },
                'rocketLaunch': {
                    '0%': {opacity: '1'},
                    '70%': {opacity: '0.5'},
                    '100%': {opacity: '0'},
                },

                "rocket-movement": {
                    "0%": { transform: "translate(0, 0)" },
                    "100%": { transform: "translate(1200px, -600px)" },
                },
                "spin-earth": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(-360deg)" },
                },
                "move-astronaut": {
                    "0%": { transform: "translate(0, 0)" },
                    "100%": { transform: "translate(-160px, -160px)" },
                },
                "rotate-astronaut": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(-720deg)" },
                },
                "glow-star": {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "40%": { opacity: "0.3" },
                    "90%": { opacity: "1", transform: "scale(1.2)", "border-radius": "9999px" },
                },
            },
            // 自定义动画
            animation: {
                /* 上移 */
                'slide-top': 'slide-top 1s ease-out both',
                /* 下移 */
                'slide-bottom': 'slide-bottom 0.5s ease-out both',
                /* 图片消失动画 */
                'image-disappear': 'image-disappear 0.6s ease-in-out forwards',
                /* 内容扩展动画 */
                'content-expand': 'content-expand 0.6s ease-in-out forwards',
                /* 显示 */
                'hideToShow': 'hideToShow 1s ease-in-out both',
                'hideToShow-0.3': 'hideToShow 0.3s ease-in-out both',
                'hideToShow-0.5': 'hideToShow 0.5s ease-in-out both',
                'showToHide': 'showToHide 1s ease-in-out both',
                'hideToShow-2.5': 'hideToShow 2.5s',
                /* 首图动画：下移 */
                'header-effect': 'header-effect 2s',
                'header-effect-2.5': 'header-effect 2.5s',
                'header-effect-ease': 'hideToShow 1s ease-in-out',
                'header-effect-infinite': 'hideToShow 0.7s infinite',
                /* 旋转 */
                'rotate': 'rotate 2s linear infinite',
                /* 下移 */
                'shake': 'my-shake 1.5s ease-out infinite',
                /* 上移 */
                'scatter': 'scatter 1.75s infinite',
                /* 放大 */
                'scale-0.8': 'scale 0.8s ease-in-out',
                'scale-0.8-infinite': 'scale 0.8s ease-in-out infinite',
                'scale-both': 'scale 1s ease-out both',
                'scale-linear-infinite': 'scale 1s linear infinite',
                'scale-1-infinite': 'scale 1s ease-in-out infinite',
                'scale-1.5-infinite': 'scale 1.5s ease-in-out infinite',
                'scale-2.5-infinite': 'scale 2.5s ease-in-out infinite',
                /* 图片放大 */
                'imgScale': 'imgScale 2s linear infinite',
                /* 渐变 */
                'jianBian': 'jianBian 60s linear infinite',
                /* 背景位置移动 */
                'gradientBG': 'gradientBG 10s ease-out infinite',
                'gradientBGSlow': 'gradientBG 120s linear infinite',
                /* 阴影变化 */
                'weiYanShadowFlashing-1.5-infinte': 'weiYanShadowFlashing 1.5s linear infinite',
                /* 有小变大 */
                'zoomIn': 'zoomIn 0.8s ease-in-out',
                /* 由左开向右 */
                'passing': 'passing 4s linear infinite',
                'moveHead': "moveHead 5s ease-in-out infinite",
                'moveEyebrow': "moveEyebrow 5s ease-in-out infinite",
                'moveMouth': "moveMouth 5s ease-in-out infinite",
                'moveLeftArm': "moveLeftArm 5s ease-in-out infinite",
                'moveHand': "moveHand 5s ease-in-out infinite",
                'moveBrainsText': "moveBrainsText 5s ease-in-out infinite",
                'moveBrainsBox': "moveBrainsBox 5s ease-in-out infinite",
                'gradient-x': 'gradient-x 4s ease infinite',
                /* 新增动画 */
                'slideTop': 'slideTop 1s ease-in-out',
                'slideBottom': 'slideBottom 1s ease-in-out',
                'rotate-360': 'rotate(360deg)',
                /* 浮动动画 */
                'float': 'float 3s ease-in-out infinite',
                'float-reverse': 'float-reverse 3s ease-in-out infinite',
                /* 慢速旋转 */
                'spin-slow': 'spin 3s linear infinite',
                'spin-slower': 'spin 6s linear infinite',
                'spin-reverse': 'spin-reverse 1s linear infinite',
                'spin-reverse-slow': 'spin-reverse 3s linear infinite',
                'spin-reverse-slower': 'spin-reverse 6s linear infinite',
                /* 慢速弹跳 */
                'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
                'bounce-slow': 'bounce 3s infinite',
                'barrage-scroll': 'scroll-left linear infinite',
                'barrage-highlight': 'barrage-highlight 1.5s ease-in-out infinite',
                /* 按钮点击效果 */
                'button-click': 'button-click 0.3s ease-in-out',
                'rotate-disc': 'rotate-disc 15s linear infinite',//音乐封面旋转
                'rocket-launch': 'rocketLaunch 1s linear',

                "rocket-movement": "rocket-movement 200s linear infinite both",
                "spin-earth": "spin-earth 100s infinite linear both",
                "move-astronaut": "move-astronaut 50s infinite linear both alternate",
                "rotate-astronaut": "rotate-astronaut 200s infinite linear both alternate",
                "glow-star-1": "glow-star 2s infinite ease-in-out alternate 1s",
                "glow-star-2": "glow-star 2s infinite ease-in-out alternate 3s",
                "glow-star-3": "glow-star 2s infinite ease-in-out alternate 5s",
                "glow-star-4": "glow-star 2s infinite ease-in-out alternate 7s",
                "glow-star-5": "glow-star 2s infinite ease-in-out alternate 9s",
            },
            // 定义过渡持续时间
            transitionDuration: {
                '300': '300ms',
                '600': '600ms',
            },
            // 字体
            fontFamily: {
                comic: ['"Comic Sans MS"', 'cursive', 'sans-serif'],
                // 把 Optima 系列字体注册为一个快捷类名
                optima: [
                    'Optima-Regular',
                    'Optima',
                    'PingFangSC-light',
                    'PingFangTC-light',
                    'PingFang SC',
                    'Cambria',
                    'Cochin',
                    'Georgia',
                    'Times',
                    'Times New Roman',
                    'serif',
                ],
                custom: ['customFont', 'cursive', 'sans-serif'],
            }
        },
    },
    safelist: [
        'text-overflow-ellipsis',
        'favorite-item-wrap',
        {
            pattern: /bg-(red|blue|green|yellow|purple|indigo|pink)-(100|200|300|400|500|600|700|800|900)/,
        },
        {
            pattern: /text-(red|blue|green|yellow|purple|indigo|pink)-(100|200|300|400|500|600|700|800|900)/,
        },
    ],
    plugins: [
        require('@tailwindcss/typography'),
        plugin(function({ addBase, theme }) {
            addBase({
                '::selection': { // 设置文本被选中时，背景色为 themeBackground ，字体颜色为白色
                    backgroundColor: theme('colors.themeBackground'),
                    color: theme('colors.white'),
                },
            })
        }),
        plugin(function ({addUtilities}) {
            const newUtilities = {
                // 定义一个 .transition-all-1s 类
                '.transition-all-1s': {
                    transition: 'all 1s ease-in-out',
                },
                '.transform-origin-center': {
                    'transform-origin': 'center',
                },
                '.scrollbar-thin': {
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                },
                '.scrollbar-none': {
                    /* Firefox */
                    'scrollbar-width': 'none',
                    /* IE10+ */
                    '-ms-overflow-style': 'none',

                    /* Chrome/Safari/Edge: 直接把滚动条伪元素移出渲染树 */
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                },
                '.scrollbar-thumb-gray-300': {
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#d1d5db',
                        borderRadius: '3px',
                    },
                },
                '.scrollbar-thumb-gray-400': {
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#9ca3af',
                        borderRadius: '3px',
                    },
                },
                '.scrollbar-track-transparent': {
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    },
                },
            };
            addUtilities(newUtilities, {
                variants: ['responsive','before', 'hover', 'focus'],
            });
        }),
    ],
}
