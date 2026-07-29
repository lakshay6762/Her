/* =========================================================
   CONFIG — the only two things you should need to edit
   ========================================================= */
// Date & time the relationship started (used by the live counter). Format: YYYY-MM-DDTHH:MM:SS
const RELATIONSHIP_START_DATE = ("2023-12-08T00:00:00");

// Background music file (place music.mp3 next to index.html)
const MUSIC_SRC = "videoplayback.mp3";

/* =========================================================
   UTILITIES
   ========================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const rand = (min, max) => Math.random() * (max - min) + min;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initLoadingScreen();
  initCursorGlow();
  initScrollRail();
  initStarsCanvas($("#starsCanvas"));
  initFloatingHearts();
  initGiftBox();
  initTypewriter();
  initScrollReveals();
  initGallery();
  initTimelineProgress();
  initReasons();
  initEnvelope();
  initCounter();
  initSurprise();
  initMusicToggle();
});

/* =========================================================
   1. LOADING SCREEN
   ========================================================= */
function initLoadingScreen() {
  const screen = $("#loadingScreen");
  const fill = $("#loadingBarFill");
  const main = $("#mainContent");

  // Animate the progress bar filling up
  requestAnimationFrame(() => { fill.style.width = "100%"; });

  const finish = () => {
    screen.classList.add("is-hidden");
    main.hidden = false;
    document.body.style.overflow = "";
    // Kick the reveal check once content is visible
    window.dispatchEvent(new Event("scroll"));
  };

  document.body.style.overflow = "hidden";
  // Total loading time ~2.6s, matches the bar transition
  setTimeout(finish, 2600);
}

/* =========================================================
   2. CURSOR GLOW (desktop only, ambient light following pointer)
   ========================================================= */
function initCursorGlow() {
  const glow = $("#cursorGlow");
  if (!glow || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  window.addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });
}

/* =========================================================
   3. SCROLL PROGRESS RAIL
   ========================================================= */
