/* ============================================================
   PORTFOLIO MARISKA NIRAMALA DEWI — SCRIPT FONDASI
   Navigasi sticky, active section observer, & mobile dock
   ============================================================ */

'use strict';

/* ─── UTILITIES ─── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ─── NAVIGATION & ACTIVE SECTION ─── */
(function initNav() {
  const nav = $('#nav');
  const allNavLinks = $$('.nav-link[data-section]');
  const mobileNavItems = $$('.mb-nav-item[data-section]');
  const sections = $$('section[id]');

  // Scroll: toggle .scrolled class on header
  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
  }, { passive: true });

  // Smooth scroll for all anchor links
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    
    let target = null;
    try { target = $(id); } catch (_) {}
    if (!target) return;

    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });

  // Highlight active section on scroll
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        allNavLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
        mobileNavItems.forEach(item => {
          item.classList.toggle('active', item.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -40% 0px' });

  sections.forEach(s => sectionObs.observe(s));
})();

/* ─── MOBILE BOTTOM NAV: AUTO COLLAPSE NEAR FOOTER ─── */
(function initMobileNavCollapse() {
  const nav = $('#mobileNav');
  const fab = $('#mbFab');
  const footer = $('footer');
  if (!nav || !fab || !footer) return;

  let atFooter = false;
  let isOpenAtFooter = false;
  let timer;

  const updateState = () => {
    const isCollapsed = atFooter && !isOpenAtFooter;
    nav.classList.toggle('is-collapsed', isCollapsed);
    fab.classList.toggle('is-visible', isCollapsed);
    fab.setAttribute('aria-expanded', String(!isCollapsed));
  };

  new IntersectionObserver(([entry]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (entry.isIntersecting !== atFooter) {
        atFooter = entry.isIntersecting;
        isOpenAtFooter = false;
        updateState();
      }
    }, 60);
  }, { threshold: 0.15 }).observe(footer);

  fab.addEventListener('click', () => {
    isOpenAtFooter = true;
    updateState();
  });

  document.addEventListener('click', e => {
    if (isOpenAtFooter && !e.target.closest('#mobileNav, #mbFab')) {
      isOpenAtFooter = false;
      updateState();
    }
  });
})();

/* ─── TABS KEAHLIAN (ACCESSIBLE WAI-ARIA TABLIST) ─── */
(function initSkillsTabs() {
  const tablist = $('.skills-tabs');
  if (!tablist) return;

  const tabs = $$('.skill-tab', tablist);
  const panels = $$('.skills-panel');

  const switchTab = (tab) => {
    const targetPanelId = tab.getAttribute('aria-controls');

    tabs.forEach(t => {
      const isSelected = t === tab;
      t.classList.toggle('active', isSelected);
      t.setAttribute('aria-selected', String(isSelected));
      t.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    panels.forEach(p => {
      const isMatch = p.id === targetPanelId;
      p.classList.toggle('active', isMatch);
      if (isMatch) {
        p.removeAttribute('hidden');
      } else {
        p.setAttribute('hidden', '');
      }
    });

    tab.focus();
  };

  tablist.addEventListener('click', e => {
    const tab = e.target.closest('.skill-tab');
    if (!tab) return;
    switchTab(tab);
  });

  tablist.addEventListener('keydown', e => {
    const currentTab = e.target.closest('.skill-tab');
    if (!currentTab) return;

    const idx = tabs.indexOf(currentTab);
    if (idx === -1) return;

    let nextIdx = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = (idx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = tabs.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      switchTab(tabs[nextIdx]);
    }
  });
})();

/* ─── LIGHTBOX MODAL SERTIFIKAT ─── */
(function initCertModal() {
  const modal = $('#certModal');
  const modalImg = $('#certModalImg');
  const modalTitle = $('#certModalTitle');
  const modalLink = $('#certModalLink');
  const closeBtn = $('#certModalClose');
  const backdrop = $('#certModalBackdrop');
  if (!modal || !modalImg || !closeBtn) return;

  const openModal = (src, title) => {
    modalImg.src = src;
    modalImg.alt = title;
    if (modalTitle) modalTitle.textContent = title;
    if (modalLink) modalLink.href = src;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.body.style.overflow = '';
  };

  document.addEventListener('click', e => {
    const trigger = e.target.closest('.cert-media');
    if (!trigger) return;
    const img = trigger.querySelector('.cert-img');
    const card = trigger.closest('.cert-card');
    const title = card ? card.querySelector('.cert-card-title')?.textContent : '';
    if (img && img.src) {
      openModal(img.src, title || img.alt);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.classList.contains('cert-media')) {
        e.preventDefault();
        const img = activeEl.querySelector('.cert-img');
        const card = activeEl.closest('.cert-card');
        const title = card ? card.querySelector('.cert-card-title')?.textContent : '';
        if (img && img.src) {
          openModal(img.src, title || img.alt);
        }
      }
    }
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
})();

