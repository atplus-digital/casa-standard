/* ==========================================================================
   CASA Standard — Interactive Client Behavior (Vanilla JS, Zero Dependencies)
   ========================================================================== */

(function () {
  "use strict";

  const rootEl = document.documentElement;
  const siteRoot = rootEl.getAttribute("data-site-root") || "./";

  // 1. Theme Toggle (persisted in localStorage, synced with system default)
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const current = rootEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      rootEl.setAttribute("data-theme", next);
      try {
        localStorage.setItem("casa-theme", next);
      } catch (_) {}
    });
  }

  // 2. Mobile Navigation Drawer
  const menuBtn = document.getElementById("mobile-menu-btn");
  const primaryNav = document.getElementById("primary-nav");
  if (menuBtn && primaryNav) {
    menuBtn.addEventListener("click", function () {
      const open = primaryNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // 3. Copy-to-Clipboard Buttons
  document.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-copy-target], [data-copy-text]");
    if (!btn) return;
    let text = btn.getAttribute("data-copy-text");
    if (!text) {
      const sel = btn.getAttribute("data-copy-target");
      const target = sel ? document.getElementById(sel) : null;
      text = target ? target.textContent : "";
    }
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text.trim()).then(function () {
      const prev = btn.textContent;
      btn.setAttribute("data-copied", "true");
      btn.textContent = "Copiado";
      window.setTimeout(function () {
        btn.removeAttribute("data-copied");
        btn.textContent = prev;
      }, 1600);
    });
  });

  // 4. Accessible Tab Switchers (Quickstart & Delivery Cycle)
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    const buttons = Array.from(group.querySelectorAll("[role='tab']"));
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const panelId = btn.getAttribute("aria-controls");
        buttons.forEach(function (b) {
          const active = b === btn;
          b.setAttribute("aria-selected", active ? "true" : "false");
          const pid = b.getAttribute("aria-controls");
          const pane = pid ? document.getElementById(pid) : null;
          if (pane) pane.hidden = !active;
        });
        if (panelId) {
          const activePane = document.getElementById(panelId);
          if (activePane) activePane.hidden = false;
        }
      });
    });
  });

  // 5. Repo Anatomy Tree Inspector (Home)
  const treeButtons = document.querySelectorAll("[data-tree-title]");
  const detailTitle = document.getElementById("anatomy-detail-title");
  const detailBody = document.getElementById("anatomy-detail-body");
  if (treeButtons.length && detailTitle && detailBody) {
    treeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        treeButtons.forEach(function (b) {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        detailTitle.textContent = btn.getAttribute("data-tree-path") || "";
        detailBody.textContent = btn.getAttribute("data-tree-desc") || "";
      });
    });
  }

  // 6. Sticky TOC Scrollspy
  const tocLinks = Array.from(document.querySelectorAll(".toc-link[href^='#']"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach(function (link) {
      const id = link.getAttribute("href").slice(1);
      const sec = document.getElementById(id);
      if (sec) map.set(sec, link);
    });
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) { l.classList.remove("is-active"); });
            const active = map.get(entry.target);
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-90px 0px -72% 0px", threshold: 0 }
    );
    map.forEach(function (_, sec) { obs.observe(sec); });
  }

  // 7. Graph Explorer Filtering & Interactive Causal SVG (/grafo/)
  const graphTable = document.getElementById("graph-ledger-body");
  if (graphTable) {
    const rows = Array.from(graphTable.querySelectorAll("tr[data-doc-id]"));
    const layerBtns = Array.from(document.querySelectorAll("[data-filter-layer]"));
    const statusBtns = Array.from(document.querySelectorAll("[data-filter-status]"));
    const filterInput = document.getElementById("graph-filter-input");
    const emptyState = document.getElementById("graph-empty-state");
    const resetBtn = document.getElementById("graph-reset-btn");
    const countLabel = document.getElementById("graph-visible-count");

    let activeLayer = "all";
    let activeStatus = "all";

    function applyGraphFilter() {
      const q = (filterInput ? filterInput.value : "").trim().toLowerCase();
      let visible = 0;
      rows.forEach(function (row) {
        const layer = row.getAttribute("data-layer");
        const status = row.getAttribute("data-status");
        const hay = row.getAttribute("data-search") || "";
        const okLayer = activeLayer === "all" || layer === activeLayer;
        const okStatus = activeStatus === "all" || status === activeStatus;
        const okQuery = !q || hay.indexOf(q) !== -1;
        const show = okLayer && okStatus && okQuery;
        row.hidden = !show;
        if (show) visible += 1;
      });
      if (emptyState) emptyState.hidden = visible > 0;
      if (countLabel) countLabel.textContent = visible + " documento(s)";
    }

    layerBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeLayer = btn.getAttribute("data-filter-layer") || "all";
        layerBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        applyGraphFilter();
      });
    });

    statusBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeStatus = btn.getAttribute("data-filter-status") || "all";
        statusBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        applyGraphFilter();
      });
    });

    if (filterInput) {
      filterInput.addEventListener("input", applyGraphFilter);
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        activeLayer = "all";
        activeStatus = "all";
        if (filterInput) filterInput.value = "";
        layerBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-filter-layer") === "all" ? "true" : "false");
        });
        statusBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-filter-status") === "all" ? "true" : "false");
        });
        applyGraphFilter();
      });
    }

    // SVG lineage highlighting
    const svg = document.getElementById("causal-graph-svg");
    if (svg) {
      const nodes = Array.from(svg.querySelectorAll(".graph-node[data-id]"));
      const edges = Array.from(svg.querySelectorAll(".graph-edge[data-from][data-to]"));

      function highlightNode(docId) {
        if (!docId) {
          svg.classList.remove("has-focus");
          nodes.forEach(function (n) { n.classList.remove("is-selected", "is-related"); });
          edges.forEach(function (e) { e.classList.remove("is-related"); });
          return;
        }
        svg.classList.add("has-focus");
        const related = new Set([docId]);
        edges.forEach(function (e) {
          const from = e.getAttribute("data-from");
          const to = e.getAttribute("data-to");
          const hit = from === docId || to === docId;
          e.classList.toggle("is-related", hit);
          if (hit) {
            related.add(from);
            related.add(to);
          }
        });
        nodes.forEach(function (n) {
          const id = n.getAttribute("data-id");
          n.classList.toggle("is-selected", id === docId);
          n.classList.toggle("is-related", related.has(id));
        });
      }

      nodes.forEach(function (n) {
        const id = n.getAttribute("data-id");
        const url = n.getAttribute("data-href");
        n.addEventListener("mouseenter", function () { highlightNode(id); });
        n.addEventListener("focus", function () { highlightNode(id); });
        n.addEventListener("click", function () {
          if (url) window.location.href = url;
        });
        n.addEventListener("keydown", function (ev) {
          if ((ev.key === "Enter" || ev.key === " ") && url) {
            ev.preventDefault();
            window.location.href = url;
          }
        });
      });
      svg.addEventListener("mouseleave", function () { highlightNode(null); });
    }
  }

  // 8. Global Search Modal (⌘K or /)
  const searchOpenBtn = document.getElementById("search-open-btn");
  const searchBackdrop = document.getElementById("search-backdrop");
  const searchInput = document.getElementById("search-modal-input");
  const searchResults = document.getElementById("search-results-list");
  const searchEmpty = document.getElementById("search-empty-state");
  const searchClearBtn = document.getElementById("search-clear-btn");

  let searchIndex = null;
  let activeResultIdx = 0;

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    return fetch(siteRoot + "assets/search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchIndex = data;
        return data;
      })
      .catch(function () {
        searchIndex = [];
        return [];
      });
  }

  function renderSearchResults(query) {
    if (!searchResults || !searchIndex) return;
    const q = (query || "").trim().toLowerCase();
    const matches = !q
      ? searchIndex.slice(0, 10)
      : searchIndex.filter(function (item) {
          return (
            item.title.toLowerCase().indexOf(q) !== -1 ||
            item.kind.toLowerCase().indexOf(q) !== -1 ||
            item.body.toLowerCase().indexOf(q) !== -1
          );
        }).slice(0, 14);

    searchResults.innerHTML = "";
    activeResultIdx = 0;

    if (!matches.length) {
      if (searchEmpty) searchEmpty.hidden = false;
      return;
    }
    if (searchEmpty) searchEmpty.hidden = true;

    matches.forEach(function (item, idx) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "search-result-link" + (idx === 0 ? " is-active" : "");
      a.href = siteRoot + item.url;
      a.addEventListener("click", closeSearch);

      const kind = document.createElement("span");
      kind.className = "search-result-kind";
      kind.textContent = item.kind;

      const title = document.createElement("span");
      title.className = "search-result-title";
      title.textContent = item.title;

      const snippet = document.createElement("span");
      snippet.className = "search-result-snippet";
      snippet.textContent = item.body;

      a.appendChild(kind);
      a.appendChild(title);
      a.appendChild(snippet);
      li.appendChild(a);
      searchResults.appendChild(li);
    });
  }

  function openSearch() {
    if (!searchBackdrop || !searchInput) return;
    searchBackdrop.hidden = false;
    loadSearchIndex().then(function () {
      renderSearchResults(searchInput.value);
      searchInput.focus();
    });
  }

  function closeSearch() {
    if (!searchBackdrop) return;
    searchBackdrop.hidden = true;
  }

  if (searchOpenBtn) {
    searchOpenBtn.addEventListener("click", openSearch);
  }

  if (searchBackdrop) {
    searchBackdrop.addEventListener("click", function (ev) {
      if (ev.target === searchBackdrop) closeSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderSearchResults(searchInput.value);
    });
    searchInput.addEventListener("keydown", function (ev) {
      const links = searchResults ? Array.from(searchResults.querySelectorAll(".search-result-link")) : [];
      if (ev.key === "Escape") {
        closeSearch();
      } else if (ev.key === "ArrowDown" && links.length) {
        ev.preventDefault();
        links[activeResultIdx].classList.remove("is-active");
        activeResultIdx = (activeResultIdx + 1) % links.length;
        links[activeResultIdx].classList.add("is-active");
        links[activeResultIdx].scrollIntoView({ block: "nearest" });
      } else if (ev.key === "ArrowUp" && links.length) {
        ev.preventDefault();
        links[activeResultIdx].classList.remove("is-active");
        activeResultIdx = (activeResultIdx - 1 + links.length) % links.length;
        links[activeResultIdx].classList.add("is-active");
        links[activeResultIdx].scrollIntoView({ block: "nearest" });
      } else if (ev.key === "Enter" && links[activeResultIdx]) {
        ev.preventDefault();
        links[activeResultIdx].click();
      }
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener("click", function () {
      searchInput.value = "";
      renderSearchResults("");
      searchInput.focus();
    });
  }

  document.addEventListener("keydown", function (ev) {
    const tag = (ev.target && ev.target.tagName) || "";
    const typing = tag === "INPUT" || tag === "TEXTAREA" || (ev.target && ev.target.isContentEditable);
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      if (searchBackdrop && !searchBackdrop.hidden) closeSearch();
      else openSearch();
    } else if (!typing && ev.key === "/") {
      ev.preventDefault();
      openSearch();
    } else if (ev.key === "Escape" && searchBackdrop && !searchBackdrop.hidden) {
      closeSearch();
    }
  });
})();
