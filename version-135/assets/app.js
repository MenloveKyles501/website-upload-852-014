(function () {
  var searchToggle = document.querySelector('.js-search-toggle');
  var searchPanel = document.querySelector('.js-search-panel');
  var menuToggle = document.querySelector('.js-menu-toggle');
  var mobileMenu = document.querySelector('.js-mobile-menu');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('is-open');
      var input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('.js-hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startHero();
      });
    });

    startHero();
  }

  var localSearch = document.querySelector('.js-local-search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));

  function applyFilter(value) {
    var query = (value || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' ').toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });
    var old = document.querySelector('.no-results');
    if (old) {
      old.remove();
    }
    if (cards.length && shown === 0) {
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有找到匹配的影片';
      cards[0].parentNode.appendChild(empty);
    }
  }

  if (localSearch && cards.length) {
    var searchInput = localSearch.querySelector('input');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    localSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(searchInput.value);
    });

    searchInput.addEventListener('input', function () {
      applyFilter(searchInput.value);
    });

    if (initial) {
      searchInput.value = initial;
      applyFilter(initial);
    }
  }

  var backTop = document.createElement('button');
  backTop.className = 'back-top';
  backTop.type = 'button';
  backTop.setAttribute('aria-label', '返回顶部');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);

  window.addEventListener('scroll', function () {
    backTop.classList.toggle('is-visible', window.scrollY > 360);
  });

  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
