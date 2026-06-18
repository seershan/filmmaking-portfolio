(function () {
  const THEME_KEY = "seershan-theme";
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll("[data-theme-text]").forEach((el) => {
      el.textContent = theme === "dark" ? "Dark" : "Light";
    });
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.body.classList.add("theme-transition");
    applyTheme(theme);
    setTimeout(() => document.body.classList.remove("theme-transition"), 350);
  }

  function navMarkup(prefix = "../") {
    return `
      <nav class="nav" aria-label="Primary">
        <a class="brand" href="${prefix}index.html">
          <span class="brand-mark">S</span>
          <span>Seershan Mitra</span>
        </a>
        <div class="nav-links" data-nav-links>
          <a href="${prefix}index.html">Home</a>
          <a href="${prefix}photographs/all.html">Photographs</a>
          <a href="${prefix}videos/all.html">Videos</a>
          <a href="${prefix}films/short-films.html">Films</a>
          <a href="${prefix}about/about.html">About</a>
          <a href="${prefix}connect/connect.html">Connect</a>
        </div>
        <div class="nav-actions">
          <button class="theme-toggle" type="button" aria-pressed="true" aria-label="Toggle theme"><span class="thumb" aria-hidden="true"></span></button>
          <button class="btn hamburger" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">☰</button>
        </div>
      </nav>
      <div class="mobile-panel" id="mobile-nav" hidden>
        <a href="${prefix}index.html">Home</a>
        <a href="${prefix}photographs/all.html">Photographs</a>
        <a href="${prefix}videos/all.html">Videos</a>
        <a href="${prefix}films/short-films.html">Films</a>
        <a href="${prefix}about/about.html">About</a>
        <a href="${prefix}connect/connect.html">Connect</a>
      </div>
    `;
  }

  function setupNav(prefix = "../") {
    const wrap = document.querySelector("[data-nav-wrap]");
    if (!wrap) return;
    wrap.innerHTML = navMarkup(prefix);

    const current = location.pathname.split("/").pop() || "index.html";
    wrap.querySelectorAll(".nav-links a, .mobile-panel a").forEach((a) => {
      const target = a.getAttribute("href").split("/").pop();
      if (target === current) a.classList.add("active");
    });

    const toggle = wrap.querySelector(".theme-toggle");
    if (toggle) toggle.addEventListener("click", toggleTheme);

    const burger = wrap.querySelector(".hamburger");
    const panel = wrap.querySelector(".mobile-panel");
    if (burger && panel) {
      burger.addEventListener("click", () => {
        const open = !panel.hasAttribute("hidden");
        if (open) {
          panel.setAttribute("hidden", "");
          panel.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        } else {
          panel.removeAttribute("hidden");
          panel.classList.add("open");
          burger.setAttribute("aria-expanded", "true");
        }
      });
      panel.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          panel.setAttribute("hidden", "");
          panel.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        })
      );
    }

    const nav = wrap.querySelector(".nav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initLoadingScreen() {
    const loading = document.querySelector(".loading-screen");
    if (!loading) return;
    window.addEventListener("load", () => setTimeout(() => loading.classList.add("hide"), 250));
    setTimeout(() => loading.classList.add("hide"), 2600);
  }

  function initReveals() {
    const targets = document.querySelectorAll("[data-reveal], .reveal, .stagger");
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          if (entry.target.hasAttribute("data-reveal")) observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    targets.forEach((el) => observer.observe(el));
  }

  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("cursor-active");

    let x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.left = x + "px"; dot.style.top = y + "px"; dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
    const animate = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animate);
    };
    animate();
    document.addEventListener("mouseleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { dot.style.opacity = "1"; ring.style.opacity = "1"; });
    document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
      el.addEventListener("mouseenter", () => { ring.style.width = "44px"; ring.style.height = "44px"; });
      el.addEventListener("mouseleave", () => { ring.style.width = "34px"; ring.style.height = "34px"; });
    });
  }

  function youtubeEmbed(url) {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}?autoplay=1&rel=0`;
      if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}?autoplay=1&rel=0`;
      if (u.pathname.includes("/embed/")) return url;
    } catch (e) {}
    return url;
  }

  function closeTopModal() {
    document.querySelectorAll(".lightbox, .modal").forEach((el) => el.remove());
  }

  function openModal(innerHtml, type = "modal") {
    closeTopModal();
    const wrap = document.createElement("div");
    wrap.className = type;
    wrap.innerHTML = innerHtml;
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.matches("[data-close-modal]")) closeTopModal();
    });
    document.body.appendChild(wrap);
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { closeTopModal(); document.removeEventListener("keydown", esc); }
    });
    return wrap;
  }

  function generateFallback(title) {
    const safe = (title || "Visual").replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#20212b"/>
            <stop offset="100%" stop-color="#6b5a45"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g)"/>
        <circle cx="970" cy="130" r="170" fill="rgba(255,255,255,0.08)"/>
        <circle cx="180" cy="650" r="220" fill="rgba(255,255,255,0.05)"/>
        <text x="80" y="700" fill="white" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="74" font-weight="700">${safe}</text>
      </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function initImageFallback(scope = document) {
    scope.querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "1";
        img.src = generateFallback(img.alt || "Visual");
      });
    });
  }

  function createLightbox(src, caption = "") {
    openModal(`
      <div class="lightbox-inner">
        <div class="modal-top">
          <div><div class="kicker">Photograph</div><h3>${caption || "Viewing"}</h3></div>
          <button class="close-btn" type="button" data-close-modal aria-label="Close">✕</button>
        </div>
        <div class="lightbox-media"><img src="${src}" alt="${caption}"></div>
      </div>
    `, "lightbox");
  }

  function createVideoModal(src, title = "") {
    const embed = youtubeEmbed(src);
    const isYoutube = /youtube\.com|youtu\.be/.test(embed);
    openModal(`
      <div class="modal-inner">
        <div class="modal-top">
          <div><div class="kicker">Playback</div><h3>${title || "Video"}</h3></div>
          <button class="close-btn" type="button" data-close-modal aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          ${isYoutube ? `
            <div style="aspect-ratio:16/9; overflow:hidden; border-radius:22px; border:1px solid var(--line); background:#000;">
              <iframe title="${title}" src="${embed}" style="width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>` : `
            <video controls autoplay playsinline style="width:100%;border-radius:22px;border:1px solid var(--line);background:#000;">
              <source src="${src}" type="video/mp4">
            </video>`}
        </div>
      </div>
    `, "modal");
  }

  function createFilterBar(filters, onChange) {
    const bar = document.createElement("div");
    bar.className = "gallery-toolbar";
    filters.forEach((filter, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = filter.label;
      btn.className = idx === 0 ? "active" : "";
      btn.addEventListener("click", () => {
        [...bar.querySelectorAll("button")].forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        onChange(filter.value);
      });
      bar.appendChild(btn);
    });
    return bar;
  }

  function renderMasonryGallery({ mount, items, filters }) {
    if (!mount) return;
    mount.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "stack-lg";
    const barHost = document.createElement("div");
    const grid = document.createElement("div");
    grid.className = "masonry";
    wrap.append(barHost, grid);
    mount.appendChild(wrap);

    function paint(list) {
      grid.innerHTML = "";
      list.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card gallery-card reveal";
        card.innerHTML = `
          <div class="gallery-media">
            <img data-fallback src="${item.src}" alt="${item.title}" loading="lazy">
          </div>
          <div class="pad">
            <div class="badge-row" style="margin-bottom:10px;">
              <span class="badge">${item.category}</span>${item.year ? `<span class="badge">${item.year}</span>` : ""}
            </div>
            <h3 style="margin-bottom:8px;">${item.title}</h3>
            <p>${item.description || ""}</p>
          </div>
        `;
        card.querySelector(".gallery-media").addEventListener("click", () => createLightbox(item.src, item.title));
        grid.appendChild(card);
      });
      initImageFallback(grid);
      initReveals();
    }

    barHost.appendChild(createFilterBar(filters || [{ label: "All", value: "all" }], (value) => paint(value === "all" ? items : items.filter((i) => i.categoryKey === value))));
    paint(items);
  }

  function renderVideoGallery({ mount, items, filters }) {
    if (!mount) return;
    mount.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "stack-lg";
    const barHost = document.createElement("div");
    const grid = document.createElement("div");
    grid.className = "grid auto";
    wrap.append(barHost, grid);
    mount.appendChild(wrap);

    function paint(list) {
      grid.innerHTML = "";
      list.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card video-card reveal";
        card.innerHTML = `
          <div class="video-media">
            <video muted playsinline loop preload="metadata" poster="${item.poster || ""}">
              <source src="${item.src}" type="video/mp4">
            </video>
          </div>
          <div class="pad">
            <div class="badge-row" style="margin-bottom:10px;">
              <span class="badge">${item.category}</span>${item.duration ? `<span class="badge">${item.duration}</span>` : ""}
            </div>
            <h3 style="margin-bottom:8px;">${item.title}</h3>
            <p>${item.description || ""}</p>
          </div>
        `;
        const video = card.querySelector("video");
        const media = card.querySelector(".video-media");
        media.addEventListener("mouseenter", () => video.play().catch(()=>{}));
        media.addEventListener("mouseleave", () => { video.pause(); video.currentTime = 0; });
        media.addEventListener("click", () => createVideoModal(item.src, item.title));
        grid.appendChild(card);
      });
      initReveals();
    }

    barHost.appendChild(createFilterBar(filters || [{ label: "All", value: "all" }], (value) => paint(value === "all" ? items : items.filter((i) => i.categoryKey === value))));
    paint(items);
  }

  function renderFilmAccordion({ mount, films }) {
    if (!mount) return;
    mount.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "grid auto";
    mount.appendChild(grid);
    const openByDefault = films[0] ? films[0].title : null;

    function filmDetails(film) {
      const listify = (arr) => Array.isArray(arr) ? arr.join(", ") : (arr || "");
      return `
        <div class="pad-lg stack-lg" style="border-top:1px solid var(--line);">
          <div class="grid cols-2" style="align-items:start;">
            <div class="stack">
              <div class="badge-row">
                <span class="badge">${film.year || ""}</span>
                <span class="badge">${film.genre || ""}</span>
                <span class="badge">${film.runtime || ""}</span>
              </div>
              <p>${film.synopsis || ""}</p>
              <div class="grid cols-2">
                <div class="stack">
                  <div><strong>Director</strong><br><span class="mini-text">${film.director || ""}</span></div>
                  <div><strong>Writer</strong><br><span class="mini-text">${film.writer || ""}</span></div>
                  <div><strong>Cinematography</strong><br><span class="mini-text">${film.cinematography || ""}</span></div>
                </div>
                <div class="stack">
                  <div><strong>Cast</strong><br><span class="mini-text">${listify(film.cast)}</span></div>
                  <div><strong>Language</strong><br><span class="mini-text">${film.language || ""}</span></div>
                  <div><strong>Festival Selections</strong><br><span class="mini-text">${listify(film.festivalSelections)}</span></div>
                </div>
              </div>
              <div class="stack">
                <div><strong>Production Notes</strong><br><span class="mini-text">${film.productionNotes || ""}</span></div>
                <div><strong>Awards Won</strong><br><span class="mini-text">${listify(film.awardsWon)}</span></div>
              </div>
              <div class="hero-actions">
                ${film.trailerUrl ? `<button class="btn primary" data-trailer="${film.trailerUrl}">Watch Trailer</button>` : ""}
                ${film.filmUrl ? `<button class="btn" data-film="${film.filmUrl}">Watch Film</button>` : ""}
              </div>
            </div>
            <div class="card" style="overflow:hidden;">
              <img data-fallback src="${film.poster}" alt="${film.title} poster" style="width:100%;aspect-ratio:2/3;object-fit:cover;">
            </div>
          </div>
        </div>
      `;
    }

    function draw(openTitle) {
      grid.innerHTML = "";
      films.forEach((film) => {
        const card = document.createElement("article");
        card.className = "card film-card reveal";
        const isOpen = film.title === openTitle;
        card.innerHTML = `
          <div class="film-poster">
            <img data-fallback src="${film.poster}" alt="${film.title} poster" loading="lazy">
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 35%, rgba(0,0,0,.78));"></div>
            <div style="position:absolute;left:18px;right:18px;bottom:16px;z-index:1;">
              <div class="badge-row" style="margin-bottom:10px;">
                <span class="badge">${film.year || ""}</span>
                <span class="badge">${film.runtime || ""}</span>
              </div>
              <h3 style="color:white;">${film.title}</h3>
            </div>
          </div>
          <div class="pad">
            <p style="margin-bottom:8px;">${film.genre || ""}</p>
            <button class="btn ${isOpen ? "primary" : "ghost"}" type="button" data-toggle-film="${film.title}">
              ${isOpen ? "Close details" : "Open details"}
            </button>
          </div>
          ${isOpen ? filmDetails(film) : ""}
        `;
        grid.appendChild(card);
      });
      initImageFallback(grid);
      initReveals();
      grid.querySelectorAll("[data-toggle-film]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const title = btn.getAttribute("data-toggle-film");
          draw(openTitle === title ? null : title);
        });
      });
      grid.querySelectorAll("[data-trailer]").forEach((btn) => btn.addEventListener("click", () => createVideoModal(btn.getAttribute("data-trailer"), "Trailer")));
      grid.querySelectorAll("[data-film]").forEach((btn) => btn.addEventListener("click", () => createVideoModal(btn.getAttribute("data-film"), "Film")));
    }
    draw(openByDefault);
  }

  function renderTimeline({ mount, items }) {
    if (!mount) return;
    mount.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "timeline stack-lg";
    items.forEach((item) => {
      const el = document.createElement("article");
      el.className = "timeline-item card pad-lg reveal";
      el.innerHTML = `
        <div class="badge-row" style="margin-bottom:12px;">
          <span class="badge">${item.date || ""}</span>
          <span class="badge">${item.location || ""}</span>
        </div>
        <div class="grid cols-2" style="align-items:center;">
          <div class="stack">
            <h3>${item.festival || ""}</h3>
            <p>${item.award || ""}</p>
            <div class="mini-text">${item.status || ""}</div>
          </div>
          <div style="justify-self:end; max-width:120px;">
            ${item.logo ? `<img data-fallback src="${item.logo}" alt="${item.festival} logo" style="width:100%;object-fit:contain;">` : ""}
          </div>
        </div>
      `;
      wrap.appendChild(el);
    });
    mount.appendChild(wrap);
    initImageFallback(wrap);
    initReveals();
  }

  function validateAndAnimateForm(form) {
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const required = [...form.querySelectorAll("[required]")];
      let valid = true;
      required.forEach((field) => {
        field.style.borderColor = "";
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = "#d44";
        }
      });
      const feedback = form.querySelector("[data-form-feedback]");
      if (!valid) {
        if (feedback) { feedback.textContent = "Please fill in all required fields."; feedback.style.color = "#d44"; }
        return;
      }
      form.reset();
      if (feedback) { feedback.textContent = "Message sent successfully. I’ll get back to you soon."; feedback.style.color = "var(--accent)"; }
      form.classList.add("reveal", "in-view");
      setTimeout(() => feedback && (feedback.textContent = ""), 4000);
    });
  }

  window.PortfolioSite = {
    initTheme, setupNav, initLoadingScreen, initReveals, initCursor, initImageFallback,
    renderMasonryGallery, renderVideoGallery, renderFilmAccordion, renderTimeline,
    validateAndAnimateForm, createVideoModal, createLightbox, youtubeEmbed, closeTopModal
  };

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLoadingScreen();
    initReveals();
    initCursor();
    initImageFallback();
  });
})();