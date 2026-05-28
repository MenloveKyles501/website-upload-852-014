(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var header = document.querySelector(".site-header");
    if (!button || !header) {
      return;
    }
    button.addEventListener("click", function() {
      header.classList.toggle("menu-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        play();
      });
    });

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        play();
      });
    }

    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initSearch() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
    var globalInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    if (!areas.length && globalInputs.length) {
      areas = [document];
    }

    areas.forEach(function(area) {
      var input = area.querySelector("[data-search-input]") || document.querySelector("[data-search-input]");
      var select = area.querySelector("[data-filter-select]");
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-search-card]"));

      function apply() {
        var query = normalize(input ? input.value : "");
        var type = normalize(select ? select.value : "");
        cards.forEach(function(card) {
          var keywords = normalize(card.getAttribute("data-keywords"));
          var cardType = normalize(card.getAttribute("data-filter-type"));
          var matchQuery = !query || keywords.indexOf(query) !== -1;
          var matchType = !type || cardType.indexOf(type) !== -1;
          card.classList.toggle("is-hidden", !(matchQuery && matchType));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var hlsInstance = null;
    var attached = false;

    function attach() {
      if (!video || attached) {
        return;
      }
      var src = video.getAttribute("data-play");
      if (!src) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }
      video.src = src;
      attached = true;
    }

    function start() {
      attach();
      shell.classList.add("is-playing");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function() {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (!attached || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function() {
        shell.classList.add("is-playing");
      });
      video.addEventListener("ended", function() {
        shell.classList.remove("is-playing");
      });
    }

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
