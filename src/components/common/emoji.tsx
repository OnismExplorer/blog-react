import React, {useEffect, useState} from 'react';
import {useAppContext} from "@hooks/useAppContext";
import {getDownloadUrl} from "@api/resource";

interface EmojiProps {
    showEmoji: boolean;
    onAddEmoji: (key: string) => void;
}

const Emoji: React.FC<EmojiProps> = ({ showEmoji, onAddEmoji }) => {
    const {constant} = useAppContext();
    const [emojiListURL, setEmojiListURL] = useState<{ [key: string]: string }>({});
    const [qiniuDownload,setQiniuDownload] = useState<string>();

    useEffect(() => {
        getDownloadUrl()
            .then((res) => {
                setQiniuDownload(res);
            })
        const getEmojiList = (emojiList: string[]) => {
            const result: { [key: string]: string } = {};
            for (let i = 0; i < emojiList.length; i++) {
                const emojiName = `[${emojiList[i]}]`;
                result[emojiName] = `${qiniuDownload}emoji/q${i + 1}.gif`;
            }
            return result;
        };

        setEmojiListURL(getEmojiList(constant.emojiList));
    }, [constant.emojiList]);

    const addEmoji = (key: string) => {
        onAddEmoji(key); // 将选中的 emoji 键传递给父组件
    };

    return (
        <div>
            {showEmoji && (
                <div className="flex flex-wrap">
                    {Object.entries(emojiListURL).map(([key, value], index) => (
                        <span key={index} className="inline-block cursor-pointer transition-all duration-200 hover:rounded hover:bg-light-gray" onClick={() => addEmoji(key)}>
              <img src={value} alt={key} title={key} className="m-1 align-middle" width="24px" height="24px" />
            </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Emoji;
