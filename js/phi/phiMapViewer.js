/* phiMapViewer.js
   Tab: ක්ෂේත්‍ර සිතියම (Full-screen viewer with zoom)
   - Storage key for map image: phi_area_map
   - Exposes: window.renderPhiMapTab(container)
*/
(function () {
  const MAP_KEY = "phi_area_map";
  const SYMBOLS_KEY = "phi_map_symbols_v1";
  function loadMap() { return localStorage.getItem(MAP_KEY) || null; }
  function saveMap(dataUrl) { localStorage.setItem(MAP_KEY, dataUrl); }
  function loadSymbols() { try { return JSON.parse(localStorage.getItem(SYMBOLS_KEY) || "[]"); } catch (e) { return []; } }
  function saveSymbols(s) { localStorage.setItem(SYMBOLS_KEY, JSON.stringify(s)); }

  function uid() { return Date.now() + Math.floor(Math.random() * 9999); }

  // util: simple image loader
  function createImage(src, cb) {
    const img = new Image();
    img.onload = () => cb(null, img);
    img.onerror = () => cb(new Error("image load failed"));
    img.src = src;
  }

  window.renderPhiMapTab = function (container) {
    if (typeof container === "string") container = document.getElementById(container);
    if (!container) return console.warn("map container not found");
    const hasMap = !!loadMap();
    container.innerHTML = `
      <div style="background:#fff;padding:12px;border-radius:10px;" class="phi-map-container">
        <div class="phi-map-controls" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
          <input id="phi_map_file" type="file" accept="image/*" />
          <button id="phi_map_upload" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;border:none;">Upload Map</button>
          <button id="phi_map_fullscreen" style="background:#06ad7d;color:#fff;padding:8px 12px;border-radius:8px;border:none;">Open Full Screen</button>
          <button id="phi_map_export" style="background:#e2e8f0;padding:8px 12px;border-radius:8px;border:none;">Export Image</button>
        </div>
        <div id="phi_map_viewport" style="width:100%;height:520px;border:1px dashed #ccc;border-radius:8px;overflow:hidden;position:relative;background:#fafafa;">
          <div id="phi_map_canvas_wrap" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"></div>
        </div>
        <div class="phi-map-zoom-controls" style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button id="zoom_in" style="padding:6px 10px;border-radius:6px;">Zoom In</button>
          <button id="zoom_out" style="padding:6px 10px;border-radius:6px;">Zoom Out</button>
          <button id="reset_zoom" style="padding:6px 10px;border-radius:6px;">Reset</button>
          <div class="phi-map-hint" style="color:#333;font-size:13px;">Click map to add symbols (select type below)</div>
          <select id="phi_symbol_select" style="padding:6px 10px;border-radius:6px;">
            <option value="school">School</option>
            <option value="hospital">Hospital</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    `;

    const fileInput = container.querySelector("#phi_map_file");
    const uploadBtn = container.querySelector("#phi_map_upload");
    const viewport = container.querySelector("#phi_map_viewport");
    const wrap = container.querySelector("#phi_map_canvas_wrap");
    const zoomInBtn = container.querySelector("#zoom_in");
    const zoomOutBtn = container.querySelector("#zoom_out");
    const resetBtn = container.querySelector("#reset_zoom");
    const fullBtn = container.querySelector("#phi_map_fullscreen");
    const exportBtn = container.querySelector("#phi_map_export");
    const symbolSelect = container.querySelector("#phi_symbol_select");

    let imgEl = null;
    let scale = 1;
    let translate = { x: 0, y: 0 };
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let symbols = loadSymbols();

    function renderImageToWrap(src) {
      wrap.innerHTML = "";
      imgEl = document.createElement("img");
      imgEl.src = src;
      imgEl.style.maxWidth = "100%";
      imgEl.style.maxHeight = "100%";
      imgEl.style.transformOrigin = "center center";
      imgEl.style.cursor = "crosshair";
      imgEl.style.userSelect = "none";
      wrap.appendChild(imgEl);
      applyTransform();
    }

    function applyTransform() {
      if (!imgEl) return;
      imgEl.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
      drawSymbols();
    }

    function drawSymbols() {
      // overlay svg for symbols
      let svg = wrap.querySelector("svg");
      if (svg) svg.remove();
      if (!imgEl) return;
      const rect = imgEl.getBoundingClientRect();
      const iw = imgEl.naturalWidth, ih = imgEl.naturalHeight;
      // create svg same size as img element
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.position = "absolute"; svg.style.left = 0; svg.style.top = 0; svg.style.pointerEvents = "none";
      // place each symbol respecting transform: we'll compute positions relative to image element
      symbols.forEach(s => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const cx = (s.xRatio * imgEl.clientWidth);
        const cy = (s.yRatio * imgEl.clientHeight);
        // small shapes
        if (s.type === "school") {
          const rectEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rectEl.setAttribute("x", cx - 8); rectEl.setAttribute("y", cy - 8);
          rectEl.setAttribute("width", 16); rectEl.setAttribute("height", 16); rectEl.setAttribute("rx", 3);
          rectEl.setAttribute("fill", "#1e88e5");
          g.appendChild(rectEl);
          const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
          t.setAttribute("x", cx); t.setAttribute("y", cy + 4); t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "12"); t.setAttribute("fill", "#fff"); t.textContent = "S";
          g.appendChild(t);
        } else if (s.type === "hospital") {
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", 10); c.setAttribute("fill", "#e53935");
          g.appendChild(c);
          const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
          t.setAttribute("x", cx); t.setAttribute("y", cy + 4); t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "12"); t.setAttribute("fill", "#fff"); t.textContent = "H";
          g.appendChild(t);
        } else {
          const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          const pts = `${cx},${cy - 10} ${cx + 10},${cy + 10} ${cx - 10},${cy + 10}`;
          p.setAttribute("points", pts); p.setAttribute("fill", "#2e7d32");
          g.appendChild(p);
          const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
          t.setAttribute("x", cx); t.setAttribute("y", cy + 6); t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "12"); t.setAttribute("fill", "#fff"); t.textContent = "O";
          g.appendChild(t);
        }
        svg.appendChild(g);
      });
      wrap.appendChild(svg);
      // allow svg pointer events for deleting/editing later if needed (not enabled now)
    }

    // initial map load (if present)
    if (loadMap()) {
      createImage(loadMap(), (err, img) => { if (!err) renderImageToWrap(img.src); });
    } else {
      wrap.innerHTML = `<div style="color:#666;">Map not uploaded</div>`;
    }

    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;
      if (!f.type.startsWith("image/")) return alert("Please upload image.");
      const r = new FileReader();
      r.onload = () => {
        saveMap(r.result);
        createImage(r.result, (err, img) => { if (!err) renderImageToWrap(r.result); else alert("Image load failed"); });
      };
      r.readAsDataURL(f);
    });

    // simple zoom
    zoomInBtn.addEventListener("click", () => { scale = Math.min(6, scale * 1.25); applyTransform(); });
    zoomOutBtn.addEventListener("click", () => { scale = Math.max(0.25, scale / 1.25); applyTransform(); });
    resetBtn.addEventListener("click", () => { scale = 1; translate = { x: 0, y: 0 }; applyTransform(); });

    // panning
    wrap.addEventListener("mousedown", (ev) => {
      if (!imgEl) return;
      isPanning = true; panStart = { x: ev.clientX - translate.x, y: ev.clientY - translate.y };
      wrap.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", (ev) => {
      if (!isPanning) return;
      translate.x = ev.clientX - panStart.x;
      translate.y = ev.clientY - panStart.y;
      applyTransform();
    });
    window.addEventListener("mouseup", () => { isPanning = false; wrap.style.cursor = "default"; });

    // clicking to add symbol (compute ratio)
    wrap.addEventListener("click", (ev) => {
      if (!imgEl) return;
      // compute click relative to imgEl's top-left
      const rect = imgEl.getBoundingClientRect();
      if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom) return;
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const xRatio = cx / imgEl.clientWidth;
      const yRatio = cy / imgEl.clientHeight;
      const s = { id: uid(), type: symbolSelect.value || "other", xRatio, yRatio };
      symbols.unshift(s); saveSymbols(symbols); drawSymbols();
    });

    // Full screen opening: create raw full-screen popup with zoom controls (simple)
    fullBtn.addEventListener("click", () => {
      const popup = window.open("", "_blank", "toolbar=0,location=0,menubar=0,width=" + (screen.width) + ",height=" + (screen.height));
      if (!popup) return alert("Allow popups for fullscreen.");
      const mapData = loadMap();
      const sym = loadSymbols();
      popup.document.write(`<html><head><title>PHI Map - Fullscreen</title><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#111;color:#fff;"><div id="root" style="width:100vw;height:100vh;display:flex;flex-direction:column;"><div style="padding:8px;background:#222;display:flex;gap:8px;align-items:center;"><button id="z_in" style="padding:6px 10px;">Zoom In</button><button id="z_out" style="padding:6px 10px;">Zoom Out</button><button id="z_reset" style="padding:6px 10px;">Reset</button><div style="margin-left:auto"><button id="closebtn" style="padding:6px 10px;">Close</button></div></div><div id="frame" style="flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;background:#000;"></div></div></body></html>`);
      const root = popup.document.getElementById("frame");
      const img = popup.document.createElement("img");
      img.src = mapData || "";
      img.style.maxWidth = "none"; img.style.transformOrigin = "center center";
      img.style.userSelect = "none";
      let s = 1;
      img.style.transform = `scale(${s})`;
      root.appendChild(img);
      popup.document.getElementById("z_in").onclick = () => { s = s * 1.25; img.style.transform = `scale(${s})`; };
      popup.document.getElementById("z_out").onclick = () => { s = s / 1.25; img.style.transform = `scale(${s})`; };
      popup.document.getElementById("z_reset").onclick = () => { s = 1; img.style.transform = `scale(1)`; };
      popup.document.getElementById("closebtn").onclick = () => popup.close();
    });

    exportBtn.addEventListener("click", () => {
      // create a canvas snapshot combining image and svg overlay
      if (!imgEl) return alert("No map loaded");
      const imgRect = imgEl.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.width = imgEl.naturalWidth; canvas.height = imgEl.naturalHeight;
      const ctx = canvas.getContext("2d");
      // draw base image (original src)
      createImage(imgEl.src, (err, im) => {
        if (err) return alert("Export failed");
        ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
        // draw symbols scaled to natural size
        symbols.forEach(s => {
          const cx = s.xRatio * canvas.width;
          const cy = s.yRatio * canvas.height;
          ctx.fillStyle = s.type === "school" ? "#1e88e5" : s.type === "hospital" ? "#e53935" : "#2e7d32";
          if (s.type === "school") { ctx.fillRect(cx - 8, cy - 8, 16, 16); ctx.fillStyle = "#fff"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("S", cx, cy); }
          else if (s.type === "hospital") { ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 2 * Math.PI); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("H", cx, cy + 1); }
          else { ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx + 10, cy + 10); ctx.lineTo(cx - 10, cy + 10); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("O", cx, cy + 6); }
        });
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl; a.download = "phi_map_snapshot.png"; a.click();
      });
    });
  };

  // ensure keys exists
  if (!localStorage.getItem(SYMBOLS_KEY)) localStorage.setItem(SYMBOLS_KEY, JSON.stringify([]));
})();
