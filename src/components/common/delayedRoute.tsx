import React, {
    ReactElement,
    Suspense,
    useEffect,
    useState,
} from "react";
import {useLocation} from "react-router-dom";
import Loading from "./loading";

/**
 * 全局记录：哪些 pathname 已经“完整播放过延迟”。
 * 如果某个 pathname 已在此 Set 中，那么后续 skipOnVisited = true 时就不再延迟。
 */
const visitedPaths = new Set<string>();

/**
 * DelayedRouteProps:
 *   - delay：number —— 强制展示 Loading 的最小时长（毫秒）
 *   - children：ReactElement —— 必须是一个通过 React.lazy() 创建出来的懒加载组件实例，如 <Home />。
 *
 * 思路：
 *   1. 通过 `useLocation()` 监听路径变化，一旦 `location.pathname` 变了，说明路由切换了；
 *   2. 每次路径切换，都把 `showLoader` 设为 `true`、重置定时器；
 *   3. 当达到 `delay` 毫秒后，把 `showLoader` 设为 `false`，这时才真正进入 `<Suspense>{children}</Suspense>`，
 *      如果懒组件没有加载完，Suspense 会继续显示 fallback（Loading）；如果已加载好，就直接渲染。
 *
 * 这样就能「每次路由跳转」都先展示指定时长的 Loading。
 */
interface DelayedRouteProps {
    /**
     * delay：强制展示 Loading 的最小时长（毫秒）。
     * 当 pathname 属于“需要延迟”的那一类时，先展示 delay 毫秒的 Loading，
     * delay 结束后再真正尝试渲染 children。
     */
    delay?: number;
    /**
     * skipOnVisited：是否“跳过已访问过的 pathname”。
     *   - true（默认）：如果当前 pathname 已经在 visitedPaths 中，则直接不延迟，马上渲染 children。
     *   - false：每次访问该 pathname 都延迟，不考虑是否访问过。
     */
    skipOnVisited?: boolean;
    /**
     * children：一个 React.lazy(...) 生成的懒组件实例，例如 <Home/>、<About/> 等。
     * 它会被包在 <Suspense fallback={<Loading/>}> 里；如果未加载完，则显示 Loading。
     */
    children: ReactElement;
}

const DelayedRoute: React.FC<DelayedRouteProps> = ({
                                                       delay = 2000,
                                                       skipOnVisited = false,
                                                       children
                                                   }) => {
    const {pathname} = useLocation();
    // showLoader = true 时，只展示 <Loading />；否则展示 <Suspense>{children}</Suspense>
    const [showLoader, setShowLoader] = useState<boolean>(() => {
        // 如果 skipOnVisited 开启且 pathname 已访问过，则初始化为 false；否则一开始就为 true（播放 Loading）。
        return !(skipOnVisited && visitedPaths.has(pathname));
    });

    useEffect(() => {
        // 每次 pathname 变化，都要重新计算是否需要播放 Loading
        if (skipOnVisited && visitedPaths.has(pathname)) {
            // skipOnVisited 下，且已经访问过该路径 → 直接不延迟
            setShowLoader(false);
            return;
        }

        // 否则：需要延迟。先把 showLoader 设为 true（渲染 Loading），
        // delay 毫秒后切换到 showLoader = false，开始真正渲染 children 了。
        setShowLoader(true);
        const timerId = window.setTimeout(() => {
            setShowLoader(false);
            if (skipOnVisited) {
                // 只有 skipOnVisited=true 时，我们才记录“已播放过延迟”
                visitedPaths.add(pathname);
            }
        }, delay);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [pathname, delay, skipOnVisited]);

    // 只要处于“延迟期”，即 showLoader===true，就先展示 Loading
    if (showLoader) {
        return <Loading/>;
    }

    // 延迟期结束后，再去渲染懒组件
    // 如果懒组件还没下载完，Suspense 会显示它的 fallback（这里同样是 Loading）
    return <Suspense fallback={<Loading/>}>{children}</Suspense>;
};

export default DelayedRoute;
