import React, {useState, useEffect, type ReactNode} from "react"

// 分页组件的属性接口定义
interface PaginationProps {
    current?: number // 当前页码
    size?: number // 每页显示的项目数
    total?: number // 总项目数
    buttonCount?: number // 显示的页码按钮数量
    color?: string // 主题颜色
    shape?: "round" | "square" | "rounded" // 按钮形状：圆形、方形或圆角
    prevIcon?: ReactNode // 自定义上一页图标/文本
    nextIcon?: ReactNode // 自定义下一页图标/文本
    onPageChange?: (page: number) => void // 页码变化回调函数
    shadowClassName?: string;
}

const ProPage:React.FC<PaginationProps> = ({
                                       current = 1,
                                       size = 10,
                                       total = 0,
                                       buttonCount = 3,
                                       color = "#3b82f6",
                                       shape = "round",
                                       prevIcon = "👈",
                                       nextIcon = "👉",
                                       shadowClassName = '',
                                       onPageChange,
                                   }: PaginationProps) => {
    // 状态管理
    const [totalSize, setTotalSize] = useState(0) // 总页数
    const [realButtonSize, setRealButtonSize] = useState(0) // 实际显示的按钮数量
    const [animating, setAnimating] = useState(false) // 动画状态

    const getButtonCount = (): number => {
        const count = buttonCount * size;
        return count <= total ? total / size >= size ? 8 : 5 : buttonCount;
    }

    // 计算总页数和实际按钮数量
    useEffect(() => {
        const calculatedTotalSize = Math.ceil(total / size)
        const calculatedRealButtonSize = buttonCount < calculatedTotalSize ? getButtonCount() : calculatedTotalSize

        setTotalSize(calculatedTotalSize)
        setRealButtonSize(calculatedRealButtonSize)
    }, [total, size, buttonCount])

    // 根据形状获取按钮样式
    const getButtonShape = () => {
        switch (shape) {
            case "square":
                return "rounded-none"
            case "rounded":
                return "rounded-md"
            case "round":
            default:
                return "rounded-full"
        }
    }

    // 页码切换处理函数
    const toPage = (flag: number) => {
        let targetPage: number

        if (flag === -1) {
            targetPage = current - 1 // 上一页
        } else if (flag === -2) {
            targetPage = current + 1 // 下一页
        } else {
            targetPage = flag // 指定页码
        }

        // 触发动画效果
        setAnimating(true)
        setTimeout(() => {
            onPageChange?.(targetPage)
            setTimeout(() => {
                setAnimating(false)
            }, 300) // 动画结束后重置状态
        }, 150)
    }

    // 获取导航按钮的宽度样式
    const getNavButtonWidth = (icon: ReactNode) => {
        // 如果是字符串且长度大于2，使用自适应宽度
        if (typeof icon === "string" && icon.length > 2) {
            return "px-3 min-w-[60px]"
        }
        // 否则使用固定宽度
        return "w-10"
    }

    // 渲染页码按钮
    const renderPageNumbers = () => {
        const pages = []
        const halfButtonSize = Math.floor(realButtonSize / 2)
        const buttonShape = getButtonShape()

        // 基础按钮样式 - 使用 flex 居中
        const baseButtonClass = `
    mx-2 list-none border border-gray-300 w-10 h-10 flex items-center justify-center
    ${buttonShape}  text-sm cursor-pointer transition-all duration-300
    ${shadowClassName ? shadowClassName:  'hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/30'}
  `

        if (current === 1) {
            // 当前页是第一页的情况
            for (let index = 1; index <= realButtonSize; index++) {
                const isActive = index === 1
                pages.push(
                    <li
                        key={index}
                        className={`
              ${baseButtonClass}
              ${isActive ? "text-white transform scale-110" : ""}
              ${animating ? "opacity-70 transform scale-95" : "opacity-100"}
            `}
                        style={{
                            backgroundColor: isActive ? color : "",
                            color: isActive ? "white" : "",
                        }}
                        onClick={() => toPage(index)}
                    >
                        {index}
                    </li>,
                )
            }
        } else if (current === totalSize) {
            // 当前页是最后一页的情况
            for (let index = 1; index <= realButtonSize; index++) {
                const pageNumber = current - (realButtonSize - index)
                const isActive = index === realButtonSize
                pages.push(
                    <li
                        key={index}
                        className={`
              ${baseButtonClass}
              ${isActive ? "text-white transform scale-110" : ""}
              ${animating ? "opacity-70 transform scale-95" : "opacity-100"}
            `}
                        style={{
                            backgroundColor: isActive ? color : "",
                            color: isActive ? "white" : "",
                        }}
                        onClick={() => toPage(pageNumber)}
                    >
                        {pageNumber}
                    </li>,
                )
            }
        } else {
            // 当前页在中间的情况 - 修复边界情况的逻辑
            let startPage = Math.max(1, current - halfButtonSize)
            const endPage = Math.min(totalSize, startPage + realButtonSize - 1)

            // 调整起始页，确保显示正确数量的按钮
            if (endPage - startPage + 1 < realButtonSize) {
                startPage = Math.max(1, endPage - realButtonSize + 1)
            }

            for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
                const isActive = pageNumber === current
                pages.push(
                    <li
                        key={pageNumber}
                        className={`
              ${baseButtonClass}
              ${isActive ? "text-white transform scale-110" : ""}
              ${animating ? "opacity-70 transform scale-95" : "opacity-100"}
            `}
                        style={{
                            backgroundColor: isActive ? color : "",
                            color: isActive ? "white" : "",
                        }}
                        onClick={() => toPage(pageNumber)}
                    >
                        {pageNumber}
                    </li>,
                )
            }
        }

        return pages
    }

    // 如果总项目数小于等于每页显示数，不显示分页
    if (total <= size) {
        return null
    }

    // 导航按钮样式 - 使用 flex 居中并动态调整宽度
    const getNavButtonClass = (icon: ReactNode) => `
  mx-2 list-none border border-gray-300 ${getNavButtonWidth(icon)} h-10 
  flex items-center justify-center ${getButtonShape()} text-black text-sm 
  cursor-pointer transition-all duration-300 
  ${shadowClassName ? shadowClassName : 'hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/30'}
  ${animating ? "opacity-70 transform scale-95" : "opacity-100"}
`

    return (
        <div className="flex justify-center">
            <ul className="flex p-0 my-8 items-center">
                {/* 上一页按钮 */}
                {current !== 1 && (
                    <li className={getNavButtonClass(prevIcon)} onClick={() => toPage(-1)} aria-label="上一页">
                        {prevIcon}
                    </li>
                )}

                {/* 页码按钮 */}
                {renderPageNumbers()}

                {/* 下一页按钮 */}
                {current !== totalSize && (
                    <li className={getNavButtonClass(nextIcon)} onClick={() => toPage(-2)} aria-label="下一页">
                        {nextIcon}
                    </li>
                )}
            </ul>
        </div>
    )
}

export default ProPage;
