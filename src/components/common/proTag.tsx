import React, {useEffect, useState} from 'react';

interface ProTagProps {
    info?: string;
    color?: string;
    className?: string;
}

const ProTag: React.FC<ProTagProps> = ({
                                           info = 'Onism',
                                           color = 'bg-orange-500',
                                           className = ''
                                       }) => {
    const [bgColor, setBgColor] = useState<string>('');

    useEffect(() => {
        setBgColor(color || '');
    }, [color]);

    return (
        <div
            className={`cursor-pointer text-white rounded-lg hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 inline-flex items-center ${bgColor ? bgColor : ''} ${className}`}
            style={{background: bgColor}}
        >
            <span className="px-2 py-1">🔖 {info}</span>
        </div>
    );
};

export default ProTag;
