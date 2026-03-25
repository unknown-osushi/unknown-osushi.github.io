gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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

// 3. Hero Animation
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    tl.to(".hero-title", { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" })
      .to(".hero-text",  { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "-=1.0");
});

// 4. Scroll Reveals
gsap.utils.toArray(".section-title, .act-item, .social-card").forEach(el => {
    gsap.from(el, {
        y: 50, opacity: 0, duration: 1,
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
    });
});

// 5. カーソルエフェクト
(function () {
    var oldBg1 = document.querySelector('.cursor-bg');
    var oldBg2 = document.querySelector('.cursor-bg-2');
    if (oldBg1) oldBg1.style.display = 'none';
    if (oldBg2) oldBg2.style.display = 'none';

    var cv = document.createElement('canvas');
    cv.style.position = 'fixed';
    cv.style.top = '0';
    cv.style.left = '0';
    cv.style.width = '100%';
    cv.style.height = '100%';
    cv.style.pointerEvents = 'none';
    cv.style.zIndex = '2';
    document.body.appendChild(cv);
    var cx = cv.getContext('2d');

    var W = 0, H = 0;
    function resize() {
        W = cv.width  = window.innerWidth;
        H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var mx = -9999, my = -9999;
    var sx = -9999, sy = -9999;
    var onPage = false;
    var particles = [];
    var ripples = [];
    var tick = 0;

    // パーティクルの色：紫系グラデーション
    var COLORS = [
        '138,43,226',   // 紫
        '176,82,255',   // 明るい紫
        '106,13,173',   // 深い紫
        '180,100,255',  // ラベンダー
        '210,140,255',  // 薄紫
    ];

    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; onPage = true; });
    document.addEventListener('mouseleave', function() { onPage = false; });
    document.addEventListener('mouseenter', function(e) { mx = e.clientX; my = e.clientY; onPage = true; });

    // クリックエフェクト（波紋）
    document.addEventListener('click', function(e) {
        for (var i = 0; i < 3; i++) {
            ripples.push({
                x: e.clientX,
                y: e.clientY,
                r: 0,
                maxR: 80 + i * 40,
                life: 1,
                speed: 3 + i * 1.5
            });
        }
        // クリック時にパーティクルを爆発
        for (var j = 0; j < 20; j++) {
            var angle = (j / 20) * Math.PI * 2;
            var speed = Math.random() * 4 + 2;
            var p = new Particle(e.clientX, e.clientY);
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.r = Math.random() * 3 + 1;
            p.decay = Math.random() * 0.02 + 0.01;
            particles.push(p);
        }
    });

    function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2.4;
        this.vy = (Math.random() - 0.5) * 2.4 - 0.7;
        this.life = 1;
        this.decay = Math.random() * 0.016 + 0.01;
        this.r = Math.random() * 2.2 + 0.8;
        this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    Particle.prototype.step = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04;
        this.vx *= 0.98;
        this.life -= this.decay;
    };
    Particle.prototype.draw = function() {
        var radius = this.r * this.life;
        if (radius <= 0) return;
        cx.beginPath();
        cx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        cx.fillStyle = 'rgba(' + this.col + ',' + (this.life * 0.8) + ')';
        cx.fill();
    };

    // グリッド：全画面に常時表示、マウス周辺だけ変形
    var GRID = 36;
    var MAX_R = 180;

    function drawGrid() {
        var cols = Math.ceil(W / GRID) + 1;
        var rows = Math.ceil(H / GRID) + 1;
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var bx = c * GRID;
                var by = r * GRID;
                var nx = bx, ny = by, infl = 0;
                if (onPage && sx > -100) {
                    var dx = bx - sx;
                    var dy = by - sy;
                    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    infl = Math.max(0, 1 - dist / MAX_R);
                    var off = infl * 12;
                    nx = bx - (dx / dist) * off;
                    ny = by - (dy / dist) * off;
                }
                var size = 1.2 + infl * 2.5;
                var alpha, r2, g2, b2;
                if (infl > 0.05) {
                    // 波紋範囲内：紫
                    alpha = 0.08 + infl * 0.5;
                    cx.fillStyle = 'rgba(176,82,255,' + alpha + ')';
                } else {
                    // 通常：全画面に薄く白いドット
                    cx.fillStyle = 'rgba(255,255,255,0.07)';
                }
                cx.beginPath();
                cx.arc(nx, ny, size, 0, Math.PI * 2);
                cx.fill();
            }
        }
    }

    function drawRipples() {
        for (var i = ripples.length - 1; i >= 0; i--) {
            var rp = ripples[i];
            rp.r += rp.speed;
            rp.life -= 0.03;
            if (rp.life <= 0) { ripples.splice(i, 1); continue; }
            cx.beginPath();
            cx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
            cx.strokeStyle = 'rgba(176,82,255,' + (rp.life * 0.6) + ')';
            cx.lineWidth = 1.5;
            cx.stroke();
            // 内側の明るいリング
            if (rp.r > 10) {
                cx.beginPath();
                cx.arc(rp.x, rp.y, rp.r * 0.5, 0, Math.PI * 2);
                cx.strokeStyle = 'rgba(210,140,255,' + (rp.life * 0.3) + ')';
                cx.lineWidth = 1;
                cx.stroke();
            }
        }
    }

    function drawDot() {
        if (!onPage || sx < -100) return;
        cx.beginPath();
        cx.arc(sx, sy, 20, 0, Math.PI * 2);
        cx.strokeStyle = 'rgba(176,82,255,0.2)';
        cx.lineWidth = 1;
        cx.stroke();
        cx.beginPath();
        cx.arc(sx, sy, 4, 0, Math.PI * 2);
        cx.fillStyle = 'rgba(210,140,255,0.95)';
        cx.fill();
    }

    function frame() {
        cx.clearRect(0, 0, W, H);

        if (onPage) {
            if (sx === -9999) { sx = mx; sy = my; }
            sx += (mx - sx) * 0.1;
            sy += (my - sy) * 0.1;
        }

        // グリッドを常に描画
        drawGrid();

        // パーティクル生成
        if (onPage && tick % 2 === 0 && sx > -100) {
            particles.push(new Particle(sx + (Math.random() - 0.5) * 6, sy + (Math.random() - 0.5) * 6));
            particles.push(new Particle(sx + (Math.random() - 0.5) * 6, sy + (Math.random() - 0.5) * 6));
        }

        particles = particles.filter(function(p) { return p.life > 0; });
        particles.forEach(function(p) { p.step(); p.draw(); });

        drawRipples();
        drawDot();
        tick++;
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}());

