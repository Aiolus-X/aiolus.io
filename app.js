(() => {
  "use strict";

  const intro = document.querySelector("#intro");
  const site = document.querySelector("#site");
  const enterButton = document.querySelector("#enter-button");
  const introCanvas = document.querySelector("#intro-canvas");
  const flowCanvas = document.querySelector("#flow-canvas");
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let transitionStarted = false;
  let transitionStart = 0;
  let touchStartY = 0;

  document.querySelector("#current-year").textContent = new Date().getFullYear();

  function enterSite() {
    if (transitionStarted) return;
    transitionStarted = true;
    transitionStart = performance.now();
    intro.classList.add("is-entering");

    const revealDelay = reduceMotion ? 0 : 720;
    const completeDelay = reduceMotion ? 50 : 2050;

    window.setTimeout(() => {
      site.classList.add("is-visible");
      site.setAttribute("aria-hidden", "false");
    }, revealDelay);

    window.setTimeout(() => {
      intro.classList.add("is-complete");
      intro.setAttribute("aria-hidden", "true");
      document.body.classList.remove("intro-active");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, completeDelay);
  }

  enterButton.addEventListener("click", enterSite);

  intro.addEventListener("click", (event) => {
    if (event.button === 0) enterSite();
  });

  intro.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY > 6) enterSite();
    },
    { passive: true },
  );

  intro.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    },
    { passive: true },
  );

  intro.addEventListener(
    "touchend",
    (event) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      if (touchStartY - endY > 24) enterSite();
    },
    { passive: true },
  );

  window.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("intro-active")) return;
    if (["Enter", " ", "ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      enterSite();
    }
  });

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    primaryNav.classList.toggle("is-open", !expanded);
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6%" },
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  function setupIntroCanvas() {
    const context = introCanvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];

    function random(seed) {
      const x = Math.sin(seed * 999.91) * 43758.5453;
      return x - Math.floor(x);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      introCanvas.width = Math.round(width * dpr);
      introCanvas.height = Math.round(height * dpr);
      introCanvas.style.width = `${width}px`;
      introCanvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = Math.min(620, Math.floor((width * height) / 3500));
      const clusters = [
        { x: 0.14, y: 0.2, spreadX: 0.2, spreadY: 0.13 },
        { x: 0.52, y: 0.1, spreadX: 0.24, spreadY: 0.09 },
        { x: 0.84, y: 0.24, spreadX: 0.19, spreadY: 0.15 },
      ];

      stars = Array.from({ length: starCount }, (_, index) => {
        const clustered = random(index + 17) > 0.34;
        const cluster = clusters[Math.floor(random(index + 29) * clusters.length)];
        const cloudX = (random(index + 31) + random(index + 37) + random(index + 41)) / 3 - 0.5;
        const cloudY = (random(index + 47) + random(index + 53) + random(index + 59)) / 3 - 0.5;
        const x = clustered ? cluster.x + cloudX * cluster.spreadX * 2 : random(index + 3);
        const y = clustered ? cluster.y + cloudY * cluster.spreadY * 2 : random(index + 43) * 0.54;

        return {
          x: Math.max(0.015, Math.min(0.985, x)) * width,
          y: Math.max(0.015, Math.min(0.58, y)) * height,
          radius: random(index + 93) ** 2 * 1.35 + 0.16,
          alpha: random(index + 133) * 0.62 + 0.14,
          speed: random(index + 193) * 0.001 + 0.00022,
          gold: random(index + 211) > 0.84,
          spark: random(index + 227) > 0.965,
        };
      });

    }

    function drawStars(time, progress) {
      for (const star of stars) {
        const twinkle = 0.62 + Math.sin(time * star.speed + star.x) * 0.38;
        const opacity = star.alpha * twinkle * (1 - progress * 0.82);
        const color = star.gold ? `rgba(241, 211, 147, ${opacity * 0.82})` : `rgba(220, 237, 244, ${opacity})`;
        context.fillStyle = color;
        context.beginPath();
        context.arc(star.x, star.y - progress * 20, star.radius, 0, Math.PI * 2);
        context.fill();

        if (star.spark) {
          context.save();
          context.strokeStyle = star.gold ? `rgba(246, 218, 155, ${opacity * 0.65})` : `rgba(226, 242, 248, ${opacity * 0.6})`;
          context.lineWidth = 0.45;
          context.beginPath();
          context.moveTo(star.x - 5, star.y);
          context.lineTo(star.x + 5, star.y);
          context.moveTo(star.x, star.y - 5);
          context.lineTo(star.x, star.y + 5);
          context.stroke();
          context.restore();
        }
      }
    }

    function drawAtmosphere(time, progress) {
      const horizonY = height * (0.515 + progress * 0.035);
      const lift = Math.sin(time * 0.0007) * 0.7;

      context.save();
      context.beginPath();
      context.moveTo(-width * 0.05, horizonY + height * 0.05);
      context.quadraticCurveTo(width * 0.5, horizonY - 4 + lift, width * 1.05, horizonY + height * 0.075);
      context.strokeStyle = `rgba(196, 235, 252, ${0.2 + progress * 0.18})`;
      context.lineWidth = 0.8 + progress * 3.5;
      context.shadowColor = "rgba(127, 203, 240, 0.85)";
      context.shadowBlur = 12 + progress * 24;
      context.stroke();
      context.restore();

      const verticalBeam = context.createLinearGradient(0, horizonY - height * 0.3, 0, horizonY + 10);
      verticalBeam.addColorStop(0, "rgba(126, 205, 244, 0)");
      verticalBeam.addColorStop(0.7, `rgba(151, 218, 249, ${0.018 + progress * 0.075})`);
      verticalBeam.addColorStop(1, `rgba(237, 251, 255, ${0.1 + progress * 0.16})`);
      context.save();
      context.translate(width / 2, 0);
      context.beginPath();
      context.moveTo(-width * (0.018 + progress * 0.17), horizonY + 4);
      context.lineTo(width * (0.018 + progress * 0.17), horizonY + 4);
      context.lineTo(width * (0.105 + progress * 0.15), horizonY - height * 0.3);
      context.lineTo(-width * (0.105 + progress * 0.15), horizonY - height * 0.3);
      context.closePath();
      context.fillStyle = verticalBeam;
      context.fill();
      context.restore();

      return horizonY;
    }

    function drawBrandTransition(time, progress) {
      if (progress <= 0.001) return;

      const pulse = 1 + Math.sin(time * 0.0012) * 0.08;
      const radius = Math.pow(progress, 2.2) * Math.max(width, height) * 0.64 * pulse;
      const glowRadius = Math.max(80, width * 0.1) + progress * width * 0.78;
      const centerX = width / 2;
      const centerY = height * (width < 700 ? 0.1 : 0.065);

      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glow.addColorStop(0, `rgba(255, 255, 255, ${progress * 0.92})`);
      glow.addColorStop(0.04, `rgba(255, 241, 202, ${progress * 0.84})`);
      glow.addColorStop(0.17, `rgba(211, 177, 105, ${progress * 0.34})`);
      glow.addColorStop(0.5, `rgba(111, 139, 148, ${progress * 0.13})`);
      glow.addColorStop(1, "rgba(45, 62, 66, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.fillStyle = `rgba(255, 250, 231, ${Math.min(1, progress * 1.4)})`;
      context.shadowColor = "rgba(255, 235, 181, 0.96)";
      context.shadowBlur = 25 + progress * 80;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();

      const horizontalFlare = context.createLinearGradient(0, 0, width, 0);
      horizontalFlare.addColorStop(0, "rgba(215, 191, 135, 0)");
      horizontalFlare.addColorStop(0.37, `rgba(234, 218, 179, ${progress * 0.2})`);
      horizontalFlare.addColorStop(0.5, `rgba(255, 255, 255, ${progress * 0.82})`);
      horizontalFlare.addColorStop(0.63, `rgba(234, 218, 179, ${progress * 0.2})`);
      horizontalFlare.addColorStop(1, "rgba(215, 191, 135, 0)");
      context.fillStyle = horizontalFlare;
      context.fillRect(0, centerY - 0.5, width, 1 + progress * 5);
    }

    function render(time) {
      const elapsed = transitionStarted ? time - transitionStart : 0;
      const progress = transitionStarted ? Math.min(1, elapsed / 1750) : 0;

      context.clearRect(0, 0, width, height);

      const ambient = context.createRadialGradient(width / 2, height * 0.52, 0, width / 2, height * 0.52, width * 0.55);
      ambient.addColorStop(0, `rgba(41, 105, 146, ${0.08 + progress * 0.2})`);
      ambient.addColorStop(0.42, "rgba(13, 31, 45, 0.035)");
      ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = ambient;
      context.fillRect(0, 0, width, height);

      drawStars(time, progress);
      drawAtmosphere(time, progress);
      drawBrandTransition(time, progress);

      if (!intro.classList.contains("is-complete")) requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(render);
  }

  function setupFlowCanvas() {
    const context = flowCanvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    function resize() {
      const rect = flowCanvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      flowCanvas.width = Math.round(width * dpr);
      flowCanvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project(x, z, wave, time) {
      const perspective = 1 / (0.65 + z * 0.016);
      const horizon = height * 0.42;
      const baseY = horizon + z * perspective * height * 0.075;
      const screenX = width * 0.72 + x * perspective * width * 0.04;
      const ripple =
        Math.sin(x * 0.48 + time * 0.00055) * 0.55 +
        Math.cos(z * 0.29 - time * 0.00038) * 0.7 +
        Math.sin((x + z) * 0.22 + time * 0.00028) * 0.52;
      const screenY = baseY - (ripple + wave) * perspective * height * 0.062;
      return { x: screenX + mouseX * z * 0.01, y: screenY + mouseY * perspective * 4, perspective };
    }

    function render(time) {
      context.clearRect(0, 0, width, height);
      mouseX += (targetMouseX - mouseX) * 0.025;
      mouseY += (targetMouseY - mouseY) * 0.025;

      const cols = width < 700 ? 34 : 54;
      const rows = width < 700 ? 32 : 44;
      const xMin = width < 700 ? -9 : -13;
      const xMax = width < 700 ? 13 : 15;

      for (let row = 0; row < rows; row += 1) {
        const z = 2.2 + row * 0.74;
        for (let column = 0; column < cols; column += 1) {
          const x = xMin + (column / (cols - 1)) * (xMax - xMin);
          const distance = Math.abs(x - 2.8);
          const ridge = Math.max(0, 3.5 - distance * 0.22) * Math.exp(-Math.pow(z - 13, 2) / 115);
          const point = project(x, z, ridge, time);
          const alpha = Math.min(0.72, 0.07 + point.perspective * 0.38) * (0.52 + 0.48 * Math.sin(column * 1.7 + row * 2.2));
          const radius = Math.max(0.28, point.perspective * 1.18);

          context.fillStyle = `rgba(183, 220, 239, ${Math.max(0.045, alpha)})`;
          context.beginPath();
          context.arc(point.x, point.y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.lineWidth = 0.65;
      for (let row = 2; row < rows; row += 4) {
        const z = 2.2 + row * 0.74;
        context.beginPath();
        for (let column = 0; column < cols; column += 1) {
          const x = xMin + (column / (cols - 1)) * (xMax - xMin);
          const ridge = Math.max(0, 3.5 - Math.abs(x - 2.8) * 0.22) * Math.exp(-Math.pow(z - 13, 2) / 115);
          const point = project(x, z, ridge, time);
          if (column === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.strokeStyle = `rgba(140, 197, 225, ${0.04 + row / rows * 0.08})`;
        context.stroke();
      }

      if (!reduceMotion) requestAnimationFrame(render);
    }

    flowCanvas.closest(".hero").addEventListener(
      "pointermove",
      (event) => {
        targetMouseX = (event.clientX / width - 0.5) * 2;
        targetMouseY = (event.clientY / height - 0.5) * 2;
      },
      { passive: true },
    );

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(render);
  }

  setupIntroCanvas();
  setupFlowCanvas();
})();
