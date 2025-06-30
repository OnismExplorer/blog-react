import {
    oneDark,
    oneLight,
    dracula,
    okaidia,
    vscDarkPlus,
    xonokai,
    cb,
    gruvboxDark,
    gruvboxLight,
    materialLight,
    materialDark
} from 'react-syntax-highlighter/dist/esm/styles/prism';

export const lightThemes = {
    oneLight,
    okaidia,
    gruvboxLight,
    materialLight,
}

export const darkThemes = {
    oneDark,
    dracula,
    vscDarkPlus,
    gruvboxDark,
    materialDark,
};

export const prismThemes = {
    oneDark,
    oneLight,
    dracula,
    okaidia,
    vscDarkPlus,
    xonokai,
    cb,
    gruvboxDark,
};

// 导出所有可用主题名列表，方便 IDE 智能提示
// export type PrismThemeName = keyof typeof prismThemes
export type DarkThemeName = keyof typeof darkThemes;   // "oneDark" | "dracula" | "vscDarkPlus" | "gruvboxDark"
export type LightThemeName = keyof typeof lightThemes; // "oneLight" | "coy" | "okaidia"
