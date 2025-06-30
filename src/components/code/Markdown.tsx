import React, {createContext, PropsWithChildren, useContext, memo} from "react";
import ReactMarkdown, {Components} from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "@components/common/image";
import {getHeadingId, resetSlugs} from "@utils/slug";
import {CodeBlock} from "./CodeBlock";
import {DarkThemeName, LightThemeName} from "@type/themeStyle";
import {useTheme} from "next-themes";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import {remarkMark} from "remark-mark-highlight";
import {Pluggable} from "unified";
import remarkSupersub from "remark-supersub";

interface MarkdownProps {
    markdownText: string;
    /** 覆盖主题：直接传入 Prism 主题对象 */
    themeStyle?: Record<string, React.CSSProperties>;
    /** 指定浅色模式下的主题名 */
    themeNameLight?: LightThemeName;
    /** 指定暗色模式下的主题名 */
    themeNameDark?: DarkThemeName;
}

const remarkPlugins: Pluggable[] = [remarkGfm, remarkBreaks, remarkMath, remarkMark,remarkSupersub];

const ListDepthContext = createContext<number>(1);

// CHANGED: Wrapped the component definition in React.memo
export const Markdown: React.FC<MarkdownProps> = memo((
    pros: MarkdownProps
) => {
    const theme = useTheme();

    // ... (rest of the functions like CustomUL, CustomOL remain the same)
    function CustomUL({ children, ...props }: PropsWithChildren<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>>) {
        const depth = useContext(ListDepthContext);
        const listStyle: string[] = ["list-disc", "list-[circle]", "list-[square]"];

        return (
            <ListDepthContext.Provider value={depth + 1}>
                <ul className={`font-custom my-1 marker:text-[1.0rem] pl-[25px] ${listStyle[(depth - 1) % listStyle.length]}`} {...props}>
                    {children}
                </ul>
            </ListDepthContext.Provider>
        );
    }

    function CustomOL({ children, ...props }: PropsWithChildren<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>>) {
        const depth = useContext(ListDepthContext);
        const listStyle: string[] = ["list-decimal", "list-[upper-roman]", "list-[lower-alpha]", "list-[lower-greek]"];

        return (
            <ListDepthContext.Provider value={depth + 1}>
                <ol className={`font-custom my-1 marker:text-[1.0rem] pl-[25px] ${listStyle[(depth - 1) % listStyle.length]}`} {...props}>
                    {children}
                </ol>
            </ListDepthContext.Provider>
        );
    }

    // The components object remains largely the same, with one key change to <th>
    const components: Components = {
        // ... (h1, h2, etc. are unchanged)
        h1({children, ...props}) { resetSlugs(); const id = getHeadingId(String(children)); return <h1 id={id} className="mt-8 mb-8 font-custom font-bold text-3xl block mx-auto border-b-2 border-dashed border-red-500 pb-1 w-full max-w-full text-center whitespace-normal break-words" {...props}>{children}</h1>; },
        h2({children, ...props}) { resetSlugs(); const id = getHeadingId(String(children)); return <h2 id={id} className={`font-custom font-bold text-[1.5rem] mb-[1rem] mx-0 p-0 border-b-2 border-b-[rgb(239,112,96)] border-solid w-full max-w-full whitespace-normal break-words ${theme.theme === "dark" ? "" : "after:inline-block after:content-[''] after:align-bottom after:p-0 after:border-r-[1.25rem] after:border-r-transparent after:border-b-[1.25rem] after:border-b-[#efebe9] after:border-solid"}`} {...props}><span className="inline-block font-custom font-bold align-bottom text-white mr-[3px] pt-[3px] pb-px px-2.5 rounded-t-[3px] bg-[#EF7060]" {...props}>{children}</span></h2>; },
        h3({children, ...props}) { resetSlugs(); const id = getHeadingId(String(children)); return <h3 id={id} className="font-custom font-bold mt-[0.9em] mb-[0.7em] text-[1.3rem] before:content-['🎫'] w-full max-w-full whitespace-normal break-words" {...props}>{children}</h3>; },
        h4({children, ...props}) { resetSlugs(); const id = getHeadingId(String(children)); return <h4 id={id} className="font-bold font-custom text-[1.3rem] before:content-['⛄'] mb-[0.8rem] w-full max-w-full whitespace-normal break-words" {...props}>{children}</h4>; },
        h5({children, ...props}) { resetSlugs(); const id = getHeadingId(String(children)); return <h5 id={id} className="font-bold font-custom text-[1.2rem] before:content-['📕'] mb-[0.7rem] w-full max-w-full whitespace-normal break-words" {...props}>{children}</h5>; },
        h6({children, ...props}) { resetSlugs(); const id = getHeadingId(String(children)); return <h6 id={id} className="font-custom font-bold text-[1.1rem] before:content-['🎨'] mb-[0.6rem] w-full max-w-full whitespace-normal break-words" {...props}>{children}</h6>; },
        p({children, ...props}) { return <p className="font-custom text-base leading-6 m-0 py-2 w-full max-w-full whitespace-normal break-words" {...props}>{children}</p>; },
        blockquote({children, ...props}) { return <blockquote className="font-custom block text-gray-500 text-[0.9em] font-bold overflow-auto my-5 pl-5 pr-2.5 py-2.5 border-l-[3px] border-l-[rgb(239,112,96)] border-solid bg-[#fff9f9]" {...props}>{children}</blockquote>; },
        ul: CustomUL,
        ol: CustomOL,
        li({children, ...props}) { return <li className="font-custom py-2 leading-[24px] tracking-[1px]" {...props}>{children}</li>; },
        a({children, ...props}) { return <a className="relative text-rose-400 no-underline hover:text-orange-500 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1.5px] after:bg-orange-500 after:scale-x-0 after:origin-bottom-right after:transition-transform after:duration-200 hover:after:scale-x-100 hover:after:origin-bottom-left" {...props}>{children}</a>; },
        hr({...props}) { return <hr className="my-[15px] h-[3px] bg-gradient-to-r from-rose-500 via-yellow-500 to-blue-500 bg-[length:500%_100%] animate-gradient-x" {...props}/>; },
        div({children, ...props}) { return <div className="font-custom text-base w-full max-w-full text-center whitespace-normal break-words" {...props}>{children}</div>; },
        mark({children, ...props}) { return <mark className="font-custom bg-yellow-200 text-yellow-800 px-[2px] rounded-sm" {...props}>{children}</mark>; },

        img({ ...props}) {
            return (
                <Image
                    className="my-4 rounded-xl shadow-md max-w-[800px] mx-auto select-none"
                    zoomable={true}
                    src={props.src}
                    draggable={false}
                    alt={props.alt}
                    lazy={true}
                    title={props.title}
                />
            );
        },
        table({children, ...props}) {
            return (
                <div className="-mx-4 sm:mx-0 overflow-x-auto rounded-2xl shadow-lg bg-white p-4 my-4">
                    <table
                        className="font-custom  min-w-full sm:table-auto border-separate border-spacing-0"
                        {...props}
                    >
                        {children}
                    </table>
                </div>
            );
        },
        // 表头：左右都有线，首列移除左线，依旧 sticky
        th({children, ...props}) {
            return (
                <th
                    // style 属性提示浏览器进行优化
                    style={{ willChange: 'transform' }}
                    className="sticky top-0 text-center
                      bg-orange-700 text-white font-bold
                      px-2 py-1 text-base md:text-base  sm:text-xs
                      border-b border-gray-200 border-l  first:border-l-0
                      first:rounded-tl-lg last:rounded-tr-lg"
                    {...props}
                >
                    {children}
                </th>
            );
        },
        tr({children, ...props}) { return <tr className="odd:bg-gray-50 even:bg-white hover:bg-gray-100" {...props}>{children}</tr>; },
        td({children, ...props}) { return <td className="font-custom border-b border-gray-200 border-l first:border-l-0 px-2 py-1 text-base md:text-base  sm:text-xs text-gray-700 whitespace-nowrap" {...props}>{children}</td>; },
        code({className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || "");
            if (!match) {
                return <code className="font-custom bg-gray-100 text-red-600 px-1 rounded" {...props}>{children}</code>;
            }
            return <CodeBlock language={match[1]} themeStyle={pros.themeStyle} themeNameDark={pros.themeNameDark} themeNameLight={pros.themeNameLight} value={String(children).replace(/\n$/, "")}/>;
        },
    };

    return (
        <div className="mb-5">
            {pros.markdownText ? (
                <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={[rehypeRaw]}
                    components={components}
                >
                    {pros.markdownText}
                </ReactMarkdown>
            ) : (
                <p className="text-gray-500 italic">Loading content...</p>
            )}
        </div>
    );
});
