(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initMenu() {
    var button = $("[data-menu-button]");
    var menu = $("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeaderSearch() {
    var input = $("[data-site-search]");
    var box = $("[data-search-results]");
    var items = window.siteMovies || [];
    if (!input || !box || !items.length) {
      return;
    }

    function render(value) {
      var q = text(value).trim();
      if (!q) {
        box.classList.remove("is-open");
        box.innerHTML = "";
        return;
      }
      var results = items.filter(function (item) {
        return text(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.tags).indexOf(q) !== -1;
      }).slice(0, 8);
      if (!results.length) {
        box.classList.remove("is-open");
        box.innerHTML = "";
        return;
      }
      box.innerHTML = results.map(function (item) {
        return '<a href="./' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.oneLine) + '</small></a>';
      }).join("");
      box.classList.add("is-open");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && input.value.trim()) {
        window.location.href = "./movies.html?q=" + encodeURIComponent(input.value.trim());
      }
    });
    document.addEventListener("click", function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove("is-open");
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function initListing() {
    var panels = $all("[data-listing]");
    panels.forEach(function (panel) {
      var list = panel.parentElement.querySelector("[data-movie-list]");
      if (!list) {
        return;
      }
      var cards = $all(".movie-card", list);
      var search = $("[data-list-search]", panel);
      var region = $("[data-list-region]", panel);
      var type = $("[data-list-type]", panel);
      var year = $("[data-list-year]", panel);

      function apply() {
        var q = text(search && search.value).trim();
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        cards.forEach(function (card) {
          var content = text(card.dataset.title + " " + card.dataset.genre + " " + card.dataset.tags + " " + card.dataset.region + " " + card.dataset.type + " " + card.dataset.year + " " + card.dataset.category);
          var ok = true;
          if (q && content.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.dataset.region !== r) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
        });
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (search && params.get("q")) {
        search.value = params.get("q");
        apply();
      }
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader="true"]');
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback);
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (streamUrl, videoId) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
      return;
    }
    var shell = video.closest("[data-player]");
    var button = shell ? $("[data-play-button]", shell) : null;
    var started = false;
    var hlsInstance = null;

    function attachAndPlay() {
      if (button) {
        button.classList.add("is-hidden");
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
          video.play().catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener("click", attachAndPlay);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initListing();
  });
})();
