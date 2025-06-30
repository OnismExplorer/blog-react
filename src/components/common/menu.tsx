import React, {createContext, FC, ReactNode, useContext, useEffect, useState} from 'react';

type MenuMode = 'horizontal' | 'vertical';

export interface MenuItemType {
    label: ReactNode;
    key: string;
    icon?: ReactNode;
    disabled?: boolean;
    items?: MenuItemType[];
}

export interface MenuProps {
    mode?: MenuMode;
    defaultSelectedKeys?: string[];
    defaultOpenKeys?: string[];
    onClick?: (key: MenuItemType) => void;
    items?: MenuItemType[];
    children?: ReactNode;
    className?: string;
    styles?: React.CSSProperties;
    /** 是否开启选中高亮效果，默认 false，开启后点击某项会保持高亮 */
    highlightable?: boolean;
    /** 高亮时的样式类名，自定义。如：'bg-red-500 text-white' */
    highlightClassName?: string;
    underlinable?: boolean; // 是否开启下划线
    underlineClassName?: string; // 下划线样式
    itemClassName?: string | Record<string, string>; // 菜单子项样式
    /**
     * Customize label styles globally or per key.
     * - string: applied to all labels
     * - Record<key, className>: applied per-item key
     */
    labelClassName?: string | Record<string, string>;
}

export interface MenuItemProps {
    eventItem?: MenuItemType;
    disabled?: boolean;
    onClick?: (key?: MenuItemType) => void;
    className?: string;
    children?: ReactNode;
}

interface IMenuContext {
    selectedKeys: string[];
    openKeys: string[];
    underlinable?: boolean;
    underlineClassName?: string;
    mode: MenuMode;
    onSelect: (item: MenuItemType) => void;
    onOpenChange: (key: string) => void;
    itemClassName?: string | Record<string, string>;
    labelClassName?: string | Record<string, string>;

    // —— 新增的高亮内容 —— //
    highlightable?: boolean;
    highlightClassName?: string;
}

const MenuContext = createContext<IMenuContext>({
    selectedKeys: [],
    openKeys: [],
    mode: 'vertical',
    onSelect: () => {},
    onOpenChange: () => {},
    underlinable: false,
    underlineClassName: '',
    // 高亮功能默认 false，样式为空
    highlightable: false,
    highlightClassName: '',
});

const renderItems = (items: MenuItemType[]): ReactNode =>
    items.map((item) => {
        if (item.items && item.items.length) {
            return (
                <SubMenu key={item.key} eventKey={item.key} title={item.label}>
                    {renderItems(item.items)}
                </SubMenu>
            );
        }
        return (
            <MenuItem key={item.key} eventItem={item} disabled={item.disabled}>
                {item.icon} {item.label}
            </MenuItem>
        );
    });

export const Menu: FC<MenuProps> = ({
                                        mode = 'vertical',
                                        defaultSelectedKeys = [],
                                        defaultOpenKeys = [],
                                        onClick,
                                        items,
                                        children,
                                        className = '',
                                        styles,
                                        underlinable = false,
                                        underlineClassName = '',
                                        itemClassName,
                                        labelClassName,

                                        // —— 新增 —— //
                                        highlightable = false,
                                        highlightClassName = '',

                                    }) => {
    // 选中项的 key，只保留一个
    const [selectedKeys, setSelectedKeys] = useState<string[]>(defaultSelectedKeys);
    const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);


    const handleSelect = (item: MenuItemType) => {
        setSelectedKeys([item.key]);
        onClick?.(item);
    };

    const handleOpenChange = (key: string) =>
        setOpenKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );

    const baseClasses = [
        mode === 'horizontal' ? 'flex space-x-2 py-2' : 'flex flex-col py-0.5',
        className,
        'my-auto mx-auto',
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
        <ul className={baseClasses} style={styles}>
            <MenuContext.Provider
                value={{
                    selectedKeys,
                    openKeys,
                    mode,
                    onSelect: handleSelect,
                    onOpenChange: handleOpenChange,
                    itemClassName,
                    underlinable,
                    underlineClassName,
                    labelClassName,

                    // —— 将父组件传入的高亮配置放到上下文里 —— //
                    highlightable,
                    highlightClassName,
                }}
            >
                {items ? renderItems(items) : children}
            </MenuContext.Provider>
        </ul>
    );
};

