(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }

        document.addEventListener("DOMContentLoaded", callback);
    }

    function bindMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
            panel.hidden = expanded;
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        if (slides.length < 2) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function bindImages() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img"));

        images.forEach(function (image) {
            if (image.complete && image.naturalWidth === 0) {
                image.classList.add("image-missing");
            }

            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    function bindArchiveSearch() {
        var list = document.querySelector("[data-filter-list]");

        if (!list) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim().toLowerCase();
        var input = document.querySelector(".archive-search input[name='q']");
        var empty = document.querySelector(".search-empty");

        if (input && keyword) {
            input.value = keyword;
        }

        if (!keyword) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || "").toLowerCase();
            var matched = haystack.indexOf(keyword) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function initPlayer(source) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        var hlsInstance = null;
        var isLoaded = false;

        if (!video || !source) {
            return;
        }

        function load() {
            if (isLoaded) {
                return;
            }

            isLoaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                        return;
                    }

                    hlsInstance.destroy();
                });
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            video.src = source;
        }

        function start() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.MoviePlayer = {
        init: initPlayer
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindImages();
        bindArchiveSearch();
    });
})();
