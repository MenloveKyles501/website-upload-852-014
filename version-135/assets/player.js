(function () {
  var wrap = document.querySelector('.player-card[data-stream]');
  if (!wrap) {
    return;
  }

  var video = wrap.querySelector('video');
  var button = wrap.querySelector('.play-cover');
  var source = wrap.getAttribute('data-stream');
  var ready = false;
  var hls = null;

  function attachSource() {
    if (!video || !source || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();
    if (button) {
      button.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      if (hls) {
        hls.destroy();
        hls = null;
        ready = false;
      }
    });
  }
})();
