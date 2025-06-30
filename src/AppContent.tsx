import {ConfigProvider, theme as antdTheme} from "antd";
import zhCN from "antd/locale/zh_CN";
import {AppRouter} from "@hooks/useRouter";
import {StoreProvider} from "@hooks/useStore";
import {useThemeMode} from "@hooks/useThemeMode";

/**
  * 内容组件，处理主题相关逻辑
  */
function AppContent() {
    const {isDark} = useThemeMode();

    return (
        <StoreProvider>
            <ConfigProvider
                locale={zhCN}
                theme={{
                    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                }}
                table={{
                    className: "table-no-scrollbar", // 隐藏下滑滚动条
                }}
            >
                <AppRouter/>
            </ConfigProvider>
        </StoreProvider>
    );
}

export default AppContent;
