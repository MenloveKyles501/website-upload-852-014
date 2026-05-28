
(function () {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('is-open');
      header.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  document.querySelectorAll('[data-filter]').forEach(function (filterBox) {
    const input = filterBox.querySelector('[data-filter-input]');
    const grid = document.querySelector('[data-card-grid]');
    const buttons = Array.from(filterBox.querySelectorAll('[data-filter-key]'));
    let activeKey = '';

    function applyFilter() {
      if (!grid) {
        return;
      }
      const query = input ? input.value.trim().toLowerCase() : '';
      grid.querySelectorAll('[data-search]').forEach(function (card) {
        const text = card.getAttribute('data-search').toLowerCase();
        const matchesQuery = !query || text.indexOf(query) !== -1;
        const matchesKey = !activeKey || text.indexOf(activeKey.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden-card', !(matchesQuery && matchesKey));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        input.value = q;
        applyFilter();
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeKey = button.getAttribute('data-filter-key') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });

  const player = document.querySelector('.js-player');
  if (player) {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const stream = player.getAttribute('data-stream');
    let attached = false;
    let hlsInstance = null;

    function attachStream() {
      if (attached || !video || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }
})();
