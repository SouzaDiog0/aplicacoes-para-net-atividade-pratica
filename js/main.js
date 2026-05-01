/* ================================================================
   CUSTOM VIDEO PLAYER
   ================================================================ */
(function initVideoPlayer() {
  const player   = document.getElementById('video-player');
  if (!player) return;

  const video      = document.getElementById('vp-video');
  const overlay    = document.getElementById('vp-overlay');
  const centerIcon = document.getElementById('vp-center-icon');
  const seekBar    = document.getElementById('vp-progress');
  const buffered   = document.getElementById('vp-buffered');
  const played     = document.getElementById('vp-played');
  const thumb      = document.getElementById('vp-thumb');
  const playBtn    = document.getElementById('vp-play-btn');
  const muteBtn    = document.getElementById('vp-mute-btn');
  const volSlider  = document.getElementById('vp-volume');
  const timeEl     = document.getElementById('vp-time');
  const speedSel   = document.getElementById('vp-speed');
  const fsBtn      = document.getElementById('vp-fullscreen-btn');

  /* ── Ícones SVG ── */
  const IC = {
    play:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    volOff:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a9 9 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>`,
    volLo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12A4.5 4.5 0 0016 7.97v8.05A4.5 4.5 0 0018.5 12zM5 9v6h4l5 5V4L9 9H5z"/></svg>`,
    volHi: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    fsIn:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    fsOut: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
  };

  /* ── Helpers ── */
  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }

  function setPaused(paused) {
    player.classList.toggle('vp-paused', paused);
    playBtn.innerHTML    = paused ? IC.play  : IC.pause;
    centerIcon.innerHTML = paused ? IC.play  : IC.pause;
    /* ajusta margem-left no ícone de pausa (sem deslocamento) */
    const svg = centerIcon.querySelector('svg');
    if (svg) svg.style.marginLeft = paused ? '4px' : '0';
  }

  function updateVolUI() {
    const muted = video.muted || video.volume === 0;
    muteBtn.innerHTML  = muted ? IC.volOff : video.volume < 0.5 ? IC.volLo : IC.volHi;
    volSlider.value    = muted ? 0 : video.volume;
  }

  /* ── Init ── */
  setPaused(true);
  updateVolUI();
  fsBtn.innerHTML = IC.fsIn;

  /* ── Play / Pause ── */
  function togglePlay() { video.paused ? video.play() : video.pause(); }

  video.addEventListener('play',  () => setPaused(false));
  video.addEventListener('pause', () => setPaused(true));
  video.addEventListener('ended', () => { setPaused(true); video.currentTime = 0; });

  overlay.addEventListener('click', togglePlay);
  playBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });

  /* ── Progresso ── */
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    played.style.width = pct + '%';
    thumb.style.left   = pct + '%';
    seekBar.setAttribute('aria-valuenow', Math.round(pct));
    timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  });

  video.addEventListener('progress', () => {
    if (video.buffered.length) {
      buffered.style.width = (video.buffered.end(video.buffered.length - 1) / video.duration * 100) + '%';
    }
  });

  video.addEventListener('waiting', () => player.classList.add('vp-buffering'));
  video.addEventListener('canplay', () => player.classList.remove('vp-buffering'));

  /* ── Seek (mouse + touch) ── */
  let seeking = false;

  function seekAt(clientX) {
    const r = seekBar.getBoundingClientRect();
    video.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * video.duration;
  }

  seekBar.addEventListener('mousedown',  e => { seeking = true; seekAt(e.clientX); });
  document.addEventListener('mousemove', e => { if (seeking) seekAt(e.clientX); });
  document.addEventListener('mouseup',   ()  => { seeking = false; });

  seekBar.addEventListener('touchstart', e => { seeking = true; seekAt(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('touchmove', e => { if (seeking) seekAt(e.touches[0].clientX); },   { passive: true });
  document.addEventListener('touchend',  ()  => { seeking = false; });

  /* ── Volume ── */
  muteBtn.addEventListener('click', e => {
    e.stopPropagation();
    video.muted = !video.muted;
    updateVolUI();
  });

  volSlider.addEventListener('input', e => {
    video.volume = parseFloat(e.target.value);
    video.muted  = video.volume === 0;
    updateVolUI();
  });

  volSlider.addEventListener('click', e => e.stopPropagation());

  /* ── Velocidade ── */
  speedSel.addEventListener('change', () => { video.playbackRate = parseFloat(speedSel.value); });
  speedSel.addEventListener('click',  e => e.stopPropagation());

  /* ── Tela cheia ── */
  fsBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      (player.requestFullscreen || player.webkitRequestFullscreen).call(player);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  });

  document.addEventListener('fullscreenchange', () => {
    fsBtn.innerHTML = document.fullscreenElement ? IC.fsOut : IC.fsIn;
  });

  /* ── Auto-ocultar controles ── */
  let hideTimer;

  function showControls() {
    player.classList.add('vp-show-controls');
    clearTimeout(hideTimer);
    if (!video.paused) {
      hideTimer = setTimeout(() => player.classList.remove('vp-show-controls'), 3000);
    }
  }

  player.addEventListener('mousemove',  showControls);
  player.addEventListener('touchstart', showControls, { passive: true });
  player.addEventListener('mouseleave', () => {
    if (!video.paused) { clearTimeout(hideTimer); player.classList.remove('vp-show-controls'); }
  });

  /* ── Atalhos de teclado ── */
  player.addEventListener('keydown', e => {
    const map = {
      ' ':          togglePlay,
      'k':          togglePlay,
      'ArrowRight': () => { video.currentTime = Math.min(video.duration, video.currentTime + 5); },
      'ArrowLeft':  () => { video.currentTime = Math.max(0, video.currentTime - 5); },
      'ArrowUp':    () => { video.volume = Math.min(1, video.volume + 0.1); updateVolUI(); },
      'ArrowDown':  () => { video.volume = Math.max(0, video.volume - 0.1); updateVolUI(); },
      'm':          () => { video.muted = !video.muted; updateVolUI(); },
      'f':          () => fsBtn.click(),
    };
    const fn = map[e.key] || map[e.key.toLowerCase()];
    if (fn) { e.preventDefault(); fn(); showControls(); }
  });
})();

/* ================================================================
   BARRA DE PROGRESSO DE LEITURA
   ================================================================ */
const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.querySelector('header').appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop    = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  progressBar.style.width = (scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0) + '%';
}, { passive: true });

/* ── Scroll-reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Contador animado nas estatísticas ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* ── Scroll spy — link ativo no nav ── */
const sections = document.querySelectorAll('main [id]');
const navLinks = document.querySelectorAll('.header-nav a');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => spyObserver.observe(s));

/* ── Toast notification ── */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '!'}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast--visible')));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3500);
}

/* ── Formulário: validação e estado de sucesso ── */
document.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();

  const idade = parseInt(document.getElementById('idade').value, 10);
  if (isNaN(idade) || idade < 10 || idade > 100) {
    showToast('Idade deve estar entre 10 e 100 anos!', 'error');
    return;
  }

  const nome = document.getElementById('nome').value.trim();
  const section = e.target.closest('section');

  section.innerHTML = `
    <div class="form-success">
      <div class="form-success__icon">⚽</div>
      <h2>Participação enviada!</h2>
      <p>Obrigado, <strong>${nome}</strong>! Sua opinião foi registrada com sucesso.</p>
    </div>
  `;

  section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Participação enviada com sucesso!');
});

/* ── Toggle dark/light mode ── */
const btn = document.getElementById('theme-toggle');
const html = document.documentElement;

const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
html.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

btn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
