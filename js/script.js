/* ======================================================
   script.js  (UPDATED - full file)
   - Central UI router for PHI app
   - Dynamic loader for register & reports modules
   - Updated: Summary of Activities now shows two tabs:
     Daily Summary + Keys Management
   ====================================================== */

(function () {
  "use strict";

  // -------------------------
  // small helpers
  // -------------------------
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  // dynamically inject a script and call callback
  function dynamicLoadScript(path, onSuccess, onFail) {
    // avoid double-load
    if (document.querySelector(`script[data-src="${path}"]`)) {
      // slight delay to allow module init if just loaded
      return setTimeout(() => { if (typeof onSuccess === 'function') onSuccess(); }, 50);
    }
    const s = document.createElement("script");
    s.src = path;
    s.async = true;
    s.setAttribute("data-src", path);
    s.onload = () => { if (typeof onSuccess === 'function') onSuccess(); };
    s.onerror = () => { console.error("Failed to load", path); if (typeof onFail === 'function') onFail(); };
    document.body.appendChild(s);
  }

  // scroll-to-top UI helper (placeholder)
  function initScrollToTop() {
    // optional: implement scroll to top button behaviour if desired
  }

  // -------------------------
  // main view switcher (sidebar)
  // -------------------------
  window.showContent = function (section, event) {
    const content = document.getElementById("contentArea");
    if (!content) { console.warn("contentArea not found in DOM."); return; }
    // clear existing
    content.innerHTML = '';
    // set active class on sidebar
    // Set active class on sidebar (works with current HTML structure)
    qsa(".sidebar ul li").forEach(li => li.classList.remove("active"));
    if (event && event.currentTarget) event.currentTarget.classList.add("active");


    if (section === "Home") {
      content.innerHTML = `
        <div style="max-width:800px;margin:20px auto;background:rgba(9, 8, 92, 0.2);backdrop-filter:blur(10px);border:1px solid rgba(255, 255, 255, 0.3);padding:30px;border-radius:12px;box-shadow:0 8px 32px 0 rgba(31, 38, 135, 0.1);line-height:1.8;color:#000 !important;font-size:16px;font-weight:600;">
          <h2 style="margin-top:0;color:#000 !important;border-bottom:2px solid #ffffff;padding-bottom:10px;">ආයුබෝවන්!</h2>
          
          <p style="color:#ffffff !important;">මෙය මහජන සෞඛ්‍ය පරීක්ෂකවරුන්ගේ කාර්යාල කටයුතු පහසු කිරීම වෙනුවෙන් නිර්මාණය කරන ලද Web Application එකකි.</p>

          <p style="color:#ffffff !important;">තවමත් මෙය නිර්මාණ කටයුතු කරගෙන යන බැවින් මෙහි ඇතුලත් කරන කිසිඳු දත්තයක් save කිරීම සිදු නොවේ. නමුත් මෙය open කරන web browser එකේ පමණක් ඔබ ඇතුලත් කරන දත්තයන් save වීම සිදු වේ.</p>

          <p style="color:#ed6f6f !important;">දැනට ඕනෑම කෙනෙක්ට <strong>ඉදිරි කාලසටහන (Advance Program)</strong> මෙය මගින් නිර්මාණය කර ගැනීමේ පහසුව ලබා දී ඇත.මෙය reports යටතේ ඇත.නමුත් පළමුව PHI Profile  යටතේ ඇති PHI info සහ key map update කර ගත යුතුයි. </p>

          <p style="color:#ffffff !important;">මහජන සෞඛ්‍ය පරීක්ෂක වරුන්ට <strong>Books</strong> යටතේ ඇති <strong>Pocket Note Book</strong> සම්පුර්ණ කිරීම මගින් පහත දැක්වෙන දෑ  ස්වයංක්‍රියව නිර්මාණය කර ගැනීමට පහසුකම ලබා ගත හැක:</p>
          <ul style="list-style-type:none;margin-left:0;padding-left:20px;margin-bottom:20px;color:#000 !important;">
             <li style="margin-bottom:6px;"><i class="fa-solid fa-circle-check" style="color:green;margin-right:10px;"></i>Summary of Activities</li>
             <li style="margin-bottom:6px;"><i class="fa-solid fa-circle-xmark" style="color:red;margin-right:10px;"></i>Monthly Report</li>
             <li style="margin-bottom:6px;"><i class="fa-solid fa-circle-check" style="color:#f39c12;margin-right:10px;"></i>OT</li>
             <li style="margin-bottom:6px;"><i class="fa-solid fa-circle-check" style="color:#f39c12;margin-right:10px;"></i>Claims</li>
          </ul>

          <p style="color:#ffffff !important;">ඉදිරියේදී සියලු registers update කිරීම මගින් අවශ්‍ය ඕනෑම වාර්තාවක් නිර්මාණය කර ගැනීමේ පහසුව ලබා දීමට බලාපොරොත්තු වෙමි.</p>

          <div style="background:#8c9abf;border-left:5px solid #fd1c1c;padding:20px;margin-top:30px;font-size:15px;color:#000 !important;">
            <p style="margin:0 0 10px 0;color:#000 !important;">මෙය භාවිතයේදී යම් ගැටළුවක් ඇත්නම් එය නිවැරදි කිරීම සඳහා මා දැනුවත් කරන ලෙස කාරුණිකව ඉල්ලා සිටිමි.</p>
            <p style="margin:0;font-weight:bold;font-size:16px;color:#000 !important;">ඩබ්.ජේ.කේ.අල්විස්<br>
            මහජන සෞඛ්‍ය පරීක්ෂක - නෑහින්න<br>
            සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාල - දොඩන්ගොඩ<br>
            0715925055</p>
          </div>
        </div>
      `;
    } else if (section === "phiArea") {
      openPhiAreaMap();


    } else if (section === "Registers") {
      const registers = [
        "Sanitation and Basic Information Register",
        "Latrine Construction Register",
        "Infectious Diseases Register",
        "Non-Communicable Diseases and Disabled Persons Register",
        "Notices and Prosecutions Register",
        "Trade and Industries Register",
        "Food Analysis Register",
        "Building Construction Register",
        "Environmental Pollution and Public Complaints Register",
        "Meat Inspection Register",
        "Consumable Stores Register",
        "Inward Register",
        "Outward Register",
        "School Immunization Register",
        "Occupational Health and Safety Register",
        "Common Sources of Drinking-Water Register",
        "Health Education and Health Promotion Activities Register",
        "Disaster Preparedness and Response Register"
      ];


      let htmlContent = `<h2>${escapeHtml(section)}</h2><div class="cards">`;
      registers.forEach(reg => {
        htmlContent += `<div class="card" onclick="openCard('${escapeHtml(reg)}')">
                   <i class="fa-solid fa-book"></i><p>${escapeHtml(reg)}</p>
                 </div>`;
      });
      htmlContent += `</div>`;
      content.innerHTML = htmlContent;
    } else if (section === "Boards") {
      if (typeof window.generateBoardsContent === 'function') {
        content.innerHTML = window.generateBoardsContent();
        setTimeout(() => { if (typeof window.initBoardsCarousel === 'function') window.initBoardsCarousel(); }, 100);
      } else {
        content.innerHTML = `<h2>${escapeHtml(section)}</h2><p>Boards content is loading.</p>`;
      }
    } else if (section === "Books") {
      content.innerHTML = `
        <h2>Books</h2>
        <div class="cards">
          <div class="card book-card" onclick="openVisitorsBook()"><i class="fas fa-book"></i><p>Visitors' Book</p></div>
          <div class="card book-card" onclick="openPocketNoteBook()"><i class="fas fa-book-open"></i><p>Pocket Note Book</p></div>
          <div class="card book-card" onclick="openSummaryOfActivities()"><i class="fas fa-clipboard-check"></i><p>Summary of Activities</p></div>
        </div>
      `;
    } else if (section === "Reports") {
      // --- Reports cards (the five requested) ---
      content.innerHTML = `
        <h2>Reports</h2>
        <div class="cards">
          <div class="card" onclick="openReport('මාසික ඉදිරි කාලසටහන')">
            <i class="fa-solid fa-calendar-days fa-2x"></i>
            <p>මාසික ඉදිරි කාලසටහන</p>
          </div>
          <div class="card" onclick="openReport('මාසික වාර්තාව')">
            <i class="fa-solid fa-file-lines fa-2x"></i>
            <p>මාසික වාර්තාව</p>
          </div>
          <div class="card" onclick="openReport('OT')">
            <i class="fa-solid fa-clock fa-2x"></i>
            <p>OT</p>
          </div>
          <div class="card" onclick="openReport('CT')">
            <i class="fa-solid fa-hourglass-half fa-2x"></i>
            <p>CT</p>
          </div>
          <div class="card" onclick="openReport('වෙනත්')">
            <i class="fa-solid fa-folder-open fa-2x"></i>
            <p>වෙනත්</p>
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `<h2>${escapeHtml(section)}</h2><p>${escapeHtml(section)} details will appear here.</p>`;
    }
  };

  // dynamically-inserted Boards handler (kept in case other code calls it)
  function showBoardsFallback(name, event) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    switch (name) {
      case 'Dashboard':
        contentArea.innerHTML = '<h2>Dashboard</h2><!-- ... -->';
        break;
      case 'Boards':
        if (typeof window.generateBoardsContent === 'function') {
          contentArea.innerHTML = window.generateBoardsContent();
        } else {
          contentArea.innerHTML = '<div id="boardsPNBWrap"></div>';
        }
        setTimeout(() => {
          try {
            if (typeof window.initBoardsCarousel === 'function') {
              window.initBoardsCarousel();
            }
          } catch (err) {
            console.error('initBoardsCarousel error:', err);
          }
          try {
            if (typeof window.renderBoardsPNB === 'function') {
              if (!document.getElementById('boardsPNBWrap')) {
                const wrapper = document.createElement('div');
                wrapper.id = 'boardsPNBWrap';
                contentArea.appendChild(wrapper);
              }
              window.renderBoardsPNB('boardsPNBWrap');
            }
          } catch (err) {
            console.error('renderBoardsPNB error:', err);
          }
        }, 50);
        break;
      default:
        contentArea.innerHTML = '<p>Content not found</p>';
    }
  }

  // ==== CARD / REGISTER opener (delegates to per-register modules) ====
  window.openCard = function (title) {
    const content = document.getElementById("contentArea");
    if (!content) return;

    function renderLoadFail(title, path) {
      content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="background:#fff;padding:18px;border-radius:8px;box-shadow:0 6px 18px rgba(10,30,60,0.06);"><p style="color:#333;">Failed to load module: <code>${escapeHtml(path)}</code>.</p></div>`;
    }

    // mapping: register title => { path, functionName }
    const mapping = {
      "Sanitation and Basic Information Register": { path: "js/registers/sanitation.js", fn: "openSanitationRegister" },
      "Latrine Construction Register": { path: "js/registers/latrineConstruction.js", fn: "openLatrineConstructionRegister" },
      "Infectious Diseases Register": { path: "js/registers/infectious.js", fn: "openInfectious" },
      "Non-Communicable Diseases and Disabled Persons Register": { path: "js/registers/nonCommunicable.js", fn: "openNonCommunicableRegister" },
      "Notices and Prosecutions Register": { path: "js/registers/notices.js", fn: "openNoticesRegister" },
      "Trade and Industries Register": { path: "js/registers/tradeIndustries.js", fn: "openTradeRegister" },
      "Food Analysis Register": { path: "js/registers/foodAnalysis.js", fn: "openFoodAnalysisRegister" },
      "Building Construction Register": { path: "js/registers/buildingConstruction.js", fn: "openBuildingConstructionRegister" },
      "Environmental Pollution and Public Complaints Register": { path: "js/registers/environmentalPollution.js", fn: "openEnvironmentalPollutionRegister" },
      "Meat Inspection Register": { path: "js/registers/meatInspection.js", fn: "openMeatInspectionRegister" },
      "Consumable Stores Register": { path: "js/registers/consumables.js", fn: "openConsumablesRegister" },
      "Inward Register": { path: "js/registers/inwardRegister.js", fn: "openInwardRegister" },
      "Outward Register": { path: "js/registers/outwardRegister.js", fn: "openOutwardRegister" },
      "School Immunization Register": { path: "js/registers/schoolImmunization.js", fn: "openSchoolImmunizationRegister" },
      "Occupational Health and Safety Register": { path: "js/registers/occupationalSafety.js", fn: "openOccupationalSafetyRegister" },
      "Common Sources of Drinking-Water Register": { path: "js/registers/commonDrinkingWater.js", fn: "openCommonDrinkingWaterRegister" },
      "Health Education and Health Promotion Activities Register": { path: "js/registers/healthEducation.js", fn: "openHealthEducationRegister" },
      "Disaster Preparedness and Response Register": { path: "js/registers/disasterPreparedness.js", fn: "openDisasterPreparednessRegister" }
      // add further mapping as you add files
    };

    // if we have a mapping — try to call or dynamic load
    if (mapping[title]) {
      const path = mapping[title].path;
      const fnName = mapping[title].fn;

      // if already present call immediately
      if (typeof window[fnName] === "function") {
        try { return window[fnName](title); } catch (e) { console.error(e); content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="padding:18px">Module present but initialization failed.</div>`; return; }
      }

      // else dynamic load
      dynamicLoadScript(path, () => {
        if (typeof window[fnName] === "function") {
          try { window[fnName](title); }
          catch (e) { console.error(e); content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="padding:18px">Module loaded but initialization failed.</div>`; }
        } else {
          renderLoadFail(title, path);
        }
      }, () => renderLoadFail(title, path));
      return;
    }

    // fallback simple content if no mapping
    content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="background:#fff;padding:18px;border-radius:8px;box-shadow:0 6px 18px rgba(10,30,60,0.06);"><p>Module for this register is not mapped. Add mapping in <code>script.js</code>.</p></div>`;
  };


  // =====================================================
  // Reports opener (dynamic loader).
  // =====================================================
  window.openReport = function (title) {
    const content = document.getElementById("contentArea");
    if (!content) return;

    function renderLoadFail(title, path) {
      content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="background:#fff;padding:18px;border-radius:8px;box-shadow:0 6px 18px rgba(10,30,60,0.06);"><p style="color:#333;">Failed to load report module: <code>${escapeHtml(path)}</code>.</p></div>`;
    }

    const mapping = {
      // IMPORTANT: monthlyScheduleModule provides the tabbed Editor+Saved UI and calls monthlySchedule.js internally.
      "මාසික ඉදිරි කාලසටහන": { path: "js/reports/monthlyScheduleModule.js", fn: "openMonthlyScheduleModule" },
      // "මාසික වාර්තාව": { path: "js/reports/monthlyReport.js", fn: "openMonthlyReport" }, // Temporarily disabled - file not created yet
      "OT": { path: "js/reports/otReport.js", fn: "openOTReport" },
      "CT": { path: "js/reports/ctReport.js", fn: "openCTReport" },
      "වෙනත්": { path: "js/reports/otherReports.js", fn: "openOtherReports" }
    };

    // If mapping exists try to call or load
    if (mapping[title]) {
      const path = mapping[title].path;
      const fnName = mapping[title].fn;

      if (typeof window[fnName] === "function") {
        try { return window[fnName](title); } catch (e) { console.error(e); content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="padding:18px">Report module present but initialization failed.</div>`; return; }
      }

      dynamicLoadScript(path, () => {
        if (typeof window[fnName] === "function") {
          try { window[fnName](title); }
          catch (e) { console.error(e); content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="padding:18px">Report module loaded but initialization failed.</div>`; }
        } else {
          // If the module file loaded but didn't expose the expected function - show default content
          content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
              <h2>${escapeHtml(title)}</h2>
              <button onclick="showContent('Reports', null)" style="background:var(--primary);color:white;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                <i class="fas fa-arrow-left" style="margin-right:8px;"></i>Reports වෙත ආපසු
              </button>
            </div>
            <div class="glass" style="padding:25px;">
              <p>Report module for <strong>${escapeHtml(title)}</strong> loaded but did not export the expected function (<code>${escapeHtml(fnName)}</code>).
            </div>`;
        }
      }, () => renderLoadFail(title, path));
      return;
    }

    // fallback simple content if no mapping
    content.innerHTML = `<h2>${escapeHtml(title)}</h2><div style="background:#fff;padding:18px;border-radius:8px;box-shadow:0 6px 18px rgba(10,30,60,0.06);"><p>Report module for <strong>${escapeHtml(title)}</strong> is not configured.</p></div>`;
  };


  // ==== PHI Area Controller (shows tabs and loads separate phi modules) ====
  // Expects phi modules to be available (or will dynamic-load them):
  //   js/phi/phiInfo.js       -> window.renderPhiInfoTab(container)
  //   js/phi/phiMapViewer.js  -> window.renderPhiMapTab(container)
  //   js/phi/phiMeta.js       -> window.renderPhiMetaTab(container)
  //   js/phi/phiKeyMap.js     -> window.renderPhiKeyMapTab(container)  <-- new
  window.openPhiAreaMap = function () {
    const content = document.getElementById("contentArea");
    if (!content) return;
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
        <h2>PHI Profile</h2>
        <button onclick="showContent('Dashboard', null)" style="background:var(--primary);color:#fff;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:600;">
          <i class="fas fa-arrow-left" style="margin-right:8px;"></i>Dashboard වෙත ආපසු
        </button>
      </div>
      <div class="phi-area-tabs" style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <button id="tab_phi_info" class="tab active" style="padding:8px 12px;">PHI ගේ විස්තර</button>
        <button id="tab_phi_map" class="tab" style="padding:8px 12px;">ක්ෂේත්‍ර සිතියම</button>
        <button id="tab_phi_meta" class="tab" style="padding:8px 12px;">PHI ක්ෂේත්‍ර දත්ත</button>
        <button id="tab_phi_keymap" class="tab" style="padding:8px 12px;">Key Map</button>
      </div>
      <div id="phi_tab_container"></div>
    `;

    function setActiveBtn(id) {
      ["tab_phi_info", "tab_phi_map", "tab_phi_meta", "tab_phi_keymap"].forEach(x => {
        const el = document.getElementById(x);
        if (!el) return;
        el.classList.remove("active");
        el.style.background = "#fff";
      });
      const active = document.getElementById(id);
      if (active) { active.classList.add("active"); active.style.background = "#f8fbff"; }
    }

    document.getElementById("tab_phi_info").addEventListener("click", () => { setActiveBtn("tab_phi_info"); loadPhiInfoTab(); });
    document.getElementById("tab_phi_map").addEventListener("click", () => { setActiveBtn("tab_phi_map"); loadPhiMapTab(); });
    document.getElementById("tab_phi_meta").addEventListener("click", () => { setActiveBtn("tab_phi_meta"); loadPhiMetaTab(); });
    document.getElementById("tab_phi_keymap").addEventListener("click", () => { setActiveBtn("tab_phi_keymap"); loadPhiKeyMapTab(); });

    // default
    loadPhiInfoTab();
  };

  // loaders for each phi sub-module (dynamic if absent)
  function loadPhiInfoTab() {
    const container = document.getElementById("phi_tab_container");
    container.innerHTML = "<div style='padding:12px;'>Loading.</div>";
    if (typeof window.renderPhiInfoTab === "function") {
      window.renderPhiInfoTab(container);
      return;
    }
    dynamicLoadScript("js/phi/phiInfo.js", () => {
      if (typeof window.renderPhiInfoTab === "function") window.renderPhiInfoTab(container);
      else container.innerHTML = "<div style='padding:12px;color:#c33;'>phiInfo module loaded but render function missing.</div>";
    }, () => container.innerHTML = "<div style='padding:12px;color:#c33;'>Failed to load phiInfo module.</div>");
  }

  function loadPhiMapTab() {
    const container = document.getElementById("phi_tab_container");
    container.innerHTML = "<div style='padding:12px;'>Loading map module.</div>";
    if (typeof window.renderPhiMapTab === "function") {
      window.renderPhiMapTab(container);
      return;
    }
    dynamicLoadScript("js/phi/phiMapViewer.js", () => {
      if (typeof window.renderPhiMapTab === "function") window.renderPhiMapTab(container);
      else container.innerHTML = "<div style='padding:12px;color:#c33;'>phiMapViewer loaded but render function missing.</div>";
    }, () => container.innerHTML = "<div style='padding:12px;color:#c33;'>Failed to load phiMapViewer.</div>");
  }

  function loadPhiMetaTab() {
    const container = document.getElementById("phi_tab_container");
    container.innerHTML = "<div style='padding:12px;'>Loading PHI metadata.</div>";
    if (typeof window.renderPhiMetaTab === "function") {
      window.renderPhiMetaTab(container);
      return;
    }
    dynamicLoadScript("js/phi/phiMeta.js", () => {
      if (typeof window.renderPhiMetaTab === "function") window.renderPhiMetaTab(container);
      else container.innerHTML = "<div style='padding:12px;color:#c33;'>phiMeta loaded but render function missing.</div>";
    }, () => container.innerHTML = "<div style='padding:12px;color:#c33;'>Failed to load phiMeta.</div>");
  }

  // New: loader for Key Map tab
  function loadPhiKeyMapTab() {
    const container = document.getElementById("phi_tab_container");
    container.innerHTML = "<div style='padding:12px;'>Loading Key Map module.</div>";
    if (typeof window.renderPhiKeyMapTab === "function") {
      window.renderPhiKeyMapTab(container);
      return;
    }
    dynamicLoadScript("js/phi/phiKeyMap.js", () => {
      if (typeof window.renderPhiKeyMapTab === "function") window.renderPhiKeyMapTab(container);
      else container.innerHTML = "<div style='padding:12px;color:#c33;'>phiKeyMap loaded but render function missing.</div>";
    }, () => container.innerHTML = "<div style='padding:12px;color:#c33;'>Failed to load phiKeyMap.</div>");
  }


  // ===== Example delegations: Visitors book, Pocket Note (kept lightweight) =====
  window.openPocketNoteBook = function () {
    const content = document.getElementById("contentArea");
    if (!content) return;

    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:15px;">
            <button onclick="showContent('Books', null)" style="background:var(--primary);color:white;width:40px;height:40px;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:var(--trans-quick);" title="පොත් වෙත ආපසු">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h2>Pocket Note Book (H-253)</h2>
          </div>
          <div>
            <button id="pnbFormTab" class="tab active" style="margin-right:8px;">Entry Form</button>
            <button id="pnbViewTab" class="tab">Saved Notes</button>
          </div>
        </div>
        <div id="pnbTabContainer"></div>
    `;

    function setActive(id) {
      document.getElementById("pnbFormTab").classList.remove("active");
      document.getElementById("pnbViewTab").classList.remove("active");
      document.getElementById(id).classList.add("active");
    }

    document.getElementById("pnbFormTab").addEventListener("click", () => {
      setActive("pnbFormTab");
      // render form inside tab container
      if (typeof window.openPocketNoteEntry === "function") window.openPocketNoteEntry(true);
    });

    document.getElementById("pnbViewTab").addEventListener("click", () => {
      setActive("pnbViewTab");
      // render carousel/list view
      const container = document.getElementById("pnbTabContainer");
      container.innerHTML = `<div id="pnbCarouselWrap"></div>`;
      if (typeof window.renderPNBCarousel === "function") window.renderPNBCarousel("pnbCarouselWrap");
    });

    // default: show form
    document.getElementById("pnbFormTab").click();
  };


  window.openVisitorsBook = function () {
    const content = document.getElementById("contentArea");
    if (!content) return;
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2>Visitors' Book</h2>
        <button onclick="showContent('Books', null)" style="background:var(--primary);color:white;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
          <i class="fas fa-arrow-left" style="margin-right:8px;"></i>පොත් වෙත ආපසු
        </button>
      </div>
      <div class="glass" style="padding:25px;">
        <h3 style="color:var(--primary);margin-bottom:15px;">Visitors entries</h3>
        <p>Module not available. Include the visitors book script to enable this.</p>
      </div>
    `;
  };

  // ===========================
  // UPDATED: Summary of Activities
  // Shows TWO tabs: Daily Summary & Keys
  // Relies on renderDailySummaryTab() and renderKeysTab()
  // ===========================
  window.openSummaryOfActivities = function () {
    const content = document.getElementById("contentArea");
    if (!content) return;

    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2>Summary of Activities</h2>
        <button onclick="showContent('Books', null)" style="background:var(--primary);color:white;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
          <i class="fas fa-arrow-left" style="margin-right:8px;"></i>පොත් වෙත ආපසු
        </button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:15px;">
        <button id="tab_daily_summary" class="tab active" style="padding:8px 12px;">Daily Summary</button>
        <button id="tab_keys" class="tab" style="padding:8px 12px;">Keys</button>
      </div>

      <div id="summaryTabsContainer"></div>
    `;

    function activateTab(tabId) {
      const t1 = document.getElementById("tab_daily_summary");
      const t2 = document.getElementById("tab_keys");
      if (t1) t1.classList.remove("active");
      if (t2) t2.classList.remove("active");
      const active = document.getElementById(tabId);
      if (active) active.classList.add("active");
    }

    function loadDailySummaryTab() {
      activateTab("tab_daily_summary");
      const container = document.getElementById("summaryTabsContainer");
      container.innerHTML = `<div id="dailySummaryContainer"></div>`;
      if (typeof window.renderDailySummaryTab === "function") {
        window.renderDailySummaryTab(document.getElementById("dailySummaryContainer"));
        return;
      }
      // try to dynamically load if not present
      dynamicLoadScript("js/books/dailySummaryTab.js", () => {
        if (typeof window.renderDailySummaryTab === "function") {
          window.renderDailySummaryTab(document.getElementById("dailySummaryContainer"));
        } else {
          document.getElementById("dailySummaryContainer").innerHTML = "<div style='padding:12px;color:#c33;'>dailySummary module loaded but render function missing.</div>";
        }
      }, () => {
        document.getElementById("dailySummaryContainer").innerHTML = "<div style='padding:12px;color:#c33;'>Failed to load dailySummary module.</div>";
      });
    }

    function loadKeysTab() {
      activateTab("tab_keys");
      const container = document.getElementById("summaryTabsContainer");
      container.innerHTML = `<div id="keysContainer"></div>`;
      if (typeof window.renderKeysTab === "function") {
        window.renderKeysTab(document.getElementById("keysContainer"));
        return;
      }
      // try to dynamically load if not present
      dynamicLoadScript("js/books/keysTab.js", () => {
        if (typeof window.renderKeysTab === "function") {
          window.renderKeysTab(document.getElementById("keysContainer"));
        } else {
          document.getElementById("keysContainer").innerHTML = "<div style='padding:12px;color:#c33;'>keys module loaded but render function missing.</div>";
        }
      }, () => {
        document.getElementById("keysContainer").innerHTML = "<div style='padding:12px;color:#c33;'>Failed to load keys module.</div>";
      });
    }

    document.getElementById("tab_daily_summary").addEventListener("click", loadDailySummaryTab);
    document.getElementById("tab_keys").addEventListener("click", loadKeysTab);

    // default open Daily Summary
    loadDailySummaryTab();
  };

  // Make sure the daily summary functions are available globally
  window.addDailySummary = function () {
    if (typeof window.addDailySummary === "function") {
      window.addDailySummary();
    }
  };

  window.editSummary = function (id) {
    if (typeof window.editSummary === "function") {
      window.editSummary(id);
    }
  };

  window.deleteSummary = function (id) {
    if (typeof window.deleteSummary === "function") {
      window.deleteSummary(id);
    }
  };

  window.filterByDate = function () {
    if (typeof window.filterByDate === "function") {
      window.filterByDate();
    }
  };

  window.clearDateFilter = function () {
    if (typeof window.clearDateFilter === "function") {
      window.clearDateFilter();
    }
  };

  // Initial mount: open Home
  document.addEventListener("DOMContentLoaded", function () {
    // initial active on sidebar
    setTimeout(() => {
      const first = document.querySelector(".sidebar ul li.active");
      if (first) first.classList.add("active");
      showContent('Home', null);
      initScrollToTop();
    }, 40);

    // Mobile Sidebar Toggle Logic
    const toggleBtn = document.getElementById('mobileToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (toggleBtn && sidebar && overlay) {
      // Toggle sidebar
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      });

      // Close when clicking overlay
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });

      // Close when clicking any sidebar link (nav item)
      const navLinks = sidebar.querySelectorAll('ul li');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          // only close if we are actually in mobile mode (sidebar has 'active' or window width < 980)
          if (window.innerWidth <= 980) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
          }
        });
      });
    }
  });

  // -------------------------
  // Update sidebar PHI info from localStorage
  // -------------------------
  function updateSidebarPhiInfo() {
    const sidebarProfile = document.querySelector('.sidebar-profile');
    if (!sidebarProfile) return;

    // Get PHI data from localStorage
    const phiName = localStorage.getItem('phi_info_inspector') || 'PHI Name';
    const phiArea = localStorage.getItem('phi_info_area') || 'Area';
    const phiPhoto = localStorage.getItem('phi_info_photo');

    // Update logo
    const logoEl = sidebarProfile.querySelector('.logo');
    if (logoEl) {
      if (phiPhoto) {
        // Show uploaded photo as background
        logoEl.style.backgroundImage = `url(${phiPhoto})`;
        logoEl.style.backgroundSize = 'cover';
        logoEl.style.backgroundPosition = 'center';
        logoEl.textContent = '';
      } else {
        // Show first letter of name
        logoEl.style.backgroundImage = 'none';
        logoEl.style.background = '#fff';
        const firstLetter = phiName.charAt(0).toUpperCase() || 'P';
        logoEl.textContent = firstLetter;
      }
    }

    // Update name
    const nameEl = sidebarProfile.querySelector('.profile-text strong');
    if (nameEl) {
      nameEl.textContent = phiName;
    }

    // Update area
    const areaEl = sidebarProfile.querySelector('.profile-text small');
    if (areaEl) {
      areaEl.textContent = `Public Health Inspector — ${phiArea}`;
    }
  }

  // Call on page load
  document.addEventListener('DOMContentLoaded', function () {
    updateSidebarPhiInfo();
    
    // Default to HOME
    showContent('Home', { currentTarget: document.querySelector("li.active") });

    // Listen for storage events (when PHI info is updated in another tab)
    window.addEventListener('storage', function (e) {
      if (e.key && (e.key === 'phi_info_inspector' || e.key === 'phi_info_area' || e.key === 'phi_info_photo')) {
        updateSidebarPhiInfo();
      }
    });

    // Listen for custom event (for same-window updates)
    window.addEventListener('phiInfoUpdated', function () {
      updateSidebarPhiInfo();
    });
  });

})();
