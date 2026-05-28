(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var navButton = document.querySelector(".nav-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (navButton && mobileMenu) {
      navButton.addEventListener("click", function () {
        var opened = mobileMenu.hasAttribute("hidden");
        if (opened) {
          mobileMenu.removeAttribute("hidden");
          navButton.setAttribute("aria-expanded", "true");
          navButton.textContent = "×";
        } else {
          mobileMenu.setAttribute("hidden", "");
          navButton.setAttribute("aria-expanded", "false");
          navButton.textContent = "☰";
        }
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list] .movie-card, [data-movie-list] .rank-item"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var resultLine = document.querySelector("[data-result-line]");
    var activeFilter = "all";
    var touched = false;

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var query = normalize(searchInput ? searchInput.value : "");
      var filter = normalize(activeFilter);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var ok = true;
        if (query) {
          ok = text.indexOf(query) !== -1;
        }
        if (ok && filter && filter !== "all") {
          ok = text.indexOf(filter) !== -1;
        }
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (resultLine && touched) {
        resultLine.textContent = "为你筛出 " + visible + " 部内容";
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        touched = true;
        applyFilter();
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        touched = true;
        activeFilter = button.getAttribute("data-filter-button") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilter();
      });
    });

    var defaultButton = document.querySelector('[data-filter-button="all"]');
    if (defaultButton) {
      defaultButton.classList.add("active");
    }
  });
})();
