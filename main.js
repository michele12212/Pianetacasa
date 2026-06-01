/* ============================================
   PIANETA CASA FOGGIA — Main JS
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // UTILITIES
  // ============================================
  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  const formatPrice = (price, tipo) => {
    const formatted = Number(price).toLocaleString('it-IT');
    return tipo === 'affitto' ? `€ ${formatted}<span class="per-month"> / mese</span>` : `€ ${formatted}`;
  };

  const pluralize = (n, singular, plural) =>
    `${n} ${n === 1 ? singular : plural}`;

  // ============================================
  // PROPERTY CARD TEMPLATE
  // ============================================
  function renderCard(p) {
    const badgeLabel = p.tipo === 'vendita' ? 'Vendita' : 'Affitto';
    const badgeClass = p.tipo === 'vendita' ? 'gold' : '';
    const image = (p.foto && p.foto[0]) ? p.foto[0] : '';
    const price = formatPrice(p.prezzo, p.tipo);
    const ribassato = p.prezzo_ribassato
      ? `<span class="property-badge ribassato">Prezzo Ribassato</span>` : '';

    const metaItems = [];
    metaItems.push(`<span>${p.mq} mq</span>`);
    if (p.vani > 0) metaItems.push(`<span>${pluralize(p.vani, 'locale', 'locali')}</span>`);
    if (p.bagni > 0) metaItems.push(`<span>${pluralize(p.bagni, 'bagno', 'bagni')}</span>`);

    return `
      <a href="#" class="property-card" data-property-type="${p.tipo}" data-property-id="${p.id}">
        <div class="property-image">
          <div class="ph" style="background-image: url('${escapeHtml(image)}')"></div>
          <span class="property-badge ${badgeClass}">${badgeLabel}</span>
          ${ribassato}
          <div class="property-overlay">
            <div class="tipologia-tag">${escapeHtml(p.tipologia)}</div>
            <h3>${escapeHtml(p.titolo.split(' — ')[1] || p.titolo)}</h3>
            <div class="address">${escapeHtml(p.zona)}</div>
            <div class="price">${price}</div>
          </div>
        </div>
        <div class="property-info-block">
          <div class="property-meta">${metaItems.join('')}</div>
          <span class="gold-link">Scopri di più →</span>
        </div>
      </a>
    `;
  }

  // ============================================
  // MODAL — Property detail
  // ============================================
  function ensureModal() {
    let modal = document.getElementById('property-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'property-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" aria-label="Chiudi">×</button>
        <div class="modal-body"></div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
    return modal;
  }

  function openModal(p) {
    const modal = ensureModal();
    const fotoCount = (p.foto || []).length;
    const gallery = (p.foto || []).map((src, i) => `
      <div class="gallery-item ${i === 0 ? 'active' : ''}" style="background-image: url('${escapeHtml(src)}')"></div>
    `).join('');

    const thumbs = fotoCount > 1
      ? `<div class="gallery-thumbs">${(p.foto || []).map((src, i) => `
          <button class="thumb ${i === 0 ? 'active' : ''}" data-i="${i}" style="background-image: url('${escapeHtml(src)}')"></button>
        `).join('')}</div>` : '';

    const specs = [];
    specs.push({ k: 'Tipologia', v: p.tipologia });
    specs.push({ k: 'Categoria', v: p.categoria });
    specs.push({ k: 'Superficie', v: `${p.mq} mq` });
    if (p.vani > 0) specs.push({ k: 'Vani', v: p.vani });
    if (p.bagni > 0) specs.push({ k: 'Bagni', v: p.bagni });
    if (p.piano !== undefined) specs.push({ k: 'Piano', v: p.piano === 0 ? 'Terra/Rialzato' : p.piano });
    if (p.totale_piani) specs.push({ k: 'Piani edificio', v: p.totale_piani });
    if (p.stato) specs.push({ k: 'Stato', v: p.stato });
    if (p.ascensore !== undefined) specs.push({ k: 'Ascensore', v: p.ascensore ? 'Sì' : 'No' });
    if (p.aria_condizionata) specs.push({ k: 'Climatizzazione', v: 'Sì' });
    if (p.balconi) specs.push({ k: 'Balconi', v: p.balconi });
    if (p.giardino) specs.push({ k: 'Giardino', v: 'Sì' });
    if (p.classe_energetica) specs.push({ k: 'Classe energetica', v: p.classe_energetica });
    if (p.ipe) specs.push({ k: 'IPE', v: `${p.ipe} kWh/m²` });
    if (p.spese_condominiali) specs.push({ k: 'Spese condom.', v: `€ ${p.spese_condominiali} / mese` });

    const specsHtml = specs.map((s) => `
      <div class="spec-row"><span class="spec-k">${escapeHtml(s.k)}</span><span class="spec-v">${escapeHtml(String(s.v))}</span></div>
    `).join('');

    const badgeLabel = p.tipo === 'vendita' ? 'Vendita' : 'Affitto';

    modal.querySelector('.modal-body').innerHTML = `
      <div class="modal-gallery">
        ${gallery}
        ${fotoCount > 1 ? `
          <button class="gallery-nav prev" aria-label="Precedente">‹</button>
          <button class="gallery-nav next" aria-label="Successiva">›</button>
        ` : ''}
        <span class="property-badge ${p.tipo === 'vendita' ? 'gold' : ''}">${badgeLabel}</span>
        ${p.prezzo_ribassato ? `<span class="property-badge ribassato">Prezzo Ribassato</span>` : ''}
      </div>
      ${thumbs}
      <div class="modal-info">
        <div class="modal-header">
          <span class="eyebrow">${escapeHtml(p.zona)}</span>
          <h2>${escapeHtml(p.titolo)}</h2>
          <hr class="gold-rule gold-rule-left" />
          <div class="modal-price">${formatPrice(p.prezzo, p.tipo)}</div>
        </div>
        <div class="modal-specs">${specsHtml}</div>
        <div class="modal-desc">
          <h4>Descrizione</h4>
          <p>${escapeHtml(p.descrizione)}</p>
          ${p.note ? `<p class="note"><strong>Nota:</strong> ${escapeHtml(p.note)}</p>` : ''}
        </div>
        <div class="modal-cta">
          <a href="contatti.html" class="btn btn-gold">Richiedi Informazioni <span class="arrow">→</span></a>
          <a href="tel:+390881204434" class="btn btn-outline">Chiama 0881 / 204434</a>
        </div>
      </div>
    `;

    // Gallery interaction
    if (fotoCount > 1) {
      let current = 0;
      const items = modal.querySelectorAll('.gallery-item');
      const thumbBtns = modal.querySelectorAll('.thumb');
      const setActive = (i) => {
        current = (i + fotoCount) % fotoCount;
        items.forEach((el, idx) => el.classList.toggle('active', idx === current));
        thumbBtns.forEach((el, idx) => el.classList.toggle('active', idx === current));
      };
      modal.querySelector('.gallery-nav.prev').addEventListener('click', () => setActive(current - 1));
      modal.querySelector('.gallery-nav.next').addEventListener('click', () => setActive(current + 1));
      thumbBtns.forEach((btn) => btn.addEventListener('click', () => setActive(parseInt(btn.dataset.i, 10))));
    }

    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('property-modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bindCardClicks(container) {
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.property-card[data-property-id]');
      if (!card) return;
      e.preventDefault();
      const id = parseInt(card.dataset.propertyId, 10);
      const prop = (window.PROPERTIES || []).find((x) => x.id === id);
      if (prop) openModal(prop);
    });
  }

  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 30) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============================================
  // HAMBURGER MENU
  // ============================================
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      const isOpen = hamburger.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Available properties = exclude sold ones
  const AVAILABLE = (window.PROPERTIES || []).filter((p) => !p.venduto);

  // ============================================
  // RENDER: HOMEPAGE FEATURED
  // ============================================
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid && window.PROPERTIES) {
    const featuredIds = window.FEATURED_IDS || [];
    const featured = featuredIds
      .map((id) => AVAILABLE.find((p) => p.id === id))
      .filter(Boolean);
    featuredGrid.innerHTML = featured.map((p, i) => {
      const html = renderCard(p);
      return html.replace('class="property-card"', `class="property-card reveal reveal-delay-${i + 1}"`);
    }).join('');
    bindCardClicks(featuredGrid);
  }

  // ============================================
  // RENDER: IMMOBILI PAGE (FULL CATALOG)
  // ============================================
  const catalogGrid = document.getElementById('catalog-grid');
  const catalogCount = document.getElementById('catalog-count');

  if (catalogGrid && window.PROPERTIES) {
    const all = AVAILABLE.slice();
    catalogGrid.innerHTML = all.map((p) => renderCard(p)).join('');
    bindCardClicks(catalogGrid);

    const allCards = catalogGrid.querySelectorAll('.property-card');

    const updateCount = (n) => {
      if (catalogCount) {
        catalogCount.textContent = `${n} immobil${n === 1 ? 'e' : 'i'}`;
      }
    };
    updateCount(allCards.length);

    // Filters
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter;
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        let visibleCount = 0;
        let delay = 0;
        allCards.forEach((card) => {
          const type = card.dataset.propertyType;
          const match = filter === 'all' || type === filter;
          if (match) {
            card.style.display = '';
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = `fadeInStagger 0.6s var(--ease) ${delay}s both`;
            delay = Math.min(delay + 0.04, 0.6);
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });
        updateCount(visibleCount);
      });
    });
  }

  // ============================================
  // INTERSECTION OBSERVER: REVEAL ON SCROLL
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (reveals.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // ============================================
  // TESTIMONIALS SLIDER
  // ============================================
  const tSlider = document.getElementById('t-slider');
  if (tSlider) {
    const slides = tSlider.querySelectorAll('.testimonial');
    const prev = tSlider.querySelector('.t-prev');
    const next = tSlider.querySelector('.t-next');
    const dotsContainer = tSlider.querySelector('.t-dots');

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Recensione ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.dataset.i = i;
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.t-dot');
    let current = 0;
    let timer = null;

    const goTo = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    };

    const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
    const startTimer = () => {
      stopTimer();
      if (prefersReducedMotion) return;
      timer = setInterval(() => goTo(current + 1), 7000);
    };

    prev.addEventListener('click', () => { goTo(current - 1); startTimer(); });
    next.addEventListener('click', () => { goTo(current + 1); startTimer(); });
    dots.forEach((d) => d.addEventListener('click', () => {
      goTo(parseInt(d.dataset.i, 10));
      startTimer();
    }));

    tSlider.addEventListener('mouseenter', stopTimer);
    tSlider.addEventListener('mouseleave', startTimer);

    // Keyboard navigation
    tSlider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { goTo(current - 1); startTimer(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); startTimer(); }
    });
    tSlider.setAttribute('tabindex', '0');

    startTimer();
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    });
  }

  // ============================================
  // ACTIVE NAV LINK
  // ============================================
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();
