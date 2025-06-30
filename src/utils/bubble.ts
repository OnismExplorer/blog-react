interface Position {
    x: number;
    y: number;
}

class Bubble {
    pos: Position;
    alpha: number = 0;  // 添加默认值
    alpha_change: number = 0;  // 添加默认值
    scale: number = 0;  // 添加默认值
    scale_change: number = 0;  // 添加默认值
    speed: number = 0;  // 添加默认值

    constructor(width: number, height: number) {
        this.pos = {} as Position;
        this.init(width, height);
    }

    init(width: number, height: number): void {
        this.pos.x = Math.random() * width;
        this.pos.y = height + Math.random() * 100;
        this.alpha = 0.1 + Math.random() * 0.5; // 气泡透明度
        this.alpha_change = 0.0002 + Math.random() * 0.0005; // 气泡透明度变化速度
        this.scale = 0.2 + Math.random() * 0.8; // 气泡大小
        this.scale_change = Math.random() * 0.002; // 气泡大小变化速度
        this.speed = 0.1 + Math.random() * 0.4; // 气泡上升速度
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.alpha <= 0) {
            this.init(ctx.canvas.width, ctx.canvas.height);
        }
        this.pos.y -= this.speed;
        this.alpha -= this.alpha_change;
        this.scale += this.scale_change;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.scale * 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
    }
}

if (document.querySelector(".author-content.author-content-item.single")) {
    const canvas = document.createElement("canvas");
    canvas.id = "header_canvas";
    canvas.style.position = "absolute";
    canvas.style.bottom = "0";
    canvas.width = 844;
    canvas.height = 346;
    document.querySelector(".author-content.author-content-item.single")?.appendChild(canvas);

    const parent = document.querySelector(".author-content.author-content-item.single")?.parentNode;
    if (parent instanceof HTMLElement) {
        parent.className = "thumbnail_canvas";

        (() => {
            let ctx: CanvasRenderingContext2D | null;
            let width: number;
            let height: number;
            let bubbles: Bubble[] = [];
            const animateHeader = true; // 改为 const

            const initHeader = (): void => {
                const canvasElement = document.getElementById("header_canvas") as HTMLCanvasElement;
                const panel = document.querySelector(".thumbnail_canvas");
                if (panel instanceof HTMLElement) {
                    width = panel.offsetWidth;
                    height = panel.offsetHeight;
                    const canvasElement1 = document.getElementById("header_canvas") as HTMLCanvasElement;
                    if (canvasElement1) {
                        canvasElement1.width = width;
                        canvasElement1.height = height;
                    }
                }
                if (canvasElement) {
                    ctx = canvasElement.getContext("2d");
                    if (ctx) {
                        const numBubbles = Math.floor(width * 0.04);
                        bubbles = Array.from({ length: numBubbles }, () => new Bubble(width, height));
                        animate();
                    }
                }
            };

            const animate = (): void => {
                if (animateHeader && ctx) {  // 确保 ctx 不为 null
                    ctx.clearRect(0, 0, width, height);
                    bubbles.forEach(bubble => {
                        if (ctx) { // 额外检查 ctx
                            bubble.draw(ctx);
                        }
                    });
                }
                requestAnimationFrame(animate);
            };

            window.onresize = (): void => {
                const panel = document.querySelector(".thumbnail_canvas");
                if (panel instanceof HTMLElement) {
                    width = panel.offsetWidth;
                    height = panel.offsetHeight;
                    const canvasElement = document.getElementById("header_canvas") as HTMLCanvasElement;
                    if (canvasElement) {
                        canvasElement.width = width;
                        canvasElement.height = height;
                    }
                }
            };

            initHeader();
        })();
    }
}
