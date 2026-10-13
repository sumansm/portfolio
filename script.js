document.documentElement.classList.add('js');

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fine = matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scroll reveal (staggered within siblings) */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    const meter = $('.meter', e.target);
    if (meter) $('i', meter).style.width = meter.dataset.level + '%';
    const num = $('[data-count]', e.target);
    if (num) countUp(num);
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach((el) => {
  const idx = [...el.parentElement.children].filter((c) => c.classList.contains('reveal')).indexOf(el);
  el.style.setProperty('--d', Math.min(idx, 6) * 0.08 + 's');
  io.observe(el);
});

function countUp(el) {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  const start = performance.now(), dur = 1600;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

/* Nav: progress bar, scrolled state, active link */
const bar = $('.progress'), nav = $('#nav');
const links = $$('.nav-pill a');
const sections = links.map((a) => $(a.getAttribute('href')));
function onScroll() {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  nav.style.paddingBlock = h.scrollTop > 40 ? '10px' : '';
  const y = h.scrollTop + innerHeight * 0.4;
  links.forEach((a, i) => a.classList.toggle('active', sections[i].offsetTop <= y && sections[i].offsetTop + sections[i].offsetHeight > y));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Mobile menu */
const burger = $('#burger'), menu = $('#navLinks');
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', open);
  menu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
links.forEach((a) => a.addEventListener('click', () => setMenu(false)));

if (fine) {
  /* Cursor glow */
  const glow = $('.cursor-glow');
  addEventListener('pointermove', (e) => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  /* Portrait parallax */
  const portrait = $('#portrait');
  $('.hero').addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    portrait.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  $('.hero').addEventListener('pointerleave', () => (portrait.style.transform = ''));

  /* Card tilt + spotlight */
  $$('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 6}deg) rotateX(${(0.5 - py) * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => (card.style.transform = ''));
  });

  /* Magnetic buttons */
  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    btn.addEventListener('pointerleave', () => (btn.style.transform = ''));
  });
}

/* Placeholder project links shouldn't jump to top */
$$('.project[href="#"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

/* Contact form: validates, then opens the visitor's mail client */
const form = $('#contactForm'), note = $('#formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(form);
  const name = f.get('name').trim(), email = f.get('email').trim(), message = f.get('message').trim();
  let ok = true;
  $$('input, textarea', form).forEach((el) => {
    const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
    el.classList.toggle('invalid', bad);
    if (bad) ok = false;
  });
  note.classList.toggle('err', !ok);
  if (!ok) { note.textContent = 'Please fill in all fields with valid details.'; return; }
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  location.href = `mailto:sumansmr428@gmail.com?subject=${subject}&body=${body}`;
  note.textContent = 'Opening your email app — thanks for reaching out!';
  form.reset();
});
