// include.js — stabil header + bakgrund + noll "content jump"

(async () => {
  /* -------------------- HTML includes -------------------- */
  async function loadHTML(id, file) {
    const host = document.getElementById(id);
    if (!host) return null;
    try {
      const url = new URL(file, document.baseURI).href;
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) {
        console.error("[include] failed:", url, res.status);
        return host;
      }
      host.innerHTML = await res.text();
    } catch (err) {
      console.error("[include] error:", file, err);
    }
    return host;
  }

  /* -------------------- Footer year -------------------- */
  function initFooterYear(root = document) {
    const start = 2025;
    const now = new Date().getFullYear();
    const el = root.querySelector("#year");
    if (el) el.textContent = now > start ? `${start} - ${now}` : String(start);
  }

  /* -------------------- Logo resolver (GitHub Pages-safe) -------------------- */
  async function resolveLogoSrc(logo) {
    if (!logo) return;
    const base = document.baseURI;
    const origin = window.location.origin;
    const m = window.location.pathname.match(/^\/([^/]+)\//);
    const repo = (window.location.hostname.endsWith("github.io") && m) ? m[1] : "";

    const safe = (p, b) => { try { return new URL(p, b).href; } catch { return null; } };
    const tryHead = async (u) => {
      try { const r = await fetch(u, { method: "HEAD", cache: "no-cache" }); return r.ok; }
      catch { return false; }
    };
    const tryImg = (u, t = 4000) =>
      new Promise((res) => {
        const im = new Image();
        const done = (ok) => { clearTimeout(to); im.onload = im.onerror = null; res(ok); };
        const to = setTimeout(() => done(false), t);
        im.onload = () => done(true);
        im.onerror = () => done(false);
        im.src = u + (u.includes("?") ? "&" : "?") + "cb=" + Date.now();
      });

    const c1 = safe(logo.getAttribute("src") || "", base);
    const c2 = safe("assets/img/Goosehunt_Logo.png", base);
    const c3 = repo ? `${origin}/${repo}/assets/img/Goosehunt_Logo.png` : null;
    const variations = [
      "assets/img/GooseHunt_Logo.png",
      "assets/img/goosehunt_logo.png",
      "assets/img/GOOSEHUNT_LOGO.png",
    ].map(p => safe(p, base));

    const candidates = [c1, c2, c3, ...variations].filter(Boolean);
    for (const u of candidates) {
      if (await tryHead(u)) { logo.src = u; return; }
      if (await tryImg(u))  { logo.src = u; return; }
    }
    console.error("[logo] could not resolve any candidate", candidates);
  }

  /* -------------------- Header / Meny-controller -------------------- */
  function initHeaderBehavior(root = document) {
    const header = root.querySelector(".header");
    const btn    = root.querySelector(".menu-toggle");
    const panel  = root.querySelector("#menu-panel");
    if (!header || !btn || !panel) return;

    // Flagga så nav.js inte dubbelstyr
    window.__HEADER_HAS_CONTROLLER__ = true;

    // ===== Scroll lock + kompensation (hindrar breddskifte) =====
    let scrollY = 0;
    let saved = {
      htmlPR: "", bodyPR: "", headerPR: "", panelPR: "",
      bodyPos: "", bodyTop: "", bodyLeft: "", bodyRight: "", bodyW: "", bodyOv: "",
      deOverscroll: "",
      headerTransition: "", bodyTransition: "", mainTransition: ""
    };

    function scrollbarWidth() {
      return window.innerWidth - document.documentElement.clientWidth;
    }

    function setPaddingRight(el, val) {
      if (!el) return;
      el.style.paddingRight = val;
    }

    function lockScroll() {
      scrollY = window.scrollY || 0;
      const sw = scrollbarWidth();

      const html   = document.documentElement;
      const body   = document.body;
      const main   = document.querySelector("main");

      // Spara transitions & styles
      saved.headerTransition = header.style.transition;
      saved.bodyTransition   = body.style.transition;
      saved.mainTransition   = main ? main.style.transition : "";

      // Stäng av transitions under själva låsningen så inget "glider"
      header.style.transition = "none";
      body.style.transition   = "none";
      if (main) main.style.transition = "none";

      // Spara befintliga värden vi ska återställa
      saved.htmlPR   = html.style.paddingRight;
      saved.bodyPR   = body.style.paddingRight;
      saved.headerPR = header.style.paddingRight;
      saved.panelPR  = panel.style.paddingRight;

      saved.bodyPos  = body.style.position;
      saved.bodyTop  = body.style.top;
      saved.bodyLeft = body.style.left;
      saved.bodyRight= body.style.right;
      saved.bodyW    = body.style.width;
      saved.bodyOv   = body.style.overflow;
      saved.deOverscroll = html.style.overscrollBehavior;

      // Lägg exakt samma kompensation överallt som påverkar layout
      const comp = sw > 0 ? sw + "px" : "";
      setPaddingRight(html,   comp);
      setPaddingRight(body,   comp);
      setPaddingRight(header, comp);
      setPaddingRight(panel,  comp);

      // Lås dokumentet
      body.style.position = "fixed";
      body.style.top      = `-${scrollY}px`;
      body.style.left     = "0";
      body.style.right    = "0";
      body.style.width    = "100%";
      body.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
    }

    function unlockScroll() {
      const html = document.documentElement;
      const body = document.body;
      const main = document.querySelector("main");

      // 1) Släpp body-låsningen först (scrollbar kan dyka upp igen)
      body.style.position = saved.bodyPos;
      body.style.top      = saved.bodyTop;
      body.style.left     = saved.bodyLeft;
      body.style.right    = saved.bodyRight;
      body.style.width    = saved.bodyW;
      body.style.overflow = saved.bodyOv;
      html.style.overscrollBehavior = saved.deOverscroll;

      // 2) Vänta en frame så att scrollbar/bredd hinner stabiliseras…
      requestAnimationFrame(() => {
        // Ta bort kompensations-padding synkat (så ingen mellanliggande shift)
        document.documentElement.style.paddingRight = saved.htmlPR;
        document.body.style.paddingRight            = saved.bodyPR;
        header.style.paddingRight                   = saved.headerPR;
        panel.style.paddingRight                    = saved.panelPR;

        // Återställ transitions
        header.style.transition = saved.headerTransition;
        body.style.transition   = saved.bodyTransition;
        if (main) main.style.transition = saved.mainTransition;

        // 3) Återställ scrollposition allra sist
        window.scrollTo(0, scrollY);
      });
    }

    // ===== Spacer för layout under fixed header =====
    const setSpacer = () => {
      const h = header.offsetHeight || 0;
      document.body.style.setProperty("--header-spacer", `${h}px`);
    };
    const ro = new ResizeObserver(setSpacer);
    ro.observe(header);
    window.addEventListener("load", setSpacer, { once: true });
    window.addEventListener("resize", setSpacer);

    // ===== Shrink på scroll (frys när meny är öppen) =====
    const THRESH = 8;
    const onScroll = () => {
      if (document.body.classList.contains("menu-open")) {
        setSpacer();
        return;
      }
      header.classList.toggle("is-shrunk", (window.scrollY || 0) > THRESH);
      setSpacer();
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ===== Öppna/stäng (frys headerhöjd + inga transitions under toggling) =====
    function setExpanded(open) {
      const btn  = root.querySelector(".menu-toggle");
      const main = document.querySelector("main");

      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;

      header.classList.toggle("menu-open", open);
      document.body.classList.toggle("menu-open", open);

      if (open) {
        // Frys headerns nuvarande höjd (pixlar) så inget hoppar vid panelens visning
        const h = header.offsetHeight;
        header.style.height    = h + "px";
        header.style.minHeight = h + "px";
        header.style.maxHeight = h + "px";

        // Lås scroll utan layout-skift
        lockScroll();

        // Se till att spacern matchar låst höjd
        document.body.style.setProperty("--header-spacer", `${h}px`);

      } else {
        // Släpp scroll-låset först (synk med scrollbarens återkomst)
        unlockScroll();

        // Rensa låsning av headerns höjd efter att layouten stabiliserats
        requestAnimationFrame(() => {
          header.style.height = "";
          header.style.minHeight = "";
          header.style.maxHeight = "";

          // Uppdatera spacer & shrink-state
          setSpacer();
          header.classList.toggle("is-shrunk", (window.scrollY || 0) > THRESH);

          // Återställ ev. fokus på knappen för bättre a11y
          const t = root.querySelector(".menu-toggle");
          if (t) t.focus({ preventScroll: true });
        });
      }
    }

    // Toggle-knapp
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      setExpanded(!open);
    });

    // Stäng vid klick på länk i menyn
    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) setExpanded(false);
    });

    // Stäng när viewport > 900px
    const mq = window.matchMedia("(max-width: 900px)");
    function handleResize() { if (!mq.matches) setExpanded(false); }
    window.addEventListener("resize", handleResize);
    handleResize();

    // ESC för att stänga
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setExpanded(false);
    });
  }

  /* -------------------- Boot -------------------- */
  // Ladda in header/footer (om inte redan finns i DOM)
  await loadHTML("header", "./header.html");
  await loadHTML("footer", "./footer.html");

  // Init
  initFooterYear(document);
  initHeaderBehavior(document);

  // Säkerställ att loggan hittas även på GitHub Pages
  const headerEl = document.querySelector(".header");
  const logoImg  = headerEl?.querySelector(".logo-wrap .logo");
  if (logoImg) resolveLogoSrc(logoImg);
})();
