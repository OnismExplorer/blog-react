import type { Plugin } from 'vite';

export default function antiDebugPlugin(): Plugin {
    // 将所有反调试逻辑封装在一个 IIFE (立即调用函数表达式) 中，避免污染全局作用域
    const antiDebugCode = `
    (function() {
      // 检查是否在生产环境，Vite 会处理 import.meta.env.PROD
      if (import.meta.env.PROD) {
        // 核心反调试函数
        const setupAntiDebug = () => {
          // 激进的无限 debugger
          const aggressiveDebug = () => {
            // 使用 Function 构造器来隐藏 'debugger' 关键字
            (function() {}).constructor('debugger')();
            // 使用 requestAnimationFrame 创建高频循环，比 setInterval 更难追踪
            requestAnimationFrame(aggressiveDebug);
          };

          // 禁止键盘快捷键
          const blockDevToolsKeys = (e) => {
            if (
              e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c')) || (e.ctrlKey && e.key === 'u')
            ) {
              e.preventDefault();
            }
          };

          // 禁止右键菜单
          const blockContextMenu = (e) => {
            e.preventDefault();
          };

          try {
            // 启动所有保护措施
            aggressiveDebug();
            window.addEventListener('keydown', blockDevToolsKeys);
            window.addEventListener('contextmenu', blockContextMenu);
          } catch (err) {
            // 在某些环境中，例如 Node.js 或特定浏览器设置下，可能会出错
            // 这里捕获异常以防止应用崩溃
            console.warn('Anti-debug measures failed to initialize.', err);
          }
        };
        
        // 启动
        setupAntiDebug();
      }
    })();
  `;

    return {
        name: 'vite-plugin-anti-debug',
        // 'transform' 钩子会在每个模块加载时调用
        transform(code, id) {
            // 使用正则匹配找到项目的入口文件。通常是 src/main.tsx 或 src/main.ts
            const entryFileRegex = /src\/main\.(ts|tsx|js|jsx)$/;

            if (entryFileRegex.test(id)) {
                // 在入口文件的最顶部注入反调试代码
                return {
                    code: `${antiDebugCode}\n${code}`,
                    // 修改了代码，最好清除 sourcemap，或者让 Vite 重新生成
                    map: null,
                };
            }
            // 对于其他文件，不进行任何操作
            return null;
        },
    };
}
