function bootPlayer(videoId, streamUrl, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var prepared = false;
  var hlsObject = null;

  if (!video) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsObject = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsObject.loadSource(streamUrl);
      hlsObject.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    prepared = true;
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsObject) {
      hlsObject.destroy();
    }
  });
}
