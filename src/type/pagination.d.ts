import type React from "react"
import type { ReactNode } from "react"

// 分页模式
export type PaginationMode = "simple" | "full" | "compact" | "minimal" | "custom"

// 分页主题
export type PaginationTheme = "default" | "rounded" | "outlined" | "filled" | "gradient" | "glass"

// 分页大小
export type PaginationSize = "small" | "medium" | "large"

// 分页配置
export interface PaginationConfig {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => ReactNode
  pageSizeOptions?: string[]
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  // 新增：样式配置
  mode?: PaginationMode
  theme?: PaginationTheme
  size?: PaginationSize
  animated?: boolean
  className?: string
  style?: React.CSSProperties
  buttonClassName?: string
  buttonStyle?: React.CSSProperties
  activeClassName?: string
  activeStyle?: React.CSSProperties
  disabledClassName?: string
  disabledStyle?: React.CSSProperties
  // 自定义渲染
  itemRender?: (
    page: number,
    type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
    originalElement: ReactNode,
  ) => ReactNode
  showLessItems?: boolean
  hideOnSinglePage?: boolean
}

// 自定义分页数据结构
export interface CustomPage {
  pageNumber: number
  pageSize: number
  total?: number
}

// 扩展 PaginationConfig
export interface ExtendedPaginationConfig extends PaginationConfig {
  customPage?: CustomPage
  onCustomPageChange?: (page: CustomPage) => void
}
