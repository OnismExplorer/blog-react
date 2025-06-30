import {Popover} from "antd";
import {MoonIcon, Settings, SunIcon} from "lucide-react";
import {useThemeMode} from "@hooks/useThemeMode";

const ToggleTheme = () => {
    const { isDark, toggleTheme } = useThemeMode()

    return (
        <div className="fixed right-[1vh] bottom-[1vh] animate-slide-bottom z-[100] cursor-pointer text-lg flex flex-col items-end w-[60px]">
            <Popover
                placement="left"
                content={
                    <div
                        className="flex flex-wrap justify-around text-base px-5"
                        onClick={toggleTheme}
                    >
                        {isDark
                            ? <SunIcon className="animate-rotate hover:text-themeBackground" size={30} />
                            : <MoonIcon className="hover:text-themeBackground" size={30} />}
                    </div>
                }
                mouseLeaveDelay={0.3}
                trigger="hover"
            >
                <Settings
                    aria-hidden={true}
                    className="animate-rotate"
                    size={30}
                    style={{ willChange: 'transform' }}
                />
            </Popover>
        </div>
    );
}

export default ToggleTheme
