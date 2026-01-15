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

        // Header - Only title with back button to cards view
        const header = el("div", {
            class: "monthly-schedule-header",
            style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;"
        });

        header.appendChild(el("h2", {
            style: "color:var(--primary); margin:0;",
            text: title || "මාසික ඉදිරි කාලසටහන"
        }));

        // Back button (for use inside sub-views)
        const backBtn = el("button", {
            id: "ms_back_btn",
            style: "display:none;padding:8px 16px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:14px;",
            html: '<i class="fas fa-arrow-left"></i> Back to Menu'
        });

        // Main back button to Reports cards
        const mainBackBtn = el("button", {
            style: "padding:8px 16px;border-radius:8px;border:none;background:var(--primary);color:white;cursor:pointer;font-weight:600;",
            html: '<i class="fas fa-arrow-left"></i> Reports වෙත ආපසු'
        });
        mainBackBtn.onclick = () => showContent('Reports', null);

        header.appendChild(mainBackBtn);
        header.appendChild(backBtn);
        realContent.appendChild(header);

        // Create cards container
        const cardsContainer = el("div", {
            id: "ms_cards_container",
            class: "monthly-schedule-cards",
            style: "display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;"
        });

        // Card 1: Editor Card (Clickable)
        const editorCard = el("div", {
            class: "glass card-clickable",
            style: "padding:25px;border-radius:12px;cursor:pointer;text-align:center;transition:all 0.3s ease;border:2px solid var(--primary);min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;"
        });

        const editorIcon = el("i", {
            class: "fas fa-edit",
            style: "font-size:2em;color:var(--primary);margin-bottom:10px;"
        });

        const editorTitle = el("h3", {
            style: "color:var(--primary);margin:0 0 8px 0;font-size:18px;",
            text: "Editor"
        });

        const editorDesc = el("p", {
            style: "color:#666;margin:0;font-size:14px;",
            text: "Create or edit monthly schedules"
        });

        editorCard.appendChild(editorIcon);
        editorCard.appendChild(editorTitle);
        editorCard.appendChild(editorDesc);

        // Card 2: Saved List Card (Clickable)
        const savedCard = el("div", {
            class: "glass card-clickable",
            style: "padding:25px;border-radius:12px;cursor:pointer;text-align:center;transition:all 0.3s ease;border:2px solid var(--primary);min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;"
        });

        const savedIcon = el("i", {
            class: "fas fa-list",
            style: "font-size:2em;color:var(--primary);margin-bottom:10px;"
        });

        const savedTitle = el("h3", {
            style: "color:var(--primary);margin:0 0 8px 0;font-size:18px;",
            text: "Saved Schedules"
        });

        const savedDesc = el("p", {
            style: "color:#666;margin:0;font-size:14px;",
            text: "View and manage saved schedules"
        });

        savedCard.appendChild(savedIcon);
        savedCard.appendChild(savedTitle);
        savedCard.appendChild(savedDesc);

        cardsContainer.appendChild(editorCard);
        cardsContainer.appendChild(savedCard);

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
            cardsContainer.style.display = "grid";
            contentArea.style.display = "none";
            backBtn.style.display = "none";
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

        // Add hover effects for cards
        editorCard.addEventListener('mouseenter', () => {
            editorCard.style.transform = 'translateY(-2px)';
            editorCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });

        editorCard.addEventListener('mouseleave', () => {
            editorCard.style.transform = 'translateY(0)';
            editorCard.style.boxShadow = 'none';
        });

        savedCard.addEventListener('mouseenter', () => {
            savedCard.style.transform = 'translateY(-2px)';
            savedCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });

        savedCard.addEventListener('mouseleave', () => {
            savedCard.style.transform = 'translateY(0)';
            savedCard.style.boxShadow = 'none';
        });

        // Add click event handlers
        addEventHandler(editorCard, "click", loadEditor);
        addEventHandler(savedCard, "click", loadSaved);
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

        // Return cleanup function
        return cleanup;
    };

})();