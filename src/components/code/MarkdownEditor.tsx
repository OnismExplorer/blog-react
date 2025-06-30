import {Highlighter, Smile} from "lucide-react";
import {MdEditor, UploadImgCallBack} from "md-editor-rt";
import React, {useEffect, useState} from "react";
import { ExportPDF } from '@vavt/rt-extension';
import 'md-editor-rt/lib/style.css';
import { Emoji } from '@vavt/rt-extension';
import { Mark } from '@vavt/rt-extension';
import '@vavt/rt-extension/lib/asset/ExportPDF.css';
import '@vavt/rt-extension/lib/asset/Emoji.css';
import {useAppContext} from "@hooks/useAppContext";
import {useThemeMode} from "@hooks/useThemeMode";
import {useStore} from "@hooks/useStore";


interface Props {
    content: string;
    handleChange: (value: string) => void;
    uploadImage?: (image: string | File) => Promise<string>; // 上传图片逻辑
    codeTheme?: 'atom' | 'a11y' | 'github' | 'gradient' | 'kimbie' | 'paraiso' | 'qtcreator' | 'stackoverflow'
}

/**
 * 根据 md-editor-rt 封装的 Markdown 编辑器
 */
const MarkdownEditor: React.FC<Props> = ({
                                             content = '',
                                             codeTheme = 'github',
                                             handleChange,
                                             uploadImage,
                                         }) => {
    const store = useStore();
    const {isDark} = useThemeMode();
    const {time} = useAppContext();
    const [currentTime, setCurrentTime] = useState<string>();

    // 新增时间更新逻辑
    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTime(time.getTimeString('chinese') + " " + time.getWeekdayName()), 1000)
        return () => clearInterval(intervalId);
    }, [time]);

    // 临时保存文件
    const readFileAsDataURL = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });


    const handleUploadImage = async (files:File[],callback:UploadImgCallBack) => {
        if (!files.length) return [];
        try {
            const urls = await Promise.all(
                files.map(async (file) => {
                    if (uploadImage) {
                        // 上传图片处理
                        return await uploadImage(file);
                    } else {
                        return await readFileAsDataURL(file);
                    }
                })
            );
            // 通知编辑上传的图片 URL
            callback(urls.map((url,index) => ({
                url:url,
                alt:`${store.state.webInfo.webName}_${Date.now()+index}`,
                title:`文章图片-${index}`
            })));
        } catch (error) {
            console.error('上传图片失败:', error);
            // 将失败通知编辑器
            callback([]);
            throw new Error('上传图片失败！')
        }
    }

    /**
     * 处理拖拽事件
     */
    const handleDrop = async (
        e: DragEvent
    ) => {
        e.preventDefault();

        // 如果是文本则直接复制进来
        const text = e.dataTransfer!.getData('text/plain');
        if (text) {
            handleChange(content + '\n' + text);
            return;
        }

        // 是图片则进行上传
        const files = Array.from(e.dataTransfer!.files).filter(file =>
            file.type.startsWith('image/')
        );
        if (files.length === 0) return;

        // 上传图片并获取 URL
        try {
            const urls: string[] = await Promise.all(
                files.map(async file => (
                    uploadImage ? await uploadImage(file) : await readFileAsDataURL(file)
                ))
            );

            // 为每个图像生成 Markdown 并附加到内容
            const markdownImages = urls.map((url,index) => `![${store.state.webInfo.webName}-${Date.now()+index}](${url})`).join('\n');
            handleChange(content + '\n' + markdownImages);
        } catch (error) {
            console.error('上传图片失败:', error);
        }
    };

    return (
        <div className='w-full'>
            <MdEditor
                value={content}
                theme={isDark ? 'dark' : 'light'}
                codeTheme={codeTheme}
                onChange={(e) => handleChange(e)}
                toolbarsExclude={['save', 'github', 'htmlPreview', 'pageFullscreen', 'fullscreen']}
                placeholder='开始记录奇思妙想...'
                tableShape={[6, 4, 10, 8]}
                // transformImgUrl={uploadImage}
                showToolbarName={true}
                onDrop={(e) => handleDrop(e)}
                onUploadImg={handleUploadImage}
                toolbars={['bold','underline','italic','strikeThrough','-',
                    'title',1,2,'sup','sub','quote','unorderedList','orderedList','-',
                    'task','codeRow','code','link','image','table','mermaid','katex','-',
                    'revoke','next',
                    '=','-',0,'prettier','preview','previewOnly','catalog']}
                defToolbars={[
                    <ExportPDF key="ExportPDF" value={content} />,
                    <Mark title='mark' key="Mark" trigger={<Highlighter size={19} className='mb-0.5'><span style={{fontSize: '20px'}}>mark</span></Highlighter>} />,
                    <Emoji key="Emoji" trigger={<Smile size={19}  className='mb-0.5'><span>emoji</span></Smile>}/>
                ]}
                footers={['markdownTotal',0,'=','scrollSwitch']}
                defFooters={[<span>{currentTime}</span>]}
            />
        </div>
    )
}

export default MarkdownEditor;
