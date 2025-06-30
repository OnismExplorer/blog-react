let titleTime: number; // setTimeout 返回的是 number 类型
const OriginTitle = document.title;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "相思似海深，旧事如天远";
        clearTimeout(titleTime);
    } else {
        document.title = "浮云一别后，流水十年间";
        titleTime = window.setTimeout(() => {
            document.title = OriginTitle;
        }, 2000); // 2e3 表示 2000 毫秒
    }
});
