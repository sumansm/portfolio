/* ---------- the question ---------- */
const yes = document.getElementById('yes');
const no = document.getElementById('no');
const prompt_ = document.getElementById('prompt');
const face = document.getElementById('face');
const win = document.getElementById('win');

const lines = [
  "Are you sure? 🥺",
  "Really really sure?? Think again 😢",
  "I literally made a whole website for you 😭",
  "My heart just fell off. Please put it back 💔",
  "I'll buy you chocolates 🍫 …and pizza 🍕",
  "Is the No button even working? Try Yes, it's much shinier ✨",
  "Okay the No button is scared of you now 😳",
  "Fine, I removed No. You only have one choice 😈",
];
const faces = ["🥺", "😢", "😭", "💔", "🥹", "🙄", "😳", "😈"];
let n = 0;

function say(text) {
  prompt_.textContent = text;
  prompt_.classList.remove('show');
  void prompt_.offsetWidth; // restart the pop animation
  prompt_.classList.add('show');
}

function dodge() {
  const x = (Math.random() - 0.5) * 260;
  const y = (Math.random() - 0.5) * 140;
  no.style.transform = `translate(${x}px, ${y}px) scale(${Math.max(.5, 1 - n * .08)})`;
}

no.addEventListener('click', () => {
  n++;
  const i = Math.min(n - 1, lines.length - 1);
  say(lines[i]);
  face.textContent = faces[i];
  yes.style.fontSize = (1.2 + n * 0.3) + 'rem';
  yes.style.padding = (14 + n * 4) + 'px ' + (36 + n * 10) + 'px';
  no.style.fontSize = Math.max(.6, 1.1 - n * .08) + 'rem';
  if (n >= 3) dodge();
  if (n >= lines.length) no.classList.add('gone');
});
['pointerenter', 'touchstart'].forEach(ev =>
  no.addEventListener(ev, () => { if (n >= 3) dodge(); }, { passive: true }));

yes.addEventListener('click', celebrate);
document.getElementById('again').addEventListener('click', celebrate);
document.getElementById('close').addEventListener('click', () => {
  win.classList.remove('show');
  document.body.style.overflow = '';
  stopCelebration();
});

/* ---------- canvas effects ---------- */
const cv = document.getElementById('fx');
const ctx = cv.getContext('2d');
let W, H, parts = [], raf = null, timers = [];
const COLORS = ['#ff4d8d', '#ffb3d1', '#ffd166', '#06d6a0', '#4cc9f0', '#fff', '#ff2d6f', '#b388ff'];
const rand = (a, b) => a + Math.random() * (b - a);

function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', resize); resize();

function confetti(x, y, count, angle, spread, power) {
  for (let i = 0; i < count; i++) {
    const a = angle + rand(-spread, spread);
    const s = rand(power * .4, power);
    parts.push({ t: 'rect', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .25, drag: .985,
      w: rand(6, 12), h: rand(4, 8), rot: rand(0, 6), vr: rand(-.3, .3),
      c: COLORS[Math.random() * COLORS.length | 0], life: rand(150, 260), max: 260 });
  }
}
function firework(x, y) {
  const c = COLORS[Math.random() * COLORS.length | 0];
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2, s = rand(2, 7);
    parts.push({ t: 'dot', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .06, drag: .96,
      r: rand(1.5, 3), c, life: rand(50, 90), max: 90 });
  }
}
function emojiRain(count) {
  const set = ['💖', '💗', '💕', '💘', '💞', '🌹', '✨', '🎉'];
  for (let i = 0; i < count; i++)
    parts.push({ t: 'emoji', e: set[Math.random() * set.length | 0], x: rand(0, W), y: rand(-H * .3, -20),
      vx: rand(-.5, .5), vy: rand(2, 5), g: 0, drag: 1, size: rand(20, 44), life: 400, max: 400 });
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter(p => p.life > 0 && p.y < H + 60);
  for (const p of parts) {
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.life--;
    ctx.globalAlpha = Math.min(1, p.life / (p.max * .35));
    if (p.t === 'rect') {
      p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    } else if (p.t === 'dot') {
      ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    } else {
      ctx.font = p.size + 'px serif'; ctx.fillText(p.e, p.x, p.y);
    }
  }
  ctx.globalAlpha = 1;
  raf = parts.length || timers.length ? requestAnimationFrame(loop) : null;
}
function ensureLoop() { if (!raf) raf = requestAnimationFrame(loop); }

function stopCelebration() { timers.forEach(clearInterval); timers = []; }

function celebrate() {
  stopCelebration();
  win.classList.add('show');
  document.body.style.overflow = 'hidden';
  document.body.classList.remove('shake'); void document.body.offsetWidth;
  document.body.classList.add('shake');

  // opening blast: cannons from both corners + fireworks
  for (let i = 0; i < 4; i++) setTimeout(() => {
    confetti(0, H, 120, -Math.PI / 3, .5, 22);
    confetti(W, H, 120, -2 * Math.PI / 3, .5, 22);
  }, i * 250);
  for (let i = 0; i < 6; i++) setTimeout(() => firework(rand(W * .1, W * .9), rand(H * .1, H * .5)), i * 200);
  emojiRain(40);

  // keep it going for ~15 seconds
  let ticks = 0;
  timers.push(setInterval(() => {
    firework(rand(W * .1, W * .9), rand(H * .1, H * .55));
    if (ticks % 2 === 0) { confetti(0, H, 40, -Math.PI / 3, .5, 20); confetti(W, H, 40, -2 * Math.PI / 3, .5, 20); }
    if (ticks % 3 === 0) emojiRain(12);
    if (++ticks > 36) stopCelebration();
  }, 400));
  ensureLoop();
}

/* ---------- heart trail ---------- */
let last = 0;
function trail(x, y) {
  const now = Date.now(); if (now - last < 70) return; last = now;
  const s = document.createElement('span');
  s.className = 'trail'; s.textContent = ['💖', '💗', '✨'][Math.random() * 3 | 0];
  s.style.left = x + 'px'; s.style.top = y + 'px';
  document.body.appendChild(s); setTimeout(() => s.remove(), 1000);
}
addEventListener('pointermove', e => trail(e.clientX, e.clientY));

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.stat, .item, .flip, .letter, .ask-card, .finale > *').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 0.1 + 's';
  io.observe(el);
});