function initScrollRail() {
  const fill = $("#scrollRailFill");
  const update = () => {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    fill.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* =========================================================
   4. STARRY NIGHT CANVAS (used in hero + surprise overlay)
   ========================================================= */
function initStarsCanvas(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let width, height, raf;

  function resize() {
    width = canvas.width = canvas.offsetWidth * devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    const count = Math.floor((width * height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 * devicePixelRatio + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  if (!prefersReducedMotion) {
    raf = requestAnimationFrame(draw);
  } else {
    draw(0);
  }
  return { resize, stop: () => cancelAnimationFrame(raf) };
}

/* =========================================================
   5. FLOATING HEARTS (ambient hero decoration)
   ========================================================= */
function initFloatingHearts() {
  const container = $("#floatingHearts");
  if (!container || prefersReducedMotion) return;
  const symbols = ["❤️", "💗", "💜", "✨"];
  const count = window.innerWidth < 600 ? 10 : 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "floating-heart";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${rand(2, 98)}%`;
    el.style.setProperty("--size", `${rand(14, 30)}px`);
    el.style.setProperty("--dur", `${rand(9, 18)}s`);
    el.style.setProperty("--delay", `${rand(0, 14)}s`);
    el.style.setProperty("--drift", `${rand(-60, 60)}px`);
    container.appendChild(el);
  }
}

/* =========================================================
   6. GIFT BOX — open animation, confetti, fireworks, music
   ========================================================= */
function initGiftBox() {
  const giftBox = $("#giftBox");
  const music = $("#bgMusic");
  music.src = MUSIC_SRC;
  let opened = false;

  giftBox.addEventListener("click", () => {
    if (opened) return;
    opened = true;

    giftBox.classList.add("is-opening");
    giftBox.querySelector(".gift-caption").textContent = "🎉";
    giftBox.disabled = true;

    launchConfetti();
    launchFireworks();
    startMusic(music);

    setTimeout(() => {
      $("#message").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }, 900);
  }, { once: false });
}

function startMusic(music) {
  music.volume = 0.55;
  const playPromise = music.play();
  const toggle = $("#musicToggle");
  if (playPromise !== undefined) {
    playPromise
      .then(() => { toggle.hidden = false; })
      .catch(() => {
        // Autoplay blocked — reveal the toggle so the user can start it manually
        toggle.hidden = false;
        toggle.classList.add("is-paused");
      });
  }
}

function initMusicToggle() {
  const toggle = $("#musicToggle");
  const music = $("#bgMusic");
  toggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().catch(() => {});
      toggle.classList.remove("is-paused");
    } else {
      music.pause();
      toggle.classList.add("is-paused");
    }
  });
}

/* ---- Confetti ---- */
function launchConfetti() {
  const canvas = $("#confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.opacity = "1";

  const colors = ["#ff4fc3", "#9b6bff", "#ffd9a0", "#ff9ce8", "#c9a7ff", "#ffffff"];
  const pieces = Array.from({ length: prefersReducedMotion ? 0 : 160 }, () => ({
    x: rand(0, canvas.width),
    y: rand(-canvas.height * 0.3, 0),
    w: rand(6, 11),
    h: rand(9, 15),
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: rand(2, 5.5),
    speedX: rand(-2, 2),
    rotation: rand(0, 360),
    rotSpeed: rand(-8, 8),
    tilt: rand(0, Math.PI),
  }));

  let frame = 0;
  const maxFrames = 260;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(frame * 0.05 + p.tilt) * 1.2;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      canvas.style.opacity = "0";
      setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 500);
    }
  }
  requestAnimationFrame(tick);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

/* ---- Fireworks ---- */
function launchFireworks() {
  const canvas = $("#fireworksCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.opacity = "1";

  const colors = ["#ff4fc3", "#9b6bff", "#ffd9a0", "#ff9ce8", "#c9a7ff"];
  let particles = [];

  function spawnBurst(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = prefersReducedMotion ? 0 : 46;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = rand(2, 6);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size: rand(2, 3.5),
      });
    }
  }

  const burstPoints = [
    [canvas.width * 0.25, canvas.height * 0.3],
    [canvas.width * 0.75, canvas.height * 0.25],
    [canvas.width * 0.5, canvas.height * 0.4],
  ];
  burstPoints.forEach(([x, y], i) => setTimeout(() => spawnBurst(x, y), i * 380));

  let frame = 0;
  function tick() {
    ctx.fillStyle = "rgba(5,3,10,0.12)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045; // gravity
      p.alpha -= 0.014;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${Math.max(0, p.alpha)})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    particles = particles.filter((p) => p.alpha > 0);
    frame++;
    if (frame < 220) {
      requestAnimationFrame(tick);
    } else {
      canvas.style.opacity = "0";
      setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 500);
    }
  }
  requestAnimationFrame(tick);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  const bigint = parseInt(v, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

/* =========================================================
   7. TYPEWRITER — "Happy Birthday, My Love ❤️"
   ========================================================= */
function initTypewriter() {
  const target = $("#typewriterText");
  const heading = $("#typewriterTitle");
  const text = "Happy Birthday, My Love ❤️";
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        started = true;
        typeText(target, text, 55);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(heading);
}

function typeText(el, text, speed) {
  if (prefersReducedMotion) { el.textContent = text; return; }
  let i = 0;
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    }
  })();
}

/* =========================================================
   8. SCROLL REVEALS (fade/slide for .reveal and .reveal-line)
   ========================================================= */
function initScrollReveals() {
  const items = $$(".reveal, .reveal-line");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  items.forEach((item, idx) => {
    // stagger nested reveal-lines slightly for a cascading feel
    if (item.classList.contains("reveal-line")) {
      item.style.transitionDelay = `${idx % 4 * 0.12}s`;
    }
    observer.observe(item);
  });
}

/* =========================================================
   9. MEMORY GALLERY + LIGHTBOX
   ========================================================= */
function initGallery() {
  const items = $$(".gallery-item");
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const closeBtn = $("#lightboxClose");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = item.dataset.caption || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* =========================================================
   10. LOVE TIMELINE — progress line fills while scrolling
   ========================================================= */
function initTimelineProgress() {
  const section = $("#timeline");
  const fill = $("#timelineFill");
  if (!section || !fill) return;

  function update() {
    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height + viewportH * 0.5;
    const scrolled = viewportH * 0.8 - rect.top;
    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    fill.style.height = `${pct}%`;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* =========================================================
   11. REASONS I LOVE YOU — 100+ reasons, random reveal
   ========================================================= */
const LOVE_REASONS = [
  "The way your eyes light up when you talk about something you love.",
  "How you remember the tiniest details about the people you care about.",
  "Your laugh, especially the one you can't control.",
  "How safe I feel just being near you.",
  "The way you say my name.",
  "How you make even ordinary errands feel like an adventure.",
  "Your unwavering kindness to strangers.",
  "The way you dance when you think no one's watching.",
  "How you always know exactly what to say when I'm having a hard day.",
  "Your terrible, wonderful puns.",
  "The way you hum while you cook.",
  "How you fight for the people you love.",
  "Your handwriting.",
  "The way you get excited about your favorite songs.",
  "How you always save me the last bite.",
  "Your ability to make me laugh until I cry.",
  "The way you hold my hand in your sleep.",
  "How you never let me stay upset for too long.",
  "Your honesty, even when it's hard.",
  "The way you say 'good morning' like you mean it.",
  "How you believe in me more than I believe in myself.",
  "Your patience with me on my worst days.",
  "The way your whole face smiles, not just your mouth.",
  "How you make our home feel like home.",
  "Your quiet strength.",
  "The way you always know the right playlist for the mood.",
  "How you never make me feel small.",
  "Your ridiculous, endearing sense of humor.",
  "The way you look at me across a crowded room.",
  "How you remember our little inside jokes.",
  "Your generosity, even when you have very little to give.",
  "The way you take care of everyone around you.",
  "How you make the mundane feel magical.",
  "Your courage to be exactly who you are.",
  "The way you apologize when you're wrong.",
  "How you celebrate my small wins like they're huge.",
  "Your gentle way of calming me down.",
  "The way you sing off-key and don't care.",
  "How you always leave a little note when you leave early.",
  "Your endless curiosity about the world.",
  "The way you hug like you mean it.",
  "How you make plans just to see me smile.",
  "Your loyalty, through everything.",
  "The way you talk to animals like they understand you.",
  "How you always remember how I take my coffee.",
  "Your bravery when things get scary.",
  "The way you fall asleep mid-sentence.",
  "How you never let a compliment go unnoticed.",
  "Your quiet way of showing you care.",
  "The way you get so passionate about the things you love.",
  "How you make me want to be a better person.",
  "Your soft heart underneath a strong exterior.",
  "The way you always show up for the people you love.",
  "How your presence alone calms a storm in me.",
  "Your ability to find the silver lining.",
  "The way you say 'I love you' like it's brand new every time.",
  "How you never stop learning and growing.",
  "Your playful competitiveness over board games.",
  "The way you carry my bags without me even asking.",
  "How you make Sunday mornings feel sacred.",
  "Your infectious excitement for small pleasures.",
  "The way you listen, really listen.",
  "How you remember exactly how I like things.",
  "Your unwavering belief in second chances.",
  "The way you make friends everywhere you go.",
  "How you turn my bad days into good ones.",
  "Your habit of leaving my favorite snacks around the house.",
  "The way your hand fits perfectly in mine.",
  "How you never give up on the people you love.",
  "Your habit of narrating your cooking like a chef on TV.",
  "The way you say 'we' instead of 'I'.",
  "How you make me feel chosen, every single day.",
  "Your patience while teaching me new things.",
  "The way you get shy when I compliment you.",
  "How you always know how to make me smile.",
  "Your love for the little things &mdash; sunsets, songs, silence.",
  "The way you protect the people you love fiercely.",
  "How you make ordinary Tuesdays feel special.",
  "Your habit of saving articles you think I'd like.",
  "The way you say sorry with your eyes before your words.",
  "How you turn my worries into whispers.",
  "Your smile when you wake up next to me.",
  "The way you make our future feel so exciting.",
  "How you never let me feel alone.",
  "Your endless supply of random fun facts.",
  "The way you hold doors, even when no one's watching.",
  "How you make me feel like the luckiest person alive.",
  "Your soft snoring that somehow I've grown to love.",
  "The way you remember our anniversary of every little thing.",
  "How you make me want to grow old with you.",
  "Your kindness toward every waiter, cashier, and stranger.",
  "The way you say my name when you're proud of me.",
  "How you always find a reason to celebrate.",
  "Your habit of stealing the blanket, and I let you anyway.",
  "The way you make me feel understood without explaining.",
  "How you turn my chaos into calm.",
  "Your unshakable faith in us.",
  "The way you make every birthday feel like the best one yet.",
  "How you love me exactly as I am.",
  "The way your heart beats a little louder when I'm near, just like mine does for you.",
  "Simply put &mdash; because you are you, and that has always been more than enough."
];

function initReasons() {
  const btn = $("#reasonBtn");
  const textEl = $("#reasonText");
  const counterEl = $("#reasonCounter");
  const seen = new Set();

  btn.addEventListener("click", () => {
    let idx;
    if (seen.size >= LOVE_REASONS.length) seen.clear();
    do {
      idx = Math.floor(Math.random() * LOVE_REASONS.length);
    } while (seen.has(idx));
    seen.add(idx);

    textEl.classList.add("is-swapping");
    setTimeout(() => {
      textEl.textContent = LOVE_REASONS[idx];
      textEl.classList.remove("is-swapping");
    }, 220);

    counterEl.textContent = `${seen.size} of ${LOVE_REASONS.length}+ reasons revealed`;
  });
}

/* =========================================================
   12. LOVE LETTER — envelope open animation
   ========================================================= */
function initEnvelope() {
  const envelope = $("#envelope");
  const caption = $("#envelopeCaption");
  const paper = $("#letterPaper");
  const closeBtn = $("#letterClose");

  envelope.addEventListener("click", () => {
    envelope.classList.add("is-open");
    caption.textContent = "Opened with love";

    setTimeout(() => {
      paper.classList.add("is-open");
      paper.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }, 550);
  });

  function close() {
    paper.classList.remove("is-open");
    paper.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", close);
  paper.addEventListener("click", (e) => { if (e.target === paper) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* =========================================================
   13. LIVE TIME COUNTER
   ========================================================= */
function initCounter() {
  const startDate = new Date("2023-12-08T00:00:00");
  const daysEl = $("#countDays");
  const hoursEl = $("#countHours");
  const minsEl = $("#countMinutes");
  const secsEl = $("#countSeconds");

  function update() {
    const now = new Date();
    let diff = Math.max(0, now - startDate);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    daysEl.textContent = days.toLocaleString();
    hoursEl.textContent = String(hours).padStart(2, "0");
    minsEl.textContent = String(minutes).padStart(2, "0");
    secsEl.textContent = String(seconds).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

/* =========================================================
   14. SURPRISE SECTION
   ========================================================= */
function initSurprise() {
  const btn = $("#surpriseBtn");
  const overlay = $("#surpriseOverlay");
  const closeBtn = $("#surpriseClose");
  const heartsContainer = $("#surpriseHearts");
  let starsController = null;
  let heartsSpawned = false;

  btn.addEventListener("click", () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (!starsController) {
      starsController = initStarsCanvas($("#surpriseStars"));
    }
    if (!heartsSpawned) {
      spawnSurpriseHearts(heartsContainer);
      heartsSpawned = true;
    }
  });

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("is-open")) close(); });
}

function spawnSurpriseHearts(container) {
  if (prefersReducedMotion) return;
  const count = window.innerWidth < 600 ? 20 : 40;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "floating-heart";
    el.textContent = Math.random() > 0.5 ? "❤️" : "💗";
    el.style.left = `${rand(2, 98)}%`;
    el.style.setProperty("--size", `${rand(12, 26)}px`);
    el.style.setProperty("--dur", `${rand(7, 16)}s`);
    el.style.setProperty("--delay", `${rand(0, 10)}s`);
    el.style.setProperty("--drift", `${rand(-50, 50)}px`);
    container.appendChild(el);
  }
}
