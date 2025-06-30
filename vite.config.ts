import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import antiDebugPlugin from "./vite-plugin-anti-debug";

// https://vitejs.dev/config/
export default defineConfig(({ mode })=>{

  // 根据当前模式加载对应的 .env 文件
  const env = loadEnv(mode,process.cwd());
  return {
    server: {
      port: 8888, // 指定端口号：8888
      open: true,
      host:true // 开放外界访问
    },
    ssr: {
      noExternal: ['rehype-mermaid']
    },
    define: {
      // 加载环境变量配置
      'process.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL)
    },
    plugins: [
        react(),
        mode === 'production' && antiDebugPlugin(),
    ],
    build: {
      outDir: 'dist',
      terserOptions: {
        compress: {
          // 在生产环境中移除 console.log
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
        }
      },
      sourcemap:'hidden',
    },
    resolve: {
      alias: {
        // 把 "@xxx" 映射到 "项目根/src/xxx"
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@type': path.resolve(__dirname, 'src/type'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@error': path.resolve(__dirname, 'src/error'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@': path.resolve(__dirname, 'src'),
      }
    }
  }
})
