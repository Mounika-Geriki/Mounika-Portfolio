// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
    }
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId.length > 1) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});
 
// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* =========================
   Scroll reveal (IntersectionObserver)
   ========================= */

// 1) Mark sections for reveal
// We'll reveal: hero, and all sections, plus footer (optional)
const revealTargets = [
  document.querySelector(".hero"),
  ...document.querySelectorAll(".section"),
  document.querySelector(".site-footer"),
].filter(Boolean);

// Add base reveal class
revealTargets.forEach((el, idx) => {
  el.classList.add("reveal");

  // Optional: add some variation so it feels more premium
  // Alternate subtle direction
  if (idx % 3 === 1) el.classList.add("fade-left");
  if (idx % 3 === 2) el.classList.add("fade-right");
});

// 2) Observe + reveal when in view
const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        // Reveal once then stop observing (clean + fast)
        obs.unobserve(entry.target);
      }
    });
  },
  {
    // reveal when ~18% is visible
    threshold: 0.18,
    // start revealing just before it fully enters
    rootMargin: "0px 0px -10% 0px",
  }
);

revealTargets.forEach((el) => observer.observe(el));

/* =========================
   Category Tabs with Slide Animation
   ========================= */

const categoryTabs = document.querySelectorAll(".category-tab");
const projectCategories = document.querySelectorAll(".project-category");

// Initialize first category on page load (no animation)
document.addEventListener("DOMContentLoaded", () => {
  const firstCategory = document.querySelector(".project-category.active");
  if (firstCategory) {
    firstCategory.style.display = "block";
    firstCategory.style.opacity = "1";
    firstCategory.style.transform = "translateX(0)";
  }
});

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetCategory = tab.getAttribute("data-category");
    
    // Remove active class from all tabs
    categoryTabs.forEach((t) => t.classList.remove("active"));
    // Add active class to clicked tab
    tab.classList.add("active");
    
    // Determine slide direction based on current active category
    const currentActive = document.querySelector(".project-category.active");
    if (!currentActive) return;
    
    const currentIndex = Array.from(projectCategories).indexOf(currentActive);
    const targetIndex = Array.from(projectCategories).findIndex(
      (cat) => cat.getAttribute("data-category") === targetCategory
    );
    
    // Don't do anything if clicking the same category
    if (currentIndex === targetIndex) return;
    
    // Determine slide direction
    const slideFromRight = targetIndex > currentIndex;
    
    // Slide out current category
    if (slideFromRight) {
      currentActive.classList.add("slide-out-left");
    } else {
      currentActive.classList.add("slide-out-right");
    }
    
    setTimeout(() => {
      currentActive.classList.remove("active", "slide-out-left", "slide-out-right");
      currentActive.style.display = "none";
    }, 400);
    
    // Slide in new category from the side
    setTimeout(() => {
      const targetCategoryEl = document.querySelector(
        `.project-category[data-category="${targetCategory}"]`
      );
      if (targetCategoryEl) {
        // Set initial position - always slide in from right side
        targetCategoryEl.style.display = "block";
        targetCategoryEl.style.transform = "translateX(100px)";
        targetCategoryEl.style.opacity = "0";
        targetCategoryEl.classList.add("active");
        
        // Trigger slide in animation from right
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            targetCategoryEl.style.transform = "translateX(0)";
            targetCategoryEl.style.opacity = "1";
            
            // Clean up inline styles after animation completes
            setTimeout(() => {
              targetCategoryEl.style.transform = "";
              targetCategoryEl.style.opacity = "";
            }, 600);
          });
        });
      }
    }, 400);
  });
});

/* =========================
   Background particles (Canvas)
   ========================= */

(() => {
  const canvas = document.getElementById("bg-particles");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReducedMotion) return;

  /** @type {CanvasRenderingContext2D | null} */
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let w = 0;
  let h = 0;
  let particles = [];
  let rafId = 0;

  const CONFIG = {
    density: 0.000085, // particles per px^2
    minR: 0.9,
    maxR: 2.6,
    minV: 0.08,
    maxV: 0.28,
    linkDist: 140,
    linkAlpha: 0.075,
    dotAlpha: 0.62,
    tint: { r: 99, g: 102, b: 241 }, // accent-ish
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const targetCount = Math.max(18, Math.min(120, Math.floor(w * h * CONFIG.density)));
    const next = [];
    for (let i = 0; i < targetCount; i++) {
      const existing = particles[i];
      next.push(
        existing || {
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(CONFIG.minV, CONFIG.maxV) * (Math.random() < 0.5 ? -1 : 1),
          vy: rand(CONFIG.minV, CONFIG.maxV) * (Math.random() < 0.5 ? -1 : 1),
          r: rand(CONFIG.minR, CONFIG.maxR),
        }
      );
    }
    particles = next;
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // Move
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }

    // Links (O(n^2) but capped small)
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const maxD = CONFIG.linkDist;
        if (d2 > maxD * maxD) continue;
        const d = Math.sqrt(d2);
        const t = 1 - d / maxD;
        ctx.strokeStyle = `rgba(${CONFIG.tint.r}, ${CONFIG.tint.g}, ${CONFIG.tint.b}, ${CONFIG.linkAlpha * t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Dots
    for (const p of particles) {
      ctx.fillStyle = `rgba(${CONFIG.tint.r}, ${CONFIG.tint.g}, ${CONFIG.tint.b}, ${CONFIG.dotAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = window.requestAnimationFrame(step);
  }

  function start() {
    cancelAnimationFrame(rafId);
    resize();
    rafId = window.requestAnimationFrame(step);
  }

  let resizeT;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(resize, 120);
  });

  // Pause when tab hidden (saves battery)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      if (!rafId) rafId = window.requestAnimationFrame(step);
    }
  });

  start();
})();
