// js/reports/monthlyScheduleModule.js - UPDATED: Removed loading message

(function () {
    "use strict";

    function el(tag, attrs = {}, children = []) {
        const e = document.createElement(tag);
        for (const k in attrs) {
            if (k === "html") e.innerHTML = attrs[k];
            else if (k === "text") e.textContent = attrs[k];
            else e.setAttribute(k, attrs[k]);
        }
        children.forEach(c => e.appendChild(c));
        return e;
    }

    function loadOnce(src) {
        return new Promise(resolve => {
            if (document.querySelector(`script[src="${src}"]`) ||
                document.querySelector(`script[data-src="${src}"]`)) {
                return resolve();
            }
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.setAttribute("data-src", src);
            s.onload = () => resolve();
            document.head.appendChild(s);
        });
    }

    // Global cleanup tracker
    let currentCleanupFunction = null;

    window.openMonthlyScheduleModule = async function (title) {
        const realContent = document.getElementById("contentArea");
        if (!realContent) return showError("contentArea not found");

        // Clean up previous instance first
        if (currentCleanupFunction) {
            currentCleanupFunction();
            currentCleanupFunction = null;
        }

        // Clear any existing content completely
        realContent.innerHTML = "";
        
        // Add CSS for animated cards
        if (!document.getElementById("monthly-schedule-animated-cards-css")) {
            const style = document.createElement("style");
            style.id = "monthly-schedule-animated-cards-css";
            style.textContent = `
                .ms-card-container { position: relative; width: 190px; height: 254px; transition: 200ms; margin: 0 auto; }
                .ms-card-container:active { width: 180px; height: 245px; }
                .ms-card { position: absolute; inset: 0; z-index: 0; display: flex; justify-content: center; align-items: center; border-radius: 20px; transition: 700ms; background: linear-gradient(45deg, #1a1a1a, #262626); border: 2px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.2); }
                .ms-card-content { position: relative; width: 100%; height: 100%; }
                .ms-card-prompt { bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 20; font-size: 14px; font-weight: 600; letter-spacing: 2px; transition: 300ms ease-in-out; position: absolute; text-align: center; color: rgba(255, 255, 255, 0.7); text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
                .ms-card-title { opacity: 0; transition: 300ms ease-in-out; position: absolute; font-size: 24px; font-weight: 800; letter-spacing: 3px; text-align: center; width: 100%; padding-top: 30px; background: linear-gradient(45deg, #00ffaa, #00a2ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 15px rgba(0, 255, 170, 0.3)); }
                .ms-card-subtitle { position: absolute; bottom: 40px; width: 100%; text-align: center; font-size: 11px; letter-spacing: 1px; color: rgba(255, 255, 255, 0.6); padding: 0 10px; }
                .ms-card-glowing { position: absolute; inset: 0; pointer-events: none; }
                .ms-card-glow { position: absolute; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle at center, rgba(0, 255, 170, 0.3) 0%, rgba(0, 255, 170, 0) 70%); filter: blur(15px); opacity: 0; transition: opacity 0.3s ease; }
                .ms-card-glow:nth-child(1) { top: -20px; left: -20px; }
                .ms-card-glow:nth-child(2) { top: 50%; right: -30px; transform: translateY(-50%); }
                .ms-card-glow:nth-child(3) { bottom: -20px; left: 30%; }
                .ms-card-tracker { position: absolute; z-index: 200; width: 100%; height: 100%; cursor: pointer; }
                .ms-card-tracker:hover ~ .ms-card .ms-card-title { opacity: 1; transform: translateY(-10px); }
                .ms-card-tracker:hover ~ .ms-card .ms-card-glow { opacity: 1; }
                .ms-card-tracker:hover ~ .ms-card .ms-card-prompt { opacity: 0; }
                .ms-card-tracker:hover ~ .ms-card { transition: 300ms; filter: brightness(1.1); }
                .ms-card::before { content: ""; background: radial-gradient(circle at center, rgba(0, 255, 170, 0.1) 0%, rgba(0, 162, 255, 0.05) 50%, transparent 100%); filter: blur(20px); opacity: 0; width: 150%; height: 150%; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); transition: opacity 0.3s ease; }
                .ms-card-tracker:hover ~ .ms-card::before { opacity: 1; }
                .ms-card-glare { position: absolute; inset: 0; background: linear-gradient(125deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 55%, rgba(255, 255, 255, 0) 100%); opacity: 0; transition: opacity 300ms; }
                .ms-card:hover .ms-card-glare { opacity: 1; }
                .ms-card-icon { font-size: 3em; color: #00ffaa; margin-bottom: 15px; position: absolute; top: 60px; left: 50%; transform: translateX(-50%); filter: drop-shadow(0 0 10px rgba(0, 255, 170, 0.5)); }
            `;
            document.head.appendChild(style);
        }

        // Header - Only title with back button to cards view
        const header = el("div", {
            class: "monthly-schedule-header",
            style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;"
        });

        header.appendChild(el("h2", {
            style: "color:var(--primary); margin:0;",
            text: title || "මාසික ඉදිරි කාලසටහන"
        }));

        // Back button to Reports
        const reportsBackBtn = el("button", {
            id: "ms_reports_back_btn",
            style: "padding:8px 16px;border-radius:8px;border:none;background:var(--primary);color:white;cursor:pointer;font-weight:600;",
            html: '<i class="fas fa-arrow-left"></i> Reports වෙත'
        });
        reportsBackBtn.onclick = () => window.showContent && window.showContent('Reports', null);

        // Back button (for use inside sub-views to return to cards)
        const backBtn = el("button", {
            id: "ms_back_btn",
            style: "display:none;padding:8px 16px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:14px;",
            html: '<i class="fas fa-arrow-left"></i> Back '
        });

        header.appendChild(reportsBackBtn);
        header.appendChild(backBtn);
        realContent.appendChild(header);

        // Create cards container
        const cardsContainer = el("div", {
            id: "ms_cards_container",
            class: "monthly-schedule-cards",
            style: "display:flex;justify-content:center;gap:40px;margin-bottom:20px;flex-wrap:wrap;"
        });

        // Card 1: Editor Card (Animated)
        const editorCardContainer = el("div", { class: "ms-card-container" });
        editorCardContainer.innerHTML = `
            <div class="ms-card-tracker"></div>
            <div class="ms-card">
                <div class="ms-card-content">
                    <i class="fas fa-edit ms-card-icon"></i>
                    <div class="ms-card-prompt">CLICK TO OPEN</div>
                    <div class="ms-card-title">Editor</div>
                    <div class="ms-card-subtitle">advance program</div>
                    <div class="ms-card-glowing">
                        <div class="ms-card-glow"></div>
                        <div class="ms-card-glow"></div>
                        <div class="ms-card-glow"></div>
                    </div>
                    <div class="ms-card-glare"></div>
                </div>
            </div>
        `;

        // Card 2: Saved Schedules Card (Animated)
        const savedCardContainer = el("div", { class: "ms-card-container" });
        savedCardContainer.innerHTML = `
            <div class="ms-card-tracker"></div>
            <div class="ms-card">
                <div class="ms-card-content">
                    <i class="fas fa-list ms-card-icon"></i>
                    <div class="ms-card-prompt">CLICK TO OPEN</div>
                    <div class="ms-card-title">Saved</div>
                    <div class="ms-card-subtitle"> saved advance program</div>
                    <div class="ms-card-glowing">
                        <div class="ms-card-glow"></div>
                        <div class="ms-card-glow"></div>
                        <div class="ms-card-glow"></div>
                    </div>
                    <div class="ms-card-glare"></div>
                </div>
            </div>
        `;

        cardsContainer.appendChild(editorCardContainer);
        cardsContainer.appendChild(savedCardContainer);

        realContent.appendChild(cardsContainer);

        // Content area that will show either editor or saved list (initially hidden)
        const contentArea = el("div", {
            id: "ms_content_area",
            style: "display:none;min-height:500px;"
        });

        realContent.appendChild(contentArea);

        let eventHandlers = [];
        let currentView = null; // 'editor' or 'saved'

        // Function to track and cleanup event handlers
        function addEventHandler(element, event, handler) {
            element.addEventListener(event, handler);
            eventHandlers.push({ element, event, handler });
        }

        // Cleanup function for this module instance
        function cleanup() {
            // Remove all event handlers
            eventHandlers.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventHandlers = [];

            // Stop polling from monthlySchedule
            if (window.monthlySchedule && typeof window.stopPhiPoller === "function") {
                try {
                    window.stopPhiPoller();
                } catch (e) {
                    console.warn("Error stopping phi poller:", e);
                }
            }

            // Clear global style if exists
            const globalStyle = document.getElementById("monthlySchedule_force_black_text_style_v4");
            if (globalStyle) {
                globalStyle.remove();
            }
        }

        // Store cleanup function globally
        currentCleanupFunction = cleanup;

        // Function to show cards view
        function showCardsView() {
            cardsContainer.style.display = "flex";
            contentArea.style.display = "none";
            backBtn.style.display = "none";
            reportsBackBtn.style.display = "block";
            currentView = null;

            // Update header title
            const headerTitle = header.querySelector("h2");
            headerTitle.textContent = title || "මාසික ඉදිරි කාලසටහන";
        }

        // Function to show content view
        function showContentView(viewType) {
            cardsContainer.style.display = "none";
            contentArea.style.display = "block";
            backBtn.style.display = "block";
            reportsBackBtn.style.display = "none";
            currentView = viewType;

            // Update header title based on view
            const headerTitle = header.querySelector("h2");
            if (viewType === 'editor') {
                headerTitle.textContent = "මාසික ඉදිරි කාලසටහන - Editor";
            } else if (viewType === 'saved') {
                headerTitle.textContent = "මාසික ඉදිරි කාලසටහන - Saved Schedules";
            }
        }

        // LOAD EDITOR - UPDATED: Removed loading message
        async function loadEditor() {
            showContentView('editor');

            // Clear content area - DON'T show loading message
            contentArea.innerHTML = "";

            await loadOnce("js/reports/monthlySchedule.js");

            if (typeof window.openMonthlyScheduleReport !== "function") {
                contentArea.innerHTML = "<div style='padding:20px;text-align:center;color:#c33;'>Editor module not found</div>";
                return;
            }

            try {
                // Create a temporary container for the editor
                const tempContainer = el("div", { id: "temp_editor_container" });
                document.body.appendChild(tempContainer);

                // Store the original contentArea
                const originalContentArea = document.getElementById("contentArea");

                // Temporarily replace contentArea with our temp container
                tempContainer.id = "contentArea";
                originalContentArea.id = "originalContentArea";

                // Call the editor function - it will render into our temp container
                window.openMonthlyScheduleReport();

                // Move the editor content to our content area
                const editorElements = tempContainer.querySelectorAll("*");
                editorElements.forEach(element => {
                    if (element.parentNode === tempContainer) {
                        contentArea.appendChild(element);
                    }
                });

                // Restore original contentArea
                tempContainer.remove();
                originalContentArea.id = "contentArea";

            } catch (err) {
                console.error("Editor loading error:", err);
                contentArea.innerHTML = "<div style='padding:20px;text-align:center;color:#c33;'>Failed to load editor: " + err.message + "</div>";
            }
        }

        // LOAD SAVED LIST
        async function loadSaved() {
            showContentView('saved');
            contentArea.innerHTML = "<div style='padding:40px;text-align:center;color:#666;'><i class='fas fa-spinner fa-spin'></i> Loading saved schedules...</div>";

            await loadOnce("js/reports/monthlyScheduleList.js");

            if (typeof window.openMonthlyScheduleList !== "function") {
                contentArea.innerHTML = "<div style='padding:20px;text-align:center;color:#c33;'>Saved list module not found</div>";
                return;
            }

            try {
                // Clear and use the contentArea directly
                contentArea.innerHTML = "";
                window.openMonthlyScheduleList(contentArea);

            } catch (err) {
                console.error("Saved list loading error:", err);
                contentArea.innerHTML = "<div style='padding:20px;text-align:center;color:#c33;'>Failed to load saved list: " + err.message + "</div>";
            }
        }

        // Add click event handlers to the tracker divs
        const editorTracker = editorCardContainer.querySelector('.ms-card-tracker');
        const savedTracker = savedCardContainer.querySelector('.ms-card-tracker');

        addEventHandler(editorTracker, "click", loadEditor);
        addEventHandler(savedTracker, "click", loadSaved);
        addEventHandler(backBtn, "click", showCardsView);

        // Listen for save events to refresh the saved list if it's currently active
        function handleScheduleSaved() {
            if (currentView === 'saved') {
                loadSaved();
            }
        }
        window.addEventListener("monthlyScheduleSaved", handleScheduleSaved);
        eventHandlers.push({
            element: window,
            event: "monthlyScheduleSaved",
            handler: handleScheduleSaved
        });

        // Expose function to directly open editor (for external calls like from Key Map)
        window.openMonthlyScheduleEditor = function() {
            loadEditor();
        };

        // Return cleanup function
        return cleanup;
    };

})();