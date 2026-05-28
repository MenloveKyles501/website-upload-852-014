(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function initImages() {
    document.querySelectorAll('img[data-fallback]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      }, { once: true });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });
    start();
  }

  function initLocalFilters() {
    var grid = document.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    var input = document.querySelector('.local-filter');
    var type = document.querySelector('.type-filter');
    var year = document.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = value(input);
      var t = value(type);
      var y = value(year);
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!t || (card.getAttribute('data-type') || '').toLowerCase() === t) && (!y || (card.getAttribute('data-year') || '').toLowerCase() === y);
        card.style.display = ok ? '' : 'none';
      });
    }

    [input, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll('.video-box').forEach(function (box) {
      var video = box.querySelector('video[data-stream]');
      var button = box.querySelector('.play-overlay');
      if (!video || !button) {
        return;
      }
      var started = false;
      function start() {
        var source = video.getAttribute('data-stream');
        if (!source) {
          return;
        }
        if (!started) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }
          started = true;
        }
        button.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  function renderSearchCard(movie) {
    var image = movie.image || '1.jpg';
    return [
      '<article class="movie-card">',
      '<a class="cover-frame" href="' + movie.url + '">',
      '<img src="./' + image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback="cover">',
      '<span class="rating-badge">' + escapeHtml(movie.rating) + '</span>',
      '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.description) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<div class="card-tags"><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var summary = document.getElementById('searchSummary');
    if (!input || !results || !summary || !window.SiteMovieData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function apply() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = window.SiteMovieData.slice(0, 24).map(renderSearchCard).join('');
        summary.textContent = '推荐浏览以下精选影片，也可以输入关键词继续搜索。';
        initImages();
        return;
      }
      var matched = window.SiteMovieData.filter(function (movie) {
        return [movie.title, movie.description, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(renderSearchCard).join('');
      summary.textContent = matched.length ? '已匹配到相关影片。' : '暂未匹配到相关影片。';
      initImages();
    }

    input.addEventListener('input', apply);
    apply();
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });
})();
