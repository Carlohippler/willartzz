import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Glass, TabBar } from 'glisse';
import { WORKS, ABOUT_ART, CONTACT_ART } from './content.js';
import { drawTerrain } from './terrain.js';

/* ---------- Haptics: vibração curta onde o navegador suporta (Android) ---------- */
const HAPTIC = { light: 8, medium: 14, selection: 5, success: [10, 40, 10] };
const haptic = (kind = 'light') => { try { navigator.vibrate?.(HAPTIC[kind] ?? 8); } catch { /* sem suporte */ } };

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });

/* ---------- Ícones ---------- */
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const Arrow = () => <svg viewBox="0 0 16 16" {...s}><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
const Ext = () => <svg className="arrow" viewBox="0 0 16 16" {...s}><path d="M5 11 11 5M6 5h5v5" /></svg>;
const Copy = () => <svg className="arrow" viewBox="0 0 16 16" {...s}><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M3 11V4a1 1 0 0 1 1-1h7" /></svg>;
const Check = () => <svg viewBox="0 0 16 16" {...s} strokeWidth="2"><path d="M3 8.5 6.5 12 13 4.5" /></svg>;
const Close = () => <svg viewBox="0 0 16 16" {...s}><path d="M4 4l8 8M12 4l-8 8" /></svg>;
const IHome = () => <svg viewBox="0 0 24 24" {...s}><path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" /></svg>;
const IGrid = () => <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>;
const IUser = () => <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>;
const IChat = () => <svg viewBox="0 0 24 24" {...s}><path d="M4 5h16v11H8l-4 4z" /></svg>;
const IDiscord = () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 5.3A17 17 0 0 0 15.4 4l-.5 1a15.7 15.7 0 0 0-5.8 0L8.6 4a17 17 0 0 0-4.2 1.3C1.7 9.3 1 13.2 1.3 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a12.2 12.2 0 0 0 11.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-2.9-11.7ZM8.5 14.7c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Zm7 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Z" /></svg>;
const IX = () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5Z" /></svg>;
const IBe = () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.2 11.3c.9-.4 1.4-1.2 1.4-2.2C9.6 7 8.1 6 6 6H1v12h5.2c2.2 0 4-1 4-3.4 0-1.5-.8-2.9-2-3.3ZM3.3 8h2.3c.9 0 1.6.3 1.6 1.2 0 .9-.6 1.3-1.5 1.3H3.3V8Zm2.5 8H3.3v-3.3h2.5c1.1 0 1.8.5 1.8 1.7 0 1.1-.8 1.6-1.8 1.6ZM20 7h-5V5.7h5V7Zm2.4 6.7c0-2.8-1.6-5-4.6-5-2.8 0-4.7 2.1-4.7 4.9 0 2.9 1.8 4.9 4.7 4.9 2.2 0 3.7-1 4.4-3.1h-2.3c-.2.8-1.2 1.2-2 1.2-1.5 0-2.3-.8-2.3-2.3h6.8v-.6Zm-6.8-1.1c.1-1.2.9-2 2.1-2 1.3 0 1.9.7 2 2h-4.1Z" /></svg>;

const SECTIONS = [
  { id: 'top', label: 'Início', icon: <IHome /> },
  { id: 'trabalhos', label: 'Trabalhos', icon: <IGrid /> },
  { id: 'sobre', label: 'Sobre', icon: <IUser /> },
  { id: 'contato', label: 'Contato', icon: <IChat /> },
];

