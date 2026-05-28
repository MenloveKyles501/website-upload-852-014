(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-control.prev');
    var next = carousel.querySelector('.hero-control.next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initPageFilter() {
    var input = document.querySelector('.page-filter');
    var year = document.querySelector('.year-filter');
    var list = document.getElementById('category-list');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchYear = !selectedYear || cardYear === selectedYear;
        card.classList.toggle('is-filtered-out', !(matchText && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card compact-card">',
      '  <a href="' + escapeHtml(item.url) + '" class="movie-link" aria-label="' + escapeHtml(item.title) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '      <span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '    </div>',
      '    <div class="movie-info">',
      '      <h3>' + escapeHtml(item.title) + '</h3>',
      '      <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '年</span></div>',
      '      <p>' + escapeHtml(item.oneLine || item.genre || '') + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    var title = document.getElementById('search-title');
    var input = document.getElementById('search-page-input');
    if (!results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    if (input) {
      input.value = q;
    }
    if (!q) {
      return;
    }
    var lower = q.toLowerCase();
    var matched = window.SEARCH_DATA.filter(function (item) {
      var haystack = [item.title, item.region, item.year, item.type, item.genre, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return haystack.indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = '搜索结果：' + q;
    }
    results.innerHTML = matched.length
      ? matched.map(cardTemplate).join('')
      : '<div class="empty-result">未找到相关影片</div>';
  }

  ready(function () {
    initMenu();
    initCarousel();
    initPageFilter();
    initSearchPage();
  });
})();

function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !source) {
    return;
  }
  var loaded = false;
  var hlsInstance = null;

  function attach() {
    if (loaded) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    loaded = true;
  }

  function play() {
    attach();
    button.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}
