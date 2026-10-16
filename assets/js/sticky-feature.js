(function () {
  function initScrollSwap() {
    var markers = Array.prototype.slice.call(document.querySelectorAll(".scroll-marker"));
    var track = document.getElementById("sticky-image-track");
    if (!markers.length || !track) return;

    var slideCount = track.children.length;
    var activeIndex = 0;
    var ticking = false;

    function update() {
      ticking = false;
      var viewportCenter = window.innerHeight / 2;
      var next = 0;
      markers.forEach(function (marker, i) {
        var rect = marker.getBoundingClientRect();
        if (rect.top <= viewportCenter) {
          var targetIndex = parseInt(marker.dataset.image, 10) - 1;
          if (!isNaN(targetIndex)) next = targetIndex;
        }
      });
      next = Math.max(0, Math.min(slideCount - 1, next));
      if (next !== activeIndex) {
        activeIndex = next;
        track.style.transform = "translateY(-" + activeIndex * 100 + "%)";
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function initLightbox() {
    var lightbox = document.getElementById("image-lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;
    var viewport = lightbox ? lightbox.querySelector(".lightbox-viewport") : null;
    var triggers = document.querySelectorAll(".zoomable-image");
    if (!lightbox || !lightboxImg || !triggers.length) return;

    var scale = 1;
    var minScale = 1;
    var maxScale = 5;
    var originX = 0;
    var originY = 0;
    var dragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragOriginX = 0;
    var dragOriginY = 0;

    function applyTransform() {
      lightboxImg.style.transform =
        "translate(" + originX + "px, " + originY + "px) scale(" + scale + ")";
    }

    function resetTransform() {
      scale = 1;
      originX = 0;
      originY = 0;
      applyTransform();
    }

    function open(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      resetTransform();
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.body.style.overflow = "";
    }

    triggers.forEach(function (frame) {
      frame.addEventListener("click", function () {
        var innerImg = frame.querySelector("img");
        var full = frame.dataset.full || (innerImg && innerImg.getAttribute("src"));
        var alt = frame.getAttribute("aria-label") || (innerImg && innerImg.getAttribute("alt"));
        if (full) open(full, alt);
      });
    });

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.hidden && e.key === "Escape") close();
    });

    viewport.addEventListener(
      "wheel",
      function (e) {
        if (lightbox.hidden) return;
        e.preventDefault();
        var delta = e.deltaY < 0 ? 0.2 : -0.2;
        var next = Math.min(maxScale, Math.max(minScale, scale + delta));
        scale = next;
        if (scale === minScale) {
          originX = 0;
          originY = 0;
        }
        applyTransform();
      },
      { passive: false }
    );

    lightboxImg.addEventListener("dblclick", function () {
      resetTransform();
    });

    viewport.addEventListener("mousedown", function (e) {
      if (scale <= minScale) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOriginX = originX;
      dragOriginY = originY;
      viewport.classList.add("grabbing");
    });

    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      originX = dragOriginX + (e.clientX - dragStartX);
      originY = dragOriginY + (e.clientY - dragStartY);
      applyTransform();
    });

    window.addEventListener("mouseup", function () {
      dragging = false;
      viewport.classList.remove("grabbing");
    });
  }

  function initHoverZoom() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var frames = document.querySelectorAll(".sticky-image-frame.hover-zoom");
    var zoomFactor = 2.4;
    var lensSize = 180;

    frames.forEach(function (frame) {
      var bgImage = frame.style.backgroundImage;
      if (!bgImage) return;

      var lens = document.createElement("div");
      lens.className = "zoom-lens";
      lens.style.width = lensSize + "px";
      lens.style.height = lensSize + "px";
      lens.style.backgroundImage = bgImage;
      frame.appendChild(lens);

      function position(e) {
        var rect = frame.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var lensX = Math.max(0, Math.min(rect.width - lensSize, x - lensSize / 2));
        var lensY = Math.max(0, Math.min(rect.height - lensSize, y - lensSize / 2));
        lens.style.left = lensX + "px";
        lens.style.top = lensY + "px";

        var bgWidth = rect.width * zoomFactor;
        var bgHeight = rect.height * zoomFactor;
        lens.style.backgroundSize = bgWidth + "px " + bgHeight + "px";

        var bgX = Math.max(0, Math.min(bgWidth - lensSize, x * zoomFactor - lensSize / 2));
        var bgY = Math.max(0, Math.min(bgHeight - lensSize, y * zoomFactor - lensSize / 2));
        lens.style.backgroundPosition = "-" + bgX + "px -" + bgY + "px";
      }

      frame.addEventListener("mouseenter", function (e) {
        lens.classList.add("visible");
        position(e);
      });
      frame.addEventListener("mousemove", position);
      frame.addEventListener("mouseleave", function () {
        lens.classList.remove("visible");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initScrollSwap();
      initLightbox();
      initHoverZoom();
    });
  } else {
    initScrollSwap();
    initLightbox();
    initHoverZoom();
  }
})();
