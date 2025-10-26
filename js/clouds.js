// clouds.js — side-only, horizontal-only, scalable lanes, total=20 by default
(function () {
  const ID = "clouds";
  const root = document.getElementById(ID);
  if (!root) return;
  if (root.dataset.initialized === "true") return;
  root.dataset.initialized = "true";

  // Bas-styles (fallback om inte i CSS)
  root.classList.add("clouds");
  if (!root.style.position) root.style.position = "fixed";
  if (!root.style.inset) root.style.inset = "0";
  root.style.pointerEvents = "none";
  root.style.overflow = "hidden";

  // Endast cloud2 & cloud3
  const SRC = ["/assets/img/cloud2.png", "/assets/img/cloud3.png"];

  // ---- Tunables via data-* (med bra defaults) ----
  const TOTAL    = Math.max(2, parseInt(root.getAttribute("data-total-clouds") || "20", 10)); // totalt
  const PER_SIDE = Math.floor(TOTAL / 2); // vänster/höger
  const LANES    = Math.max(1, parseInt(root.getAttribute("data-lanes-per-side") || "3", 10)); // lanes/sida

  const EDGE_Y   = parseFloat(root.getAttribute("data-edge-margin-y") || "6"); // % margin topp/botten

  // Hur långt in på sidan får lanes breda ut sig (skalbar vid fler lanes)
  // Dessa kan overrideas: t.ex. data-left-span="12" data-right-span="12"
  const BASE_SPAN     = parseFloat(root.getAttribute("data-base-span") || "7.0");   // % för 1 lane
  const PER_LANE_ADD  = parseFloat(root.getAttribute("data-per-lane-add") || "2.4"); // % extra bredd / (lane-1)
  const LEFT_EDGE     = parseFloat(root.getAttribute("data-left-edge-x") || "4.0");     // % från vänster
  const RIGHT_EDGE    = parseFloat(root.getAttribute("data-right-edge-x") || "96.0");   // % från vänster (högerkant)

  // Rörelse
  const SPEED_SCALE = parseFloat(root.getAttribute("data-speed-scale") || "1.15");
  const DIST_SCALE  = parseFloat(root.getAttribute("data-distance-scale") || "1.25");

  // NYTT: styrbar lane-fördelning horisontellt
  // "ease" (default, lite mer separation närmare kanten) eller "even" (helt jämn)
  const LANE_MODE   = (root.getAttribute("data-lane-mode") || "ease").toLowerCase();

  // NYTT: styrbar vertikal minsta separation och jitter (procent av viewport-höjd)
  // Om inget anges: smart default baserat på antal moln
  const JITTER_PCT  = root.hasAttribute("data-jitter-pct")
    ? parseFloat(root.getAttribute("data-jitter-pct") || "0.10")
    : 0.10; // 10% av bandets höjd runt varje slot
  const MIN_SEP_ATTR = root.getAttribute("data-min-sep-pct"); // kan vara null -> auto

  // Responsiva storlekar/rörelser
  function motionRanges() {
    const w = innerWidth;
    return {
      width:  w < 600 ? [150, 220] : w < 1100 ? [170, 250] : [190, 280],
      dist:   w < 600 ? [28, 64]   : w < 1100 ? [32, 72]   : [36, 84],
      dur:    [15, 23], // sek
    };
  }

  // Helpers
  const rand  = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Skapa vertikala slots (jämnt + jitter + min-avstånd) sorterade upp->ned
  function verticalSlots(n, minSepPct, jitterPct) {
    // auto-defaults om inte explicit angivna
    const autoMinSep = Math.max(3.5, 100 / Math.max(16, n * 2)); // funkar bra visuellt
    const minSep = (typeof minSepPct === "number" && !Number.isNaN(minSepPct))
      ? minSepPct
      : autoMinSep;
    const jitter = (typeof jitterPct === "number" && !Number.isNaN(jitterPct))
      ? jitterPct
      : 0.18;

    const ys = [];
    for (let i = 0; i < n; i++) {
      const center = ((i + 0.5) / n) * 100;
      const band = 100 / n;
      let y = center + (Math.random() * 2 - 1) * band * jitter;
      ys.push(clamp(y, EDGE_Y, 100 - EDGE_Y));
    }
    ys.sort((a, b) => a - b);

    // enkel separation-pass uppåt och nedåt
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] - ys[i - 1] < minSep) ys[i] = clamp(ys[i - 1] + minSep, EDGE_Y, 100 - EDGE_Y);
    }
    for (let i = ys.length - 2; i >= 0; i--) {
      if (ys[i + 1] - ys[i] < minSep) ys[i] = clamp(ys[i + 1] - minSep, EDGE_Y, 100 - EDGE_Y);
    }
    return ys;
  }

  // Skapa lane X-positioner för vänster/höger.
  // LANE_MODE:
  //  - "ease": icke-linjär (easeOutCubic) för trevlig visuell separation
  //  - "even": helt jämnt fördelade centerpunkter inom spannet
  function laneXs(side /* 'left' | 'right' */, lanes) {
    const span = BASE_SPAN + (lanes - 1) * PER_LANE_ADD; // t.ex. 7% + 2.4%*(N-1)
    const xs = [];

    for (let i = 0; i < lanes; i++) {
      if (LANE_MODE === "even") {
        // Mittpunkter jämnt fördelade mellan [0..span]
        const t = (i + 0.5) / lanes; // 0.5/lanes, 1.5/lanes, ...
        if (side === "left") {
          xs.push(LEFT_EDGE + t * span);
        } else {
          xs.push(RIGHT_EDGE - t * span);
        }
      } else {
        // "ease" (default): easeOutCubic för större separation mot ytterkanterna
        const t = lanes === 1 ? 0 : i / (lanes - 1); // 0..1
        const eased = 1 - Math.pow(1 - t, 3);
        if (side === "left") {
          xs.push(LEFT_EDGE + eased * span);
        } else {
          xs.push(RIGHT_EDGE - eased * span);
        }
      }
    }
    return xs;
  }

  function makeCloud(srcIdx, xPct, yPct, widthPx) {
    const img = document.createElement("img");
    img.className = "cloud";
    img.src = SRC[srcIdx & 1]; // 0=>cloud2, 1=>cloud3
    img.alt = "cloud";
    img.decoding = "async";
    img.loading = "eager";
    img.width = Math.round(widthPx);

    img.style.position = "absolute";
    img.style.left = xPct + "%";
    img.style.top = yPct + "%";
    img.style.transform = "translate(-50%, -50%)";
    img.style.willChange = "transform";
    img.style.imageRendering = "auto";
    return img;
  }

  // Endast horisontell rörelse (vänster: inåt +x, höger: inåt -x)
  function animateHorizontal(el, sign, distRange, durRange) {
    const distance = rand(distRange[0], distRange[1]) * DIST_SCALE;
    const duration = (rand(durRange[0], durRange[1]) * 1000) / SPEED_SCALE;
    const easings = ["ease-in-out", "ease", "ease-out", "cubic-bezier(0.25,0.1,0.25,1)"];
    const easing = easings[randi(0, easings.length - 1)];
    const offset = Math.random() * duration;

    const from = "translate(-50%, -50%)";
    const to   = `translate(calc(-50% + ${sign * distance}px), -50%)`;

    const anim = el.animate([{ transform: from }, { transform: to }], {
      duration,
      direction: "alternate",
      iterations: Infinity,
      easing,
      fill: "both",
    });
    try { anim.currentTime = offset; } catch {}
  }

  function render() {
    root.innerHTML = "";
    const { width, dist, dur } = motionRanges();

    // Läs ev. explicit min-sep från data, annars auto
    const minSepPct = (MIN_SEP_ATTR != null && MIN_SEP_ATTR !== "")
      ? parseFloat(MIN_SEP_ATTR)
      : undefined;

    // Y-positioner upp->ned (separerade & med mindre jitter om du sätter data-jitter-pct)
    const ysLeft  = verticalSlots(PER_SIDE, minSepPct, JITTER_PCT);
    const ysRight = verticalSlots(PER_SIDE, minSepPct, JITTER_PCT);

    // Lane X för vardera sida (skalbar med LANES, och valbart lane-läge)
    const lanesLeft  = laneXs("left",  LANES);
    const lanesRight = laneXs("right", LANES);

    // Bryt kolumn-känslan lite ändå (fördelar objekt över lanes i en diagonal cykel)
    const lanePattern = [];
    for (let i = 0; i < Math.max(PER_SIDE, LANES); i++) {
      lanePattern.push((i + Math.floor(i / LANES)) % LANES);
    }

    for (let i = 0; i < PER_SIDE; i++) {
      const laneIdx = lanePattern[i % lanePattern.length];

      // Varannan cloud2/cloud3 uppifrån-och-ned
      const srcL = i % 2;          // 0,1,0,1...
      const srcR = (i + 1) % 2;    // starta motsatt på höger sida för asymmetri

      // Liten storleks-variation per lane (ytter lite mindre, inner lite större)
      const laneScale = LANES === 1 ? 1.0 : (laneIdx === 0 ? 0.95 : laneIdx === LANES - 1 ? 1.05 : 1.0);
      const wL = rand(width[0], width[1]) * laneScale;
      const wR = rand(width[0], width[1]) * laneScale;

      const xL = lanesLeft[laneIdx];
      const xR = lanesRight[laneIdx];

      const imgL = makeCloud(srcL, xL, ysLeft[i],  wL);
      const imgR = makeCloud(srcR, xR, ysRight[i], wR);

      root.appendChild(imgL);
      root.appendChild(imgR);

      animateHorizontal(imgL, +1, dist, dur);
      animateHorizontal(imgR, -1, dist, dur);
    }

    // Om TOTAL är udda, lägg ett extra moln på vänster sida (bevarar side-only-layouten)
    if (TOTAL % 2 === 1) {
      const y = verticalSlots(1, minSepPct, JITTER_PCT)[0];
      const laneIdx = lanePattern[PER_SIDE % lanePattern.length];
      const x = lanesLeft[laneIdx];
      const w = rand(motionRanges().width[0], motionRanges().width[1]);
      const img = makeCloud(PER_SIDE % 2, x, y, w);
      root.appendChild(img);
      animateHorizontal(img, +1, motionRanges().dist, motionRanges().dur);
    }
  }

  render();
  let t = null;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(render, 100);
  });
})();
