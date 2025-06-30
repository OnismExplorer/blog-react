import React, { useEffect, useState } from 'react';

interface LoaderProps {
    loading: boolean;
    loader?:React.ReactNode;
    children: React.ReactNode;
}

const Loader: React.FC<LoaderProps> = ({ loading,loader, children }) => {
    const [loaderVisible, setLoaderVisible] = useState(loading)
    const [bodyVisible, setBodyVisible] = useState(!loading)

    useEffect(() => {
        setLoaderVisible(loading)
        const timer = setTimeout(() => {
            setBodyVisible(!loading)
        }, 300)

        return () => clearTimeout(timer)
    }, [loading])

    return (
        <div>
            {/* Loader */}
            <div
                className={`transition-all duration-500 ${loaderVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                style={{ display: loaderVisible ? "block" : "none" }}
            >
                {loader}
            </div>

            {/* Body Content */}
            <div
                className={`transition-all duration-500 ${
                    bodyVisible
                        ? "opacity-100 transform scale-100 translate-y-0"
                        : "opacity-0 transform scale-50 translate-y-1/2 pointer-events-none"
                }`}
                style={{ display: bodyVisible ? "block" : "none" }}
            >
                {children}
            </div>
        </div>
    );
};

export default Loader;