// --- ページ切り替え ---
const mainContainer = document.getElementById('main-container');
const simPage       = document.getElementById('simulator-page');
const mainNav       = document.getElementById('main-nav');
const backBtn       = document.getElementById('back-btn');
const logoScroll    = document.getElementById('logo-scroll');

gsap.set(simPage, { display: 'none', opacity: 0 });

function goToSimulator() {
    lenis.stop();
    gsap.to(mainContainer, {
        opacity: 0, y: -40, duration: 0.5, ease: "power2.in",
        onComplete: function() {
            mainContainer.style.visibility = 'hidden';
            mainNav.style.display = 'none';
            backBtn.style.display = 'block';
            gsap.set(simPage, { display: 'flex', opacity: 0, y: 40 });
            gsap.to(simPage, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        }
    });
}

function goBack() {
    gsap.to(simPage, {
        opacity: 0, y: -40, duration: 0.5, ease: "power2.in",
        onComplete: function() {
            gsap.set(simPage, { display: 'none' });
            mainNav.style.display = 'flex';
            backBtn.style.display = 'none';
            mainContainer.style.visibility = 'visible';
            gsap.fromTo(mainContainer,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
                  onComplete: function() { lenis.start(); } }
            );
        }
    });
}

const actSimulator = document.getElementById('act-simulator');
if (actSimulator) actSimulator.addEventListener('click', goToSimulator);
if (backBtn)       backBtn.addEventListener('click', goBack);

if (logoScroll) {
    logoScroll.addEventListener('click', function(e) {
        e.preventDefault();
        if (getComputedStyle(simPage).display !== 'none') {
            goBack();
        } else {
            gsap.to(window, { duration: 1.2, scrollTo: { y: 0 }, ease: "expo.out" });
        }
    });
}
