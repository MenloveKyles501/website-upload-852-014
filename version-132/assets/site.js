(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ":" + String(rest).padStart(2, "0");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupGlobalSearch() {
    document.querySelectorAll(".global-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    var grid = document.querySelector("[data-card-grid]");
    var sort = document.querySelector("[data-sort-select]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre
        ].join(" ").toLowerCase();
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    }

    function sortCards() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice();
      if (value === "views") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      }
      if (value === "year") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (sort) {
      sort.addEventListener("change", function () {
        sortCards();
        filterCards();
      });
    }
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-views=\"" + escapeHtml(movie.views) + "\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"poster-shade\"></span>",
      "    <span class=\"play-badge\">立即观看</span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    var status = document.querySelector("[data-search-status]");
    var results = document.getElementById("searchResults");
    if (!form || !input || !status || !results || !window.MOVIE_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var normalized = query.trim().toLowerCase();
      if (!normalized) {
        results.innerHTML = "";
        status.textContent = "输入关键词即可查找影片。";
        return;
      }
      var matches = window.MOVIE_DATA.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(normalized) !== -1;
      }).slice(0, 120);
      status.textContent = matches.length ? "已为你筛选出相关影片。" : "没有找到相关影片。";
      results.innerHTML = matches.map(cardTemplate).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      history.replaceState(null, "", nextUrl);
      render(query);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initialQuery);
  }

  function setupPlayer() {
    document.querySelectorAll(".video-player-wrapper").forEach(function (wrapper) {
      var video = wrapper.querySelector("video");
      var source = wrapper.dataset.src;
      var centerPlay = wrapper.querySelector("[data-play-button]");
      var playToggle = wrapper.querySelector("[data-play-toggle]");
      var progress = wrapper.querySelector("[data-progress]");
      var time = wrapper.querySelector("[data-time]");
      var mute = wrapper.querySelector("[data-mute-toggle]");
      var fullscreen = wrapper.querySelector("[data-fullscreen]");

      if (!video || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }

      function syncState() {
        wrapper.classList.toggle("is-playing", !video.paused);
        if (playToggle) {
          playToggle.textContent = video.paused ? "播放" : "暂停";
        }
      }

      function togglePlay() {
        if (video.paused) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      }

      function syncProgress() {
        var duration = video.duration || 0;
        var current = video.currentTime || 0;
        if (progress) {
          progress.max = duration || 0;
          progress.value = current || 0;
        }
        if (time) {
          time.textContent = formatTime(current) + " / " + formatTime(duration);
        }
      }

      video.addEventListener("click", togglePlay);
      video.addEventListener("play", syncState);
      video.addEventListener("pause", syncState);
      video.addEventListener("loadedmetadata", syncProgress);
      video.addEventListener("timeupdate", syncProgress);
      if (centerPlay) {
        centerPlay.addEventListener("click", togglePlay);
      }
      if (playToggle) {
        playToggle.addEventListener("click", togglePlay);
      }
      if (progress) {
        progress.addEventListener("input", function () {
          video.currentTime = Number(progress.value || 0);
        });
      }
      if (mute) {
        mute.addEventListener("click", function () {
          video.muted = !video.muted;
          mute.textContent = video.muted ? "取消静音" : "静音";
        });
      }
      if (fullscreen) {
        fullscreen.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
          }
        });
      }
      syncState();
      syncProgress();
    });
  }

  ready(function () {
    setupMenu();
    setupGlobalSearch();
    setupHero();
    setupCardFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