/* ---------- Hooks ---------- */
function useActiveSection() {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return active;
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    const els = document.querySelectorAll('.reveal');
    els.forEach((el) => io.observe(el));
    // segurança: se o observer não disparar (salto por âncora, impressão…), mostra tudo
    const t = setTimeout(() => els.forEach((el) => el.classList.add('in')), 2500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
}

/* ---------- Navegação ---------- */
function TopNav({ active }) {
  const navRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [pill, setPill] = useState(null);
  // alvo da pílula líquida: o item sob o mouse (link ou o botão Encomendar);
  // sem mouse, a seção atual
  const target = hover ?? (active !== 'top' ? active : null);

  // posição medida com offsetLeft/offsetTop (relativa à barra, imune a
  // transformações e ao scroll); a pílula fica ATRÁS do texto
  const measure = useCallback(() => {
    const nav = navRef.current;
    const el = target && nav?.querySelector(`[data-pill="${target}"]`);
    if (!el) { setPill(null); return; }
    let x = 0, y = 0, n = el;
    while (n && n !== nav) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    const ring = target === 'cta', grow = ring ? 4 : 0;
    setPill((prev) => ({ x: x - grow, y: y - grow, w: el.offsetWidth + grow * 2, h: el.offsetHeight + grow * 2, ring, fresh: !prev }));
  }, [target]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => { addEventListener('resize', measure); document.fonts?.ready.then(measure); return () => removeEventListener('resize', measure); }, [measure]);

  return (
    <header className="nav-wrap">
      <Glass className="nav" ref={navRef} role="navigation" aria-label="Principal" onPointerLeave={() => setHover(null)}>
        <a href="#top" className="brand" onClick={() => haptic()}><span className="brand-mark" aria-hidden="true" />WillArtzz</a>
        <div className="nav-links">
          {SECTIONS.slice(1).map(({ id, label }) => (
            <a key={id} href={`#${id}`} data-pill={id} aria-current={active === id}
              onPointerEnter={() => setHover(id)} onClick={() => haptic()}>{label}</a>
          ))}
        </div>
        <Button className="cta" data-pill="cta" onPointerEnter={() => setHover('cta')}
          onClick={() => { haptic('medium'); goTo('contato'); }}>Encomendar</Button>
        <span aria-hidden="true"
          className={`nav-pill${pill ? ' on' : ''}${pill?.ring ? ' ring' : ''}${pill?.fresh ? ' fresh' : ''}`}
          style={pill ? { left: pill.x, top: pill.y, width: pill.w, height: pill.h } : undefined} />
      </Glass>
    </header>
  );
}

/* No celular: tab bar nativa do iOS 26 (glisse), presa embaixo */
function MobileTabs({ active }) {
  return (
    <div className="tabbar-dock">
      <TabBar
        aria-label="Seções"
        value={active}
        onValueChange={() => haptic('selection')}
        items={SECTIONS.map(({ id, label, icon }) => ({ value: id, label, icon, href: `#${id}` }))}
      />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const canvasRef = useRef(null);

  // relevo do fundo + parallax leve
  useEffect(() => {
    const cv = canvasRef.current;
    drawTerrain(cv);
    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(() => drawTerrain(cv), 150); };
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="heroTitle">
      {/* Camada de cena — marcada com data-glisse-backdrop: o relevo E o título
          ficam aqui, então todo vidro por cima (barra do topo e botões) os
          refrata, em qualquer navegador. */}
      <div className="hero-layer hero-scene" data-glisse-backdrop>
        <canvas ref={canvasRef} aria-hidden="true" />
        <h1 className="hero-title" id="heroTitle">WillArtzz<span className="hl">.</span></h1>
        <div className="hero-row">
          <p className="hero-sub"><strong>GFX, identidade visual e arte digital</strong> para criadores, servidores e marcas que querem ser lembrados no primeiro frame.</p>
          <div className="actions-ph" aria-hidden="true" />
        </div>
      </div>

      {/* Camada de vidro — mesma grade, com o texto invisível só para
          reservar o espaço; os controles de vidro ficam alinhados à cena. */}
      <div className="hero-layer hero-glass">
        <div className="hero-title ghost" aria-hidden="true">WillArtzz.</div>
        <div className="hero-row">
          <p className="hero-sub ghost" aria-hidden="true"><strong>GFX, identidade visual e arte digital</strong> para criadores, servidores e marcas que querem ser lembrados no primeiro frame.</p>
          <div className="hero-actions">
            <button type="button" className="gbtn gbtn-primary" onClick={() => { haptic('medium'); goTo('trabalhos'); }}>Ver trabalhos <Arrow /></button>
            <button type="button" className="gbtn" onClick={() => { haptic(); goTo('contato'); }}>Falar comigo</button>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ---------- Galeria ---------- */
const FILTERS = [
  { value: 'all', label: 'Tudo' },
  { value: '3d', label: '3D' },
  { value: 'poster', label: 'Pôsteres' },
  { value: 'brand', label: 'Branding' },
  { value: 'thumb', label: 'Thumbs' },
];

function WorkCard({ work, onOpen }) {
  return (
    <button className={`work ${work.span.join(' ')}${work.light ? ' on-light' : ''}`} onClick={() => onOpen(work)}>
      <div className="art" data-glisse-backdrop style={work.bg ? { background: work.bg } : undefined}
        dangerouslySetInnerHTML={{ __html: work.art }} />
      <Glass className="idx">{work.idx}</Glass>
      <Glass className="caption">
        <div><h3>{work.name}</h3><p>{work.sub}</p></div>
        <span className="open" aria-hidden="true"><Arrow /></span>
      </Glass>
    </button>
  );
}

/* Filtro segmentado: vidro em CSS + pílula que desliza ATRÁS dos rótulos
   (os rótulos nunca ficam cobertos, em nenhum navegador) */
function Segmented({ items, value, onChange }) {
  const ref = useRef(null);
  const [pill, setPill] = useState(null);
  const measure = useCallback(() => {
    const el = ref.current?.querySelector(`[data-v="${value}"]`);
    if (el) setPill((p) => ({ x: el.offsetLeft, w: el.offsetWidth, fresh: !p }));
  }, [value]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => { addEventListener('resize', measure); document.fonts?.ready.then(measure); return () => removeEventListener('resize', measure); }, [measure]);
  return (
    <div className="seg glass-css" ref={ref} role="group" aria-label="Filtrar por categoria">
      <span className={`seg-pill${pill?.fresh ? ' fresh' : ''}`} aria-hidden="true"
        style={pill ? { left: pill.x, width: pill.w } : { opacity: 0 }} />
      {items.map((it) => (
        <button key={it.value} type="button" data-v={it.value} aria-pressed={value === it.value}
          onClick={() => onChange(it.value)}>{it.label}</button>
      ))}
    </div>
  );
}

function Works({ onOpen }) {
  const [filter, setFilter] = useState('all');
  const list = WORKS.filter((w) => filter === 'all' || w.cat === filter);
  return (
    <section className="section" id="trabalhos" aria-labelledby="worksTitle">
      <div className="works-head reveal">
        <p className="eyebrow">Trabalhos selecionados</p>
        <h2 className="h2" id="worksTitle">Peças feitas para parar o scroll<span className="hl">.</span></h2>
      </div>
      <div className="filter-dock">
        <Segmented items={FILTERS} value={filter} onChange={(v) => { haptic('selection'); setFilter(v); }} />
      </div>
      <div className={`bento${filter !== 'all' ? ' filtered' : ''}`}>
        {list.map((w) => <WorkCard key={`${filter}-${w.title}`} work={w} onOpen={(x) => onOpen(x, list)} />)}
      </div>
    </section>
  );
}

/* ---------- Sobre ---------- */
function About() {
  return (
    <section className="section" id="sobre" aria-labelledby="aboutTitle">
      <div className="reveal" style={{ marginBottom: 'clamp(28px,4vw,44px)' }}>
        <p className="eyebrow">Sobre</p>
        <h2 className="h2" id="aboutTitle">Design com intenção, detalhe com obsessão<span className="hl">.</span></h2>
      </div>
      <div className="stage">
        <div className="stage-art" data-glisse-backdrop aria-hidden="true" dangerouslySetInnerHTML={{ __html: ABOUT_ART }} />
        <div className="about">
          <Glass className="panel about-copy">
            <p>Sou <strong>Will</strong>, designer gráfico e artista digital. Comecei editando thumbnails para amigos e hoje crio <strong>identidades visuais, artes 3D e pacotes de GFX</strong> para criadores de conteúdo, servidores e pequenas marcas.</p>
            <p>Meu processo é simples: entender quem vai ver, decidir o que precisa ser lembrado e remover todo o resto. Peças limpas, com contraste e personalidade — que funcionam num ícone de 48 px e num pôster impresso.</p>
            <div className="stats">
              <div className="stat"><b>6</b><span>anos criando</span></div>
              <div className="stat"><b>320+</b><span>projetos entregues</span></div>
              <div className="stat"><b>48h</b><span>primeiro esboço</span></div>
            </div>
            <div className="services">
              {['Identidade visual', 'Thumbnails', 'Banners & overlays', 'Render 3D', 'Pôsteres'].map((t) => <span className="tag" key={t}>{t}</span>)}
            </div>
          </Glass>
          <Glass className="panel tools-panel" role="complementary" aria-labelledby="toolsTitle">
            <h3 className="tools-title" id="toolsTitle">Ferramentas</h3>
            <div className="tools">
              {[['Bl', 'Blender', 'Modelagem · Render 3D'], ['Rs', 'Roblox Studio', 'Cenas · Assets · Builds'], ['Ps', 'Photoshop', 'Composição · GFX · Thumbnails']].map(([a, b, c]) => (
                <div className="tool" key={a}><i>{a}</i><div><b>{b}</b><span>{c}</span></div></div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contato ---------- */
function Contact({ toast }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText('willartzz'); haptic('success'); toast('Discord copiado: willartzz'); }
    catch { toast('Discord: willartzz'); }
  };
  return (
    <section className="section" id="contato" aria-labelledby="contactTitle">
      <div className="stage contact-stage">
        <div className="stage-art" data-glisse-backdrop aria-hidden="true" dangerouslySetInnerHTML={{ __html: CONTACT_ART }} />
        <Glass className="panel contact-card">
          <p className="eyebrow">Contato</p>
          <h2 className="h2" id="contactTitle">Tem uma ideia? Vamos dar <em className="hl">forma</em> a ela.</h2>
          <p className="lead">Respondo em até 24 horas — normalmente bem antes.</p>
          <div className="contact-grid">
            <button className="link-card" type="button" onClick={copy}>
              <span className="ico"><IDiscord /></span>
              <span><b>Discord</b><span className="meta">willartzz · toque para copiar</span></span><Copy />
            </button>
            <a className="link-card" href="https://x.com/willartzz" target="_blank" rel="noopener" onClick={() => haptic()}>
              <span className="ico"><IX /></span><span><b>Twitter / X</b><span className="meta">@willartzz</span></span><Ext />
            </a>
            <a className="link-card" href="https://www.behance.net/willartzz" target="_blank" rel="noopener" onClick={() => haptic()}>
              <span className="ico"><IBe /></span><span><b>Portfólio</b><span className="meta">behance.net/willartzz</span></span><Ext />
            </a>
          </div>
        </Glass>
      </div>
    </section>
  );
}

/* ---------- Visualizador ---------- */
function Viewer({ state, setState }) {
  const ref = useRef(null);
  const work = state && state.list[state.i];
  useEffect(() => {
    const d = ref.current;
    if (work && !d.open) { d.showModal(); document.body.style.overflow = 'hidden'; }
    if (!work && d.open) d.close();
  }, [work]);
  const go = useCallback((dir) => { haptic(); setState((st) => ({ ...st, i: (st.i + dir + st.list.length) % st.list.length })); }, [setState]);
  return (
    <dialog className="viewer" ref={ref} aria-labelledby="vTitle"
      onClose={() => { document.body.style.overflow = ''; setState(null); }}
      onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}>
      {work && (
        <Glass className="viewer-inner">
          <Button className="viewer-close" icon={<Close />} aria-label="Fechar" onClick={() => { haptic(); ref.current.close(); }} />
          <div className="viewer-art" style={work.bg ? { background: work.bg } : undefined} dangerouslySetInnerHTML={{ __html: work.art }} />
          <div className="viewer-body">
            <p className="eyebrow">{work.idx}</p>
            <h3 id="vTitle">{work.title}</h3>
            <p>{work.desc}</p>
            <dl><dt>Cliente</dt><dd>{work.client}</dd><dt>Ano</dt><dd>{work.year}</dd><dt>Ferramentas</dt><dd>{work.tools}</dd></dl>
            <div className="viewer-nav">
              <Button onClick={() => go(-1)}>← Anterior</Button>
              <Button onClick={() => go(1)}>Próximo →</Button>
            </div>
          </div>
        </Glass>
      )}
    </dialog>
  );
}

/* ---------- App ---------- */
export default function App() {
  const active = useActiveSection();
  useReveal();
  const [viewer, setViewer] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(0);
  const toast = (m) => { setToastMsg(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastMsg(null), 2200); };

  return (
    <>
      <TopNav active={active} />
      <main>
        <Hero />
        <Works onOpen={(w, list) => { haptic('medium'); setViewer({ list, i: list.indexOf(w) }); }} />
        <About />
        <Contact toast={toast} />
      </main>
      <footer>
        <span>© {new Date().getFullYear()} WillArtzz. Todos os direitos reservados.</span>
        <a href="#top" onClick={() => haptic()}>Voltar ao topo ↑</a>
      </footer>
      <MobileTabs active={active} />
      <Viewer state={viewer} setState={setViewer} />
      <div className="toast-dock" role="status" aria-live="polite">
        <Glass className={`toast${toastMsg ? ' show' : ''}`}><Check /><span>{toastMsg ?? ''}</span></Glass>
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
