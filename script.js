// Global theme — same key 'theme' and <html> class on every page (home, blogs, builds)
var themeKey = 'theme';
var root = document.documentElement;

function getStoredTheme() {
  try {
    var stored = localStorage.getItem(themeKey);
    if (stored === 'theme-light' || stored === 'theme-dark') return stored;
  } catch (e) { }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'theme-light' : 'theme-dark';
}

function initTheme() {
  root.className = getStoredTheme();
}

function toggleTheme() {
  var next = root.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
  root.className = next;
  try { localStorage.setItem(themeKey, next); } catch (e) { }
}

//dynamic age counter
function calculateAge() {
  const birthDate = new Date("2006-10-30T00:00:00");
  const now = new Date();

  const ageInMs = now - birthDate;

  //aaverage year = 365.25 days)
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const ageInYears = ageInMs / msPerYear;

  //upto 9 decimal places
  return ageInYears.toFixed(9);
}

function updateAge() {
  const ageElement = document.getElementById("age-counter");
  if (ageElement) {
    ageElement.textContent = calculateAge();
  }
}

// Command palette — pages list (same on every page)
var PALETTE_PAGES = [
  { label: "home", path: "index.html", slug: "/" },
  { label: "builds", path: "builds.html", slug: "/builds" },
  { label: "blogs", path: "blogs.html", slug: "/blogs" },
  { label: "hi", path: "hi.html", slug: "/hi" },
  { label: "my journey on x", path: "myjourneyonx.html", slug: "/myjourneyonx" },
  { label: "people", path: "people.html", slug: "/people" },
  { label: "values", path: "values.html", slug: "/values" },
];

var paletteOverlay = null;
var paletteSearch = null;
var paletteListEl = null;
var selectedIndex = 0;
var filteredPages = PALETTE_PAGES.slice();

function renderPaletteItems() {
  if (!paletteListEl) return;
  paletteListEl.innerHTML = "";
  filteredPages.forEach(function (p, i) {
    var a = document.createElement("a");
    a.href = p.path;
    a.className = "palette-item" + (i === selectedIndex ? " is-selected" : "");
    a.setAttribute("data-index", i);
    a.innerHTML = p.label + "<span>" + p.slug + "</span>";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = p.path;
    });
    paletteListEl.appendChild(a);
  });
  var selected = paletteListEl.querySelector(".palette-item.is-selected");
  if (selected) selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function openPalette() {
  if (!paletteOverlay) return;
  paletteOverlay.classList.add("is-open");
  filteredPages = PALETTE_PAGES.slice();
  selectedIndex = 0;
  if (paletteSearch) {
    paletteSearch.value = "";
    paletteSearch.focus();
  }
  renderPaletteItems();
}

function closePalette() {
  if (paletteOverlay) paletteOverlay.classList.remove("is-open");
}

function onPaletteKeydown(e) {
  if (!paletteOverlay || !paletteOverlay.classList.contains("is-open")) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closePalette();
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % filteredPages.length;
    renderPaletteItems();
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = selectedIndex <= 0 ? filteredPages.length - 1 : selectedIndex - 1;
    renderPaletteItems();
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    if (filteredPages[selectedIndex]) {
      window.location.href = filteredPages[selectedIndex].path;
    }
  }
}

function filterPalette(query) {
  var q = (query || "").trim().toLowerCase();
  if (!q) {
    filteredPages = PALETTE_PAGES.slice();
  } else {
    filteredPages = PALETTE_PAGES.filter(function (p) {
      return p.label.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });
  }
  selectedIndex = 0;
  renderPaletteItems();
}

function initCommandPalette() {
  var overlay = document.createElement("div");
  overlay.className = "palette-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="palette-modal" role="dialog" aria-label="Navigate">' +
    '  <div class="palette-search-wrap">' +
    '    <input type="text" class="palette-search" placeholder="search links…" autocomplete="off" />' +
    "  </div>" +
    '  <div class="palette-list"></div>' +
    '  <div class="palette-footer">' +
    "    <span>↑↓ navigate</span><span>⏎ select</span><span>esc close</span>" +
    "  </div>" +
    "</div>";
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closePalette();
  });
  var modal = overlay.querySelector(".palette-modal");
  modal.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  paletteSearch = overlay.querySelector(".palette-search");
  paletteListEl = overlay.querySelector(".palette-list");
  paletteSearch.addEventListener("input", function () {
    filterPalette(paletteSearch.value);
  });
  paletteSearch.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
      e.preventDefault();
      onPaletteKeydown(e);
      e.stopPropagation(); //dont run twice, stop it here
    }
  });
  document.body.appendChild(overlay);
  paletteOverlay = overlay;
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (paletteOverlay.classList.contains("is-open")) closePalette();
      else openPalette();
    } else {
      onPaletteKeydown(e);
    }
  });
}

//update age immediately then every millisecond
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  initCommandPalette();
  var paletteBtn = document.querySelector(".command-palette-btn");
  if (paletteBtn) {
    paletteBtn.addEventListener("click", openPalette);
  }
  updateAge();
  setInterval(updateAge, 2);
  loadMediumBlogs();
});

// fetching medium blogs
async function loadMediumBlogs() {
  const list = document.getElementById("blog-list");
  if (!list) return;

  const loadingEl = list.querySelector(".blog-loading");

  try {
    const res = await fetch("blogs.json");
    if (!res.ok) throw new Error("failed to load blogs.json");

    const posts = await res.json();

    if (!posts.length) {
      if (loadingEl) loadingEl.textContent = "no posts yet — check back soon.";
      return;
    }

    list.innerHTML = "";

    posts.forEach((item) => {
      const card = document.createElement("article");
      card.className = "blog-card";

      if (item.image) {
        const imgEl = document.createElement("img");
        imgEl.className = "blog-card-image";
        imgEl.alt = item.title;
        imgEl.src = item.image;
        imgEl.onerror = () => imgEl.style.display = "none";
        card.appendChild(imgEl);
      }

      const contentDiv = document.createElement("div");
      contentDiv.className = "blog-card-content";

      const titleLink = document.createElement("a");
      titleLink.className = "blog-card-title";
      titleLink.href = item.link;
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer";
      titleLink.textContent = item.title;

      const meta = document.createElement("div");
      meta.className = "blog-card-meta";
      meta.textContent = new Date(item.date).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric",
      });

      const excerptEl = document.createElement("p");
      excerptEl.className = "blog-card-excerpt";
      excerptEl.textContent = item.excerpt;

      contentDiv.append(titleLink, meta, excerptEl);
      card.appendChild(contentDiv);
      list.appendChild(card);
    });

  } catch {
    if (loadingEl) loadingEl.textContent = "couldn't load posts right now.";
  }
}