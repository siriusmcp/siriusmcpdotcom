/**
 * Canis Major Constellation — Pure CSS/JS parallax renderer
 * Renders star orbs and constellation lines on a canvas element.
 * Parallax effect on scroll. Sirius (brightest star) pulses.
 */
(function() {
  const canvas = document.getElementById('constellation-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Canis Major star positions (normalized 0-1 coordinate space)
  // Based on actual constellation geometry
  const stars = [
    { id: 'sirius',    x: 0.45, y: 0.38, mag: 1.0, label: 'Sirius' },      // α CMa — brightest
    { id: 'mirzam',    x: 0.62, y: 0.28, mag: 0.5, label: 'Mirzam' },      // β CMa
    { id: 'muliphein', x: 0.55, y: 0.22, mag: 0.35, label: 'Muliphein' },  // γ CMa
    { id: 'wezen',     x: 0.58, y: 0.52, mag: 0.55, label: 'Wezen' },      // δ CMa
    { id: 'adhara',    x: 0.52, y: 0.62, mag: 0.6, label: 'Adhara' },      // ε CMa
    { id: 'furud',     x: 0.35, y: 0.72, mag: 0.4, label: 'Furud' },       // ζ CMa
    { id: 'aludra',    x: 0.65, y: 0.65, mag: 0.4, label: 'Aludra' },      // η CMa
    { id: 'sigma',     x: 0.72, y: 0.18, mag: 0.3 },                        // σ CMa
    { id: 'omicron1',  x: 0.38, y: 0.25, mag: 0.25 },                       // ο¹ CMa
    { id: 'theta',     x: 0.48, y: 0.50, mag: 0.3 },                        // θ CMa
  ];

  // Constellation lines (connections between stars by id)
  const lines = [
    ['sirius', 'mirzam'],
    ['sirius', 'theta'],
    ['mirzam', 'muliphein'],
    ['muliphein', 'sigma'],
    ['theta', 'wezen'],
    ['wezen', 'adhara'],
    ['wezen', 'aludra'],
    ['adhara', 'furud'],
    ['sirius', 'omicron1'],
  ];

  // Background stars (random field)
  let bgStars = [];
  function generateBgStars() {
    bgStars = [];
    for (let i = 0; i < 200; i++) {
      bgStars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }
  generateBgStars();

  let scrollY = 0;
  let time = 0;
  let width, height;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight * 1.2; // extra height for scroll
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function getStarPos(star) {
    // Parallax: stars move at different rates based on magnitude (brightness = closer = more parallax)
    const parallaxFactor = star.mag * 0.15;
    const offsetY = scrollY * parallaxFactor;
    return {
      x: star.x * width,
      y: star.y * height + offsetY,
    };
  }

  function drawBgStars() {
    for (const s of bgStars) {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;
      const alpha = s.alpha * twinkle;
      const parallaxY = scrollY * 0.03;
      const x = s.x * width;
      const y = (s.y * height + parallaxY) % height;

      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();
    }
  }

  function drawLines() {
    const starMap = {};
    for (const s of stars) starMap[s.id] = s;

    ctx.strokeStyle = 'rgba(100, 180, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    for (const [from, to] of lines) {
      const a = getStarPos(starMap[from]);
      const b = getStarPos(starMap[to]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawStars() {
    for (const star of stars) {
      const pos = getStarPos(star);
      const baseRadius = star.mag * 3 + 1.5;

      // Glow
      const glowRadius = baseRadius * 4;
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);

      if (star.id === 'sirius') {
        // Sirius pulses blue-white
        const pulse = Math.sin(time * 0.03) * 0.2 + 0.8;
        gradient.addColorStop(0, `rgba(180, 220, 255, ${pulse})`);
        gradient.addColorStop(0.3, `rgba(100, 180, 255, ${pulse * 0.4})`);
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
      } else {
        gradient.addColorStop(0, `rgba(200, 220, 255, ${star.mag * 0.8})`);
        gradient.addColorStop(0.4, `rgba(150, 190, 255, ${star.mag * 0.3})`);
        gradient.addColorStop(1, 'rgba(150, 190, 255, 0)');
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = star.id === 'sirius' ? '#e0f0ff' : `rgba(220, 235, 255, ${star.mag})`;
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawBgStars();
    drawLines();
    drawStars();
    time++;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); generateBgStars(); });
  window.addEventListener('scroll', () => { scrollY = window.pageYOffset; });

  resize();
  draw();
})();
