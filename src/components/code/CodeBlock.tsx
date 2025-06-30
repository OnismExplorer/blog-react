import React, {useState, useRef, useEffect} from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {Copy, Check} from 'lucide-react';
import {useTheme} from "next-themes";
import { darkThemes, lightThemes, DarkThemeName, LightThemeName} from '../../type/themeStyle';
import {registerAllLanguages, sqlAliases} from "../../type/prismLanguages";

interface CodeBlockProps {
    language         : string;
    value            : string;
    showLineNumbers ?: boolean;
    appendTextOnCopy?: string;
      /** 覆盖主题：直接传入 Prism 主题对象 */
    themeStyle?: Record<string, React.CSSProperties>;
      /** 指定浅色模式下的主题名 */
    themeNameLight?: LightThemeName;
      /** 指定暗色模式下的主题名 */
    themeNameDark?: DarkThemeName;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
                                                        language,
                                                        value,
                                                        showLineNumbers  = true,
                                                        appendTextOnCopy = '',
                                                        themeStyle,
                                                        themeNameLight ,
                                                        themeNameDark ,
                                                    }) => {
    const [copied, setCopied] = useState(false);
    const timerRef            = useRef<number>();
    const {theme}             = useTheme();

    useEffect(() => {
        registerAllLanguages();
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value + (appendTextOnCopy || ''));
            setCopied(true);
            clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('复制失败', e);
        }
    };

      // 代码块主题
    let style;
    if (themeStyle) {
        style = themeStyle
    } else if (theme === 'dark') {
        const key   = themeNameDark && darkThemes[themeNameDark] ? themeNameDark : 'gruvboxDark';
              style = darkThemes[key]
    } else {
        const key   = themeNameLight && lightThemes[themeNameLight] ? themeNameLight : 'oneLight';
              style = lightThemes[key];
    }

    return (
        <div className = "relative my-4 rounded-lg overflow-hidden border font-handWritten">
            {/*模拟 mac 按钮*/}
            <div className = "absolute top-3 left-4 bg-red-500 w-3 h-3 rounded-full"></div>
            <div className = "absolute top-3 left-10 bg-yellow-500 w-3 h-3 rounded-full"></div>
            <div className = "absolute top-3 left-16 bg-green-500 w-3 h-3 rounded-full"></div>

            {/* 语言标签 */}
            <div className = "select-none absolute top-2 left-1/2 px-2 py-0.5 text-1xl text-center font-bold bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-white rounded-full">
                {language || 'text'}
            </div>

            {/* 复制按钮 */}
            <button
                onClick    = {handleCopy}
                className  = "absolute top-2 right-2 p-1 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700  rounded "
                aria-label = "Copy code"
            >
                {copied ? <Check size={16} className="text-green-400"/> : <Copy size={16} className="text-white"/>}
            </button>

            {/* 代码高亮 */}
            <SyntaxHighlighter
                language        = {sqlAliases.indexOf(language) !== -1 ? 'sql' : language}
                style           = {style}
                showLineNumbers = {showLineNumbers}
                lineNumberStyle = {{
                    minWidth       : '2.3rem',
                    maxWidth       : '2.5rem',
                    paddingRight   : '0px',
                    textAlign      : 'center',
                    left           : 0,
                    position       : 'absolute',
                    // 统一行高
                    lineHeight: '1.5em',
                    backgroundColor: `${style['pre[class*="language-"]']?.background}`  // 获取代码主题的背景颜色
                }}
                customStyle={{
                    margin     : 0,
                    paddingTop : '2.5rem',
                    paddingLeft: '2.5rem',
                    fontSize   : "16px",
                    // 统一行高
                    lineHeight: '1.5em',
                    fontFamily: 'hardCandyFont',
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};
