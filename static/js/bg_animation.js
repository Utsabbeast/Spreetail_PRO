const canvas = document.createElement('canvas');
canvas.id = 'bg-canvas';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let w, h;
let theme = localStorage.getItem('theme') || 'standard'; 

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Nature Theme Elements ---
const leaves = [];
for(let i=0; i<50; i++) {
    leaves.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: Math.random() * 2 + 1,
        vy: Math.random() * 1 + 0.5,
        size: Math.random() * 5 + 3,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.05 - 0.025
    });
}

function drawNature() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    // Draw far trees (line art)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 2;
    for(let i=0; i<10; i++) {
        let tx = (w / 10) * i + 50;
        ctx.beginPath();
        ctx.moveTo(tx, h);
        ctx.lineTo(tx, h - 200 - Math.random()*100);
        // Branches
        ctx.moveTo(tx, h - 150);
        ctx.lineTo(tx - 30, h - 200);
        ctx.moveTo(tx, h - 180);
        ctx.lineTo(tx + 40, h - 220);
        ctx.stroke();
    }
    
    // Animate leaves
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    leaves.forEach(l => {
        l.x += l.vx;
        l.y += l.vy;
        l.angle += l.rotSpeed;
        if(l.x > w + 20) l.x = -20;
        if(l.y > h + 20) l.y = -20;
        
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size/2, 0, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
    });
}

// --- City Theme Elements ---
const cars = [];
for(let i=0; i<30; i++) {
    cars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        w: Math.random() * 20 + 20,
        h: Math.random() * 10 + 5,
        speed: Math.random() * 4 + 2,
        lane: Math.floor(Math.random() * 10) * 40
    });
}

function drawCity() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    // Draw roads
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    for(let i=0; i<10; i++) {
        let ly = i * 40 + h/4;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(w, ly);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Animate cars
    cars.forEach(c => {
        c.x += c.speed;
        if(c.x > w + 50) c.x = -50;
        ctx.fillStyle = c.speed > 4 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(c.x, c.lane + h/4 - c.h/2, c.w, c.h);
    });
}

// --- Standard Theme ---
let standardTime = 0;
function drawStandard() {
    standardTime += 0.005;
    let cx = w/2 + Math.sin(standardTime) * 200;
    let cy = h/2 + Math.cos(standardTime) * 100;
    
    let gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
    gradient.addColorStop(0, "#1e1b4b");
    gradient.addColorStop(0.5, "#0f172a");
    gradient.addColorStop(1, "#020617");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    ctx.globalCompositeOperation = "screen";
    ctx.beginPath();
    ctx.arc(cx - 300, cy + 200, 400, 0, Math.PI*2);
    ctx.fillStyle = "rgba(79, 70, 229, 0.05)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 400, cy - 100, 500, 0, Math.PI*2);
    ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
}

// --- Space Theme Elements ---
const stars = [];
for(let i=0; i<150; i++) {
    stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}
let comets = [];

function drawSpace() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = 'white';
    stars.forEach(s => {
        s.y -= s.speed;
        if(s.y < 0) { s.y = h; s.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        ctx.fill();
    });
    
    if(Math.random() < 0.005) {
        comets.push({ x: w + 50, y: Math.random() * (h/2), vx: -8, vy: 4, life: 100 });
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    comets.forEach((c, i) => {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx*4, c.y - c.vy*4);
        ctx.stroke();
        c.x += c.vx;
        c.y += c.vy;
        c.life--;
        if(c.life < 0) comets.splice(i, 1);
    });
}

// --- Ocean Theme Elements ---
const bubbles = [];
for(let i=0; i<60; i++) {
    bubbles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 10 + 2,
        speed: Math.random() * 2 + 1,
        wobble: Math.random() * Math.PI * 2
    });
}

function drawOcean() {
    let grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#023c5a'); // darker top
    grad.addColorStop(1, '#041829'); // darker bottom
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    bubbles.forEach(b => {
        b.y -= b.speed;
        b.wobble += 0.05;
        let wx = b.x + Math.sin(b.wobble) * 10;
        
        if(b.y < -20) { b.y = h + 20; b.x = Math.random() * w; }
        
        ctx.beginPath();
        ctx.arc(wx, b.y, b.size, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx - b.size/3, b.y - b.size/3, b.size/4, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    });
}

    if(theme === 'nature') drawNature();
    else if(theme === 'city') drawCity();
    else if(theme === 'space') drawSpace();
    else if(theme === 'ocean') drawOcean();
    else drawStandard();
    
    requestAnimationFrame(animate);
}

animate();

window.setTheme = function(t) {
    theme = t;
    localStorage.setItem('theme', t);
};

// Bind to selector if exists
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('theme-selector');
    if(sel) {
        sel.value = theme;
        sel.addEventListener('change', (e) => window.setTheme(e.target.value));
    }
});
