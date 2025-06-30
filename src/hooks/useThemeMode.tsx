import { useTheme } from 'next-themes'
import { useLocalStorage } from '@hooks/storage/useLocalStorage'
import { useCallback, useEffect } from 'react'
import { message } from 'antd'

export function useThemeMode() {
    const { theme,setTheme, resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    const [userTheme, setUserTheme] = useLocalStorage<string>('userTheme', '')

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark'
        setTheme(next)
        setUserTheme(next)
    }

    const isNight = useCallback(() => {
        const h = new Date().getHours()
        return h > 21 || h < 7
    }, [])

    useEffect(() => {
        // 确保主题已经解析完成再进行操作
        if (theme === undefined) return

        // 首次加载时，如果用户没指定，则根据时间自动切换
        if (!userTheme) {
            const next = isNight() ? 'dark' : 'light'
            setTheme(next)
            setUserTheme(next)
            if (next === 'dark') {
                message.success('已自动切换为黑夜模式，早点休息，保护眼睛哟~', 2).then();
            }
        } else {
            setTheme(userTheme)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { theme: resolvedTheme, isDark, toggleTheme }
}
