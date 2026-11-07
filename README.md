# WillArtzz — portfólio (React + glisse)

Liquid Glass feito com [glisse](https://www.npmjs.com/package/glisse).

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera dist/index.html (arquivo único, abre direto no navegador)
```

- `src/App.jsx` — página e componentes (`Glass`, `Button`, `SegmentedControl`, `TabBar` do glisse)
- `src/content.js` — trabalhos da galeria e artes de exemplo (troque pelos seus)
- `src/styles.css` — layout + tema do glisse (`--lg-*`)
- `src/terrain.js` — fundo do topo

Tudo que tem `data-glisse-backdrop` é refratado pelo vidro em qualquer navegador;
no resto da página a refração ao vivo funciona no Chrome/Edge e os demais mostram vidro fosco com aro de luz.