export const MenuItem: FC<React.PropsWithChildren<MenuItemProps>> = ({
                                                                         eventItem,
                                                                         disabled,
                                                                         onClick,
                                                                         className,
                                                                         children,
                                                                     }) => {
    const {
        selectedKeys,
        onSelect,
        itemClassName,
        underlinable,
        underlineClassName,
        labelClassName,
        highlightable,
        highlightClassName,
    } = useContext(MenuContext);

    // li 基础样式
    const liClasses = [
        'px-3 cursor-pointer select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    // 只有在 eventItem 存在时，才从 itemClassName 中取对应的 key
    const wrapperClass =
        eventItem && itemClassName
            ? typeof itemClassName === 'string'
                ? itemClassName
                : itemClassName[eventItem.key] || ''
            : '';

    // 只有在 eventItem 存在时，才从 labelClassName 中取对应的 key
    const customLabelClass =
        className
            ? className // 优先使用传给当前 MenuItem 的 className
            : eventItem && labelClassName
                ? typeof labelClassName === 'string'
                    ? labelClassName
                    : labelClassName[eventItem.key] || ''
                : '';

    // 高亮样式：如果开启 highlightable 且当前 key 在 selectedKeys，就把 highlightClassName 或默认样式加上
    const isSelected = eventItem ? selectedKeys.includes(eventItem.key) : false;
    const defaultHighlight = 'px-3 py-1 rounded-md bg-blue-500 text-white';
    const appliedHighlight = highlightable || highlightClassName
        ? highlightClassName || defaultHighlight
        : '';

    // 下划线动画样式
    const defaultUnderline =
        "after:content-[''] after:rounded-md after:block after:absolute after:bottom-0 after:h-1 after:bg-themeBackground after:w-full after:max-w-0 after:transition-all after:duration-300 after:ease-in-out after:hover:max-w-full";
    const underlineStyles = (underlinable || underlineClassName) && !isSelected ? underlineClassName || defaultUnderline : '';

    // 最终要给 <div> 加的「高亮 + 自定义 wrapper + 下划线」类名
    const highlightAndWrapper = `
    relative inline-block group py-3 
    ${wrapperClass} 
    ${underlineStyles}
    ${isSelected ? appliedHighlight : ''} 
  `.trim();

    // 渲染 children：如果是有效的 React 元素，就合并 className，否则直接用 <span>
    let labelContent: React.ReactNode;
    if (React.isValidElement(children)) {
        const child = children as React.ReactElement;
        const combinedClass = [child.props.className, customLabelClass]
            .filter(Boolean)
            .join(' ');
        labelContent = React.cloneElement(child, { className: combinedClass });
    } else {
        labelContent = <span className={customLabelClass}>{children}</span>;
    }

    const handleClick = () => {
        if (disabled) return;

        if (onClick) {
            onClick(eventItem);
        }
        if (eventItem) {
            onSelect(eventItem);
        }
    };

    return (
        <li className={liClasses} onClick={handleClick}>
            <div className={highlightAndWrapper}>{labelContent}</div>
        </li>
    );
};

export const SubMenu: FC<React.PropsWithChildren<{ eventKey: string; title: ReactNode }>> = ({
                                                                                                 eventKey,
                                                                                                 title,
                                                                                                 children,
                                                                                             }) => {
    const { openKeys, onOpenChange, mode } = useContext(MenuContext);
    const isOpen = openKeys.includes(eventKey);

    const titleClasses = [
        'px-3 py-3 cursor-pointer select-none rounded flex justify-between items-center',
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
        <li>
            <div className={titleClasses} onClick={() => onOpenChange(eventKey)}>
                <span>{title}</span>
                <span
                    className={`transition-transform duration-200 px-2 ${
                        isOpen ? 'rotate-90 transform' : ''
                    }`}
                >
          {'>'}
        </span>
            </div>
            {isOpen && (
                <ul
                    className={[
                        'pl-4 border-l',
                        mode === 'vertical' ? 'flex flex-col' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .trim()}
                >
                    {children}
                </ul>
            )}
        </li>
    );
};
