import {PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter';

import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import groovy from 'react-syntax-highlighter/dist/esm/languages/prism/groovy';

// …如果还需要更多可参考下面“可用语言列表”自行添加

// 建立映射表：key 为 language prop 的取值
const languages: Record<string, any> = {
    bash,
    sql,
    javascript,
    jsx,
    typescript,
    tsx,
    python,
    java,
    cpp,
    css,
    html,
    json,
    markdown,
    groovy,
    go,
    yaml,
};

export const sqlAliases: string[] = ['mysql','orcale','sql server','pgsql','postgresql','sqlLite'];

// 注册函数：遍历所有映射并注册
export function registerAllLanguages(): void {
    Object.entries(languages).forEach(([name, lang]) => {
        SyntaxHighlighter.registerLanguage(name, lang);
    });
}
