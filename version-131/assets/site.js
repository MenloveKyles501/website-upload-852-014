
(function(){
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  function qs(name){ return new URLSearchParams(location.search).get(name) || ''; }

  // Mobile menu
  const menuToggle = $('[data-menu-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  if(menuToggle && mobileNav){
    menuToggle.addEventListener('click', () => mobileNav.classList.toggle('is-open'));
  }

  // Hero carousel buttons
  $$('[data-scroll-carousel]').forEach(btn => {
    const target = document.querySelector(btn.getAttribute('data-scroll-carousel'));
    if(!target) return;
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-dir') || 'next';
      const step = Math.max(260, target.clientWidth * 0.72);
      target.scrollBy({left: dir === 'next' ? step : -step, behavior: 'smooth'});
    });
  });

  // Search box on home/library pages
  $$('[data-search-target]').forEach(form => {
    const input = $('input[type="search"], input[type="text"]', form);
    const target = document.querySelector(form.getAttribute('data-search-target'));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if(target && input){
        target.value = input.value.trim();
        target.dispatchEvent(new Event('input', {bubbles:true}));
      } else if(input && input.value.trim()){
        location.href = `library.html?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });

  // DOM filtering for pages with cards already rendered
  const filterShell = $('[data-filter-shell]');
  if(filterShell){
    const cards = $$('.movie-card', filterShell);
    const search = $('[data-filter-search]', filterShell);
    const year = $('[data-filter-year]', filterShell);
    const type = $('[data-filter-type]', filterShell);
    const region = $('[data-filter-region]', filterShell);
    const chips = $$('[data-filter-genre]', filterShell);
    let activeGenre = '';

    function apply(){
      const q = (search && search.value || '').trim().toLowerCase();
      const y = year && year.value;
      const t = type && type.value;
      const r = region && region.value;
      let visible = 0;
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const genres = (card.dataset.genres || '').toLowerCase();
        const yy = card.dataset.year || '';
        const tt = card.dataset.type || '';
        const rr = card.dataset.region || '';
        const ok = (!q || title.includes(q) || genres.includes(q))
          && (!y || yy === y)
          && (!t || tt === t)
          && (!r || rr === r)
          && (!activeGenre || genres.includes(activeGenre.toLowerCase()));
        card.style.display = ok ? '' : 'none';
        if(ok) visible += 1;
      });
      const countNode = $('[data-filter-count]', filterShell);
      if(countNode) countNode.textContent = `${visible}`;
    }

    [search, year, type, region].forEach(el => el && el.addEventListener('input', apply));
    chips.forEach(btn => btn.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeGenre = btn.dataset.filterGenre || '';
      apply();
    }));
    apply();
  }

  // Library page dynamic rendering / pagination
  const library = $('[data-library-page]');
  if(library){
    const initLibrary = () => {
      const catalog = window.MOVIE_CATALOG;
      if(!Array.isArray(catalog)) return;
      const grid = $('[data-library-grid]', library);
      const pager = $('[data-library-pager]', library);
      const count = $('[data-library-count]', library);
      const queryInput = $('[data-library-search]', library);
      const typeSel = $('[data-library-type]', library);
      const regionSel = $('[data-library-region]', library);
      const yearSel = $('[data-library-year]', library);
      const pageSize = 36;
      let page = Math.max(1, parseInt(qs('page') || '1', 10) || 1);
      let q = qs('q').trim().toLowerCase();
      if(queryInput) queryInput.value = qs('q');
      if(typeSel) typeSel.value = qs('type');
      if(regionSel) regionSel.value = qs('region');
      if(yearSel) yearSel.value = qs('year');

      function filterItems(){
        const type = (typeSel && typeSel.value || '').trim();
        const region = (regionSel && regionSel.value || '').trim();
        const year = (yearSel && yearSel.value || '').trim();
        q = (queryInput && queryInput.value || '').trim().toLowerCase();
        return catalog.filter(item => {
          const title = (item.title || '').toLowerCase();
          const genres = (item.genres || '').join(' ').toLowerCase();
          const tags = (item.tags || []).join(' ').toLowerCase();
          return (!q || title.includes(q) || genres.includes(q) || tags.includes(q))
            && (!type || item.type === type)
            && (!region || item.region === region)
            && (!year || String(item.year) === year);
        });
      }

      function renderCard(item){
      return `
      <article class="movie-card" data-title="${escapeHtml(item.title)}" data-year="${item.year}" data-type="${escapeHtml(item.type)}" data-region="${escapeHtml(item.region)}" data-genres="${escapeHtml((item.genres || []).join(' '))}" data-score="${item.score}">
        <a href="${item.href}" class="movie-card__link">
          ${posterMarkup(item)}
          <div class="movie-card__body">
            <div class="movie-card__top"><h3>${escapeHtml(item.title)}</h3><span class="rating">${item.score.toFixed(1)}</span></div>
            <p class="movie-card__meta">${escapeHtml(item.year)} · ${escapeHtml(item.type)} · ${escapeHtml(item.region)}</p>
            <p class="movie-card__text">${escapeHtml(item.one_line || '')}</p>
            <div class="tag-row">${(item.genres || []).slice(0,2).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </a>
      </article>`;
    }

    function posterMarkup(item){
      return `
        <div class="poster" style="--c1:${item.c1};--c2:${item.c2};--c3:${item.c3};--dark:${item.dark}">
          <span class="poster__id">#${String(item.id).padStart(4,'0')}</span>
          <strong class="poster__title">${escapeHtml(item.title)}</strong>
          <span class="poster__meta">${escapeHtml(item.year)} · ${escapeHtml(item.region)}</span>
          <span class="poster__meta poster__meta--bottom">${escapeHtml((item.genres || []).slice(0,2).join(' · '))}</span>
        </div>`;
    }

    function escapeHtml(str){
      return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function syncUrl(nextPage){
      const params = new URLSearchParams();
      if(queryInput && queryInput.value.trim()) params.set('q', queryInput.value.trim());
      if(typeSel && typeSel.value) params.set('type', typeSel.value);
      if(regionSel && regionSel.value) params.set('region', regionSel.value);
      if(yearSel && yearSel.value) params.set('year', yearSel.value);
      if(nextPage && nextPage > 1) params.set('page', String(nextPage));
      const url = `${location.pathname}?${params.toString()}`;
      history.replaceState(null, '', params.toString() ? url : location.pathname);
    }

    function render(){
      const filtered = filterItems();
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.min(page, totalPages);
      const start = (page - 1) * pageSize;
      const slice = filtered.slice(start, start + pageSize);
      if(count) count.textContent = String(total);
      if(grid) grid.innerHTML = slice.map(renderCard).join('') || '<div class="empty-state">没有找到匹配影片，试试其它关键词或筛选条件。</div>';
      if(pager){
        let html = '';
        const makeBtn = (label, p, cls='') => `<button type="button" class="${cls}" data-go-page="${p}" ${p<1 || p>totalPages ? 'disabled':''}>${label}</button>`;
        html += makeBtn('上一页', page - 1);
        const windowStart = Math.max(1, page - 2);
        const windowEnd = Math.min(totalPages, page + 2);
        if(windowStart > 1) html += makeBtn('1', 1, page===1?'is-current':'');
        if(windowStart > 2) html += '<span class="pager__dots">…</span>';
        for(let p=windowStart; p<=windowEnd; p++) html += makeBtn(String(p), p, p===page?'is-current':'');
        if(windowEnd < totalPages - 1) html += '<span class="pager__dots">…</span>';
        if(windowEnd < totalPages) html += makeBtn(String(totalPages), totalPages, page===totalPages?'is-current':'');
        html += makeBtn('下一页', page + 1);
        pager.innerHTML = html;
        $$('[data-go-page]', pager).forEach(btn => btn.addEventListener('click', ()=>{
          const p = parseInt(btn.getAttribute('data-go-page'),10);
          if(!Number.isNaN(p) && p>=1 && p<=totalPages){ page = p; syncUrl(page); render(); window.scrollTo({top:0, behavior:'smooth'}); }
        }));
      }
      syncUrl(page);
    }

    [queryInput, typeSel, regionSel, yearSel].forEach(el => el && el.addEventListener('input', ()=>{ page=1; render(); }));
      render();
    };
    if(Array.isArray(window.MOVIE_CATALOG)) {
      initLibrary();
    } else {
      window.addEventListener("load", initLibrary, { once: true });
    }
  }

  // Detail page player with HLS support
  const player = $('[data-player]');
  if(player){
    const video = $('video', player);
    const btns = $$('[data-source]', player);
    const sources = JSON.parse(player.getAttribute('data-sources') || '[]');
    const hlsSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    const mp4Src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    let hls;

    function setSource(kind){
      const src = kind === 'hls' ? hlsSrc : mp4Src;
      btns.forEach(b => b.classList.toggle('is-active', b.dataset.source === kind));
      if(video.canPlayType('application/vnd.apple.mpegurl') && kind === 'hls'){
        video.src = src;
      } else if(kind === 'hls' && window.Hls && window.Hls.isSupported()){
        if(hls) hls.destroy();
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        if(hls){ hls.destroy(); hls = null; }
        video.src = src;
      }
      video.play().catch(()=>{});
    }

    btns.forEach(btn => btn.addEventListener('click', ()=>setSource(btn.dataset.source)));
    setSource('mp4');
  }
})();
