import { useState, useEffect } from 'react';

export function useSessionStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(() => {
        const json = sessionStorage.getItem(key);
        return json ? JSON.parse(json) : defaultValue;
    });

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}
