const slugMap: Record<string, number> = {};
export function resetSlugs() {
    for (const k in slugMap) delete slugMap[k];
}
// 处理目录标题生成
export function getHeadingId(text: string): string {
    const base = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-");
    const count = (slugMap[base] = (slugMap[base] || 0) + 1);
    return count === 1 ? base : `${base}-${count}`;
}
