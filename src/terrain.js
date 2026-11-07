/**
 * Fundo do hero: relevo em camadas (terraços) desenhado em canvas.
 * Semente fixa → sempre o mesmo desenho. Tons de pedra quase
 * monocromáticos com luz difusa quente vinda do alto-esquerdo.
 */
export function drawTerrain(cv) {
  const ctx = cv.getContext('2d');
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const bands = Array.from({ length: 17 }, () => ({
    f1: 0.0016 + rnd() * 0.0018, f2: 0.006 + rnd() * 0.006,
    p1: rnd() * 6.28, p2: rnd() * 6.28,
    a1: 18 + rnd() * 30, a2: 4 + rnd() * 9,
  }));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.clientWidth * dpr, H = cv.clientHeight * dpr;
  if (!W || !H) return;
  cv.width = W; cv.height = H;
  const k = dpr * Math.max(cv.clientWidth / 1440, 0.55);

  ctx.fillStyle = '#060607';
  ctx.fillRect(0, 0, W, H);

  bands.forEach((b, i) => {
    const t = i / (bands.length - 1);
    const base = H * (-0.06 + t * 1.08);
    const yAt = (x) => base - (x / W - 0.5) * H * 0.42
      + Math.sin((x / k) * b.f1 + b.p1) * b.a1 * k
      + Math.sin((x / k) * b.f2 + b.p2) * b.a2 * k;

    ctx.beginPath();
    ctx.moveTo(0, H);
    let minY = H;
    for (let x = 0; x <= W + 8; x += 8) {
      const y = yAt(x);
      minY = Math.min(minY, y);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    const lit = 0.25 + 0.75 * Math.pow(1 - t, 1.3);
    const c = (r, g, bl, o) => `rgb(${(r * lit + o) | 0},${(g * lit + o) | 0},${(bl * lit + o) | 0})`;
    const g = ctx.createLinearGradient(0, minY, 0, minY + H * 0.2);
    g.addColorStop(0, c(205, 194, 170, 20));
    g.addColorStop(0.12, c(150, 140, 120, 15));
    g.addColorStop(0.45, c(58, 54, 48, 12));
    g.addColorStop(1, '#0a0a0b');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,244,222,${0.12 + 0.35 * lit})`;
    ctx.lineWidth = 1.2 * dpr;
    ctx.stroke();
  });

  // luz ambiente difusa
  ctx.globalCompositeOperation = 'screen';
  const l = ctx.createRadialGradient(W * 0.22, -H * 0.15, 0, W * 0.22, -H * 0.15, W * 0.85);
  l.addColorStop(0, 'rgba(255,236,205,.28)');
  l.addColorStop(1, 'rgba(255,236,205,0)');
  ctx.fillStyle = l;
  ctx.fillRect(0, 0, W, H);

  // escurece a base para o título e o texto
  ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createLinearGradient(0, H * 0.38, 0, H);
  v.addColorStop(0, 'rgba(5,5,5,0)');
  v.addColorStop(0.55, 'rgba(5,5,5,.78)');
  v.addColorStop(1, '#050505');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}
