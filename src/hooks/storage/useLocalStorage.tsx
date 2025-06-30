import { useState, useEffect } from 'react';

function jsonParse<T>(value: string | null, fallback: T): T {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch (e) {
        console.warn('useLocalStorage: JSON 解析错误', e);
        return fallback;
    }
}

function jsonStringify<T>(value: T): string {
    try {
        return JSON.stringify(value);
    } catch (e) {
        console.warn('useLocalStorage: JSON 序列化出错', e);
        return '';
    }
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const item = localStorage.getItem(key);
        return jsonParse(item, defaultValue);
    });

    useEffect(() => {
        const json = jsonStringify(storedValue);
        if (json) {
            localStorage.setItem(key, json);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}
