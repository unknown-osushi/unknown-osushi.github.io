gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Smooth Scroll
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

// 2. Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'));
    });
});

// 🌟 3. Hero Animation (浮き出る演出) 🌟
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    
    tl.to(".hero-title", {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out"
    })
    .to(".hero-text", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
    }, "-=1.0"); // タイトルが出る途中でテキストも開始
});



// 5. Scroll Reveals (他の要素のフェードイン)
gsap.utils.toArray(".section-title, .act-item, .social-card").forEach(el => {
    gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

// 6. マウス追従背景のアニメーション (極上の滑らか版)
const bg1 = document.querySelector('.cursor-bg');
const bg2 = document.querySelector('.cursor-bg-2');

if(bg1 && bg2) {
    const xSet1 = gsap.quickSetter(bg1, "x", "px");
    const ySet1 = gsap.quickSetter(bg1, "y", "px");
    const xSet2 = gsap.quickSetter(bg2, "x", "px");
    const ySet2 = gsap.quickSetter(bg2, "y", "px");

    let mouseX = 0;
    let mouseY = 0;

    // 現在の光の座標を保持する変数（これを使って慣性を作る）
    let pos1 = { x: 0, y: 0 };
    let pos2 = { x: 0, y: 0 };

    window.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        // 滑らかさの調整（数値が小さいほど、ゆっくり・ヌルヌル動く）
        const lerp1 = 0.06; // 紫の光の追従速度
        const lerp2 = 0.04; // 青の光の追従速度（さらに遅くしてズレを作る）

        // 目標地点 (マウス位置 - 半径)
        const targetX1 = mouseX - 325;
        const targetY1 = mouseY - 325;
        const targetX2 = mouseX - 300;
        const targetY2 = mouseY - 300;

        // 線形補間（Lerp）計算：現在地 + (目標 - 現在地) * 滑らかさ
        pos1.x += (targetX1 - pos1.x) * lerp1;
        pos1.y += (targetY1 - pos1.y) * lerp1;
        pos2.x += (targetX2 - pos2.x) * lerp2;
        pos2.y += (targetY2 - pos2.y) * lerp2;

        // 座標をセット
        xSet1(pos1.x);
        ySet1(pos1.y);
        xSet2(pos2.x);
        ySet2(pos2.y);
    });
}

// 瞬間移動に見えない、かつ「速い」設定
const logoScroll = document.getElementById('logo-scroll');

if (logoScroll) {
    logoScroll.addEventListener('click', (e) => {
        e.preventDefault(); 

        gsap.to(window, {
            duration: 1.2,       // 時間を少し戻して「動いている感」を出す
            scrollTo: { y: 0 }, 
            ease: "expo.out"     // 🌟 最初が非常に速く、最後が極めて滑らかなイージング
        });
    });
}

