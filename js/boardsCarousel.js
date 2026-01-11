/* =======================================================
   Modern Glass Boards Carousel Module (boardsCarousel.js)
   ======================================================= */

(() => {
    // ====== MODERN GLASS BOARDS CAROUSEL FUNCTIONALITY ======
    window.initBoardsCarousel = function() {
        const track = document.querySelector('.carousel-track');
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const indicators = document.querySelectorAll('.indicator');
        const currentSlideEl = document.querySelector('.current-slide');
        const totalSlidesEl = document.querySelector('.total-slides');
        const playPauseBtn = document.getElementById('playPauseBtn');
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        let autoSlideInterval;
        let isAutoPlaying = true;
        
        // Set total slides count
        if (totalSlidesEl) {
            totalSlidesEl.textContent = totalSlides;
        }
        
        // Update carousel display with modern effects
        function updateCarousel() {
            // Move the track with smooth animation
            if (track) {
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
            
            // Update active states with modern transitions
            slides.forEach((slide, index) => {
                if (index === currentSlide) {
                    slide.classList.add('active');
                    // Add entrance animation
                    slide.style.animation = 'modernFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                } else {
                    slide.classList.remove('active');
                }
            });
            
            // Update indicators with modern effects
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
            
            // Update counter
            if (currentSlideEl) {
                currentSlideEl.textContent = currentSlide + 1;
            }
            
            // Update slide title
            updateSlideTitle();
            
            // Initialize admin board features when this slide is active
            if (currentSlide === 0) {
                setTimeout(() => {
                    initAdminBoardFeatures();
                }, 300);
            }
        }
        
        // Update slide title
        function updateSlideTitle() {
            const slideTitle = document.querySelector('.slide-title');
            if (slideTitle) {
                const titles = [
                    'Administration & Statistics',
                    'Epidemiology & Disease Control',
                    'Environmental Health & Safety',
                    'School Health & Immunization',
                    'Miscellaneous Activities'
                ];
                slideTitle.textContent = titles[currentSlide];
                // Add animation to title
                slideTitle.style.animation = 'none';
                setTimeout(() => {
                    slideTitle.style.animation = 'modernFadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }, 10);
            }
        }
        
        // Next slide with modern transition
        function nextSlide() {
            const nextIndex = (currentSlide + 1) % totalSlides;
            navigateToSlide(nextIndex);
        }
        
        // Previous slide with modern transition
        function prevSlide() {
            const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
            navigateToSlide(prevIndex);
        }
        
        // Navigate to specific slide with enhanced animation
        function navigateToSlide(index) {
            // Add exit animation to current slide
            const currentActive = slides[currentSlide];
            if (currentActive) {
                currentActive.style.animation = 'none';
                setTimeout(() => {
                    currentActive.style.animation = 'modernFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }, 50);
            }
            
            currentSlide = index;
            updateCarousel();
            
            // Restart auto-slide timer when manually navigating
            if (isAutoPlaying) {
                stopAutoSlide();
                startAutoSlide();
            }
        }
        
        // Go to specific slide
        function goToSlide(index) {
            navigateToSlide(index);
        }
        
        // Auto-slide functionality
        function startAutoSlide() {
            if (!autoSlideInterval) {
                autoSlideInterval = setInterval(nextSlide, 6000); // Change slide every 6 seconds
            }
            if (playPauseBtn) {
                playPauseBtn.classList.add('playing');
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Auto-Play';
            }
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
            if (playPauseBtn) {
                playPauseBtn.classList.remove('playing');
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start Auto-Play';
            }
        }
        
        // Initialize auto-slide
        startAutoSlide();
        
        // Modern auto-play controls
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                isAutoPlaying = !isAutoPlaying;
                
                if (isAutoPlaying) {
                    startAutoSlide();
                    // Add button animation
                    playPauseBtn.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        playPauseBtn.style.transform = 'scale(1)';
                    }, 200);
                } else {
                    stopAutoSlide();
                }
            });
        }
        
        // Enhanced event listeners with modern interactions
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                // Add button feedback
                nextBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    nextBtn.style.transform = 'scale(1)';
                }, 150);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                // Add button feedback
                prevBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    prevBtn.style.transform = 'scale(1)';
                }, 150);
            });
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                // Add indicator feedback
                indicator.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    indicator.style.transform = 'scale(1)';
                }, 150);
            });
        });
        
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                if (isAutoPlaying) {
                    stopAutoSlide();
                    startAutoSlide();
                }
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                if (isAutoPlaying) {
                    stopAutoSlide();
                    startAutoSlide();
                }
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (playPauseBtn) {
                    playPauseBtn.click();
                }
            } else if (e.key >= '1' && e.key <= '5') {
                const slideIndex = parseInt(e.key) - 1;
                if (slideIndex < totalSlides) {
                    goToSlide(slideIndex);
                }
            }
        });
        
        // Enhanced touch/swipe support for mobile
        let startX = 0;
        let endX = 0;
        let isSwiping = false;
        
        if (track) {
            track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isSwiping = true;
                track.style.transition = 'none';
            });
            
            track.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;
                endX = e.touches[0].clientX;
                const diff = startX - endX;
                track.style.transform = `translateX(calc(-${currentSlide * 100}% - ${diff * 0.5}px))`;
            });
            
            track.addEventListener('touchend', () => {
                if (!isSwiping) return;
                isSwiping = false;
                track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                const diff = startX - endX;
                const swipeThreshold = 50;
                
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        nextSlide(); // Swipe left
                    } else {
                        prevSlide(); // Swipe right
                    }
                } else {
                    updateCarousel(); // Return to current position
                }
                
                // Restart auto-slide timer when manually navigating
                if (isAutoPlaying) {
                    stopAutoSlide();
                    startAutoSlide();
                }
            });
        }
        
        // Enhanced pause auto-slide on hover
        const carousel = document.querySelector('.boards-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => {
                if (isAutoPlaying) {
                    stopAutoSlide();
                }
            });
            
            carousel.addEventListener('mouseleave', () => {
                if (isAutoPlaying) {
                    startAutoSlide();
                }
            });
        }
        
        // Enhanced visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoSlide();
            } else if (isAutoPlaying) {
                startAutoSlide();
            }
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            stopAutoSlide();
        });
        
        // Initialize the first slide with modern entrance
        setTimeout(() => {
            updateCarousel();
        }, 100);
    };

    // ====== MODERN ADMIN BOARD FEATURES ======
    function initAdminBoardFeatures() {
        const adminAreaMap = document.getElementById('adminAreaMap');
        
        if (adminAreaMap) {
            // PHI Area Map ලබාගෙන පෙන්වන්න
            const savedMapDataUrl = localStorage.getItem("phiAreaMap");
            if (savedMapDataUrl) {
                adminAreaMap.innerHTML = `
                    <div style="position: relative; width: 100%; height: 100%; border-radius: 8px; overflow: hidden;">
                        <img src="${savedMapDataUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="PHI Area Map">
                        <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                            A3 සිතියම
                        </div>
                        <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 6px 12px; border-radius: 15px; font-size: 10px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                            ක්ලික් කරන්න විස්තර සඳහා
                        </div>
                    </div>
                `;
            }
            
            // Area Map ක්ලික් කළ විට PHI Area පිටුවට යන්න
            adminAreaMap.addEventListener('click', () => {
                document.querySelector('.sidebar ul li:nth-child(2)').click();
            });
        }
        
        // Administration Form ක්ලික් කිරීම
        const adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.addEventListener('click', () => {
                // Add modern click feedback
                adminForm.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    adminForm.style.transform = 'scale(1)';
                }, 150);
                
                alert('පරිපාලන ආකෘති පත්‍රය විවෘත කරනු ඇත');
            });
        }
        
        // Public Health Statistics Form ක්ලික් කිරීම
        const statsForm = document.getElementById('statsForm');
        if (statsForm) {
            statsForm.addEventListener('click', () => {
                // Add modern click feedback
                statsForm.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    statsForm.style.transform = 'scale(1)';
                }, 150);
                
                alert('සෞඛ්‍ය සංඛ්‍යාලේඛන ආකෘති පත්‍රය විවෘත කරනු ඇත');
            });
        }
    }

    // ====== MODERN BOARDS CONTENT GENERATOR ======
    window.generateBoardsContent = function() {
        return `
        <h2 style="text-align: center; color: var(--primary); margin-bottom: 10px; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">පුවරු (Boards)</h2>
        <p style="text-align: center; color: var(--text-dark); margin-bottom: 30px; opacity: 0.8; font-size: 14px;">Interactive Glass Dashboard - සක්‍රී ග්ලාස් උපකරණ පුවරුව</p>
        
        <div class="boards-container">
          <div class="boards-carousel">
            <div class="carousel-container">
              <div class="carousel-track">
                <!-- Board 1: Administration & Statistics - MODERN GLASS VERSION -->
                <div class="carousel-slide active" data-slide="0">
                  <div class="board-item">
                    <h3>Administration & Statistics</h3>
                    <div class="board-content">
                      <h4>පරිපාලනය සහ සංඛ්‍යාලේඛන</h4>
                      
                      <div class="admin-board-content">
                        <!-- Modern A3 Map Section -->
                        <div class="a3-section">
                          <h5>PHI Area Map (A3)</h5>
                          <div id="adminAreaMap">
                            <div style="color: rgba(255,255,255,0.8); text-align: center; padding: 40px;">
                              <i class="fas fa-map-marked-alt fa-4x" style="margin-bottom: 20px; opacity: 0.7;"></i>
                              <p style="margin: 0; font-weight: 600; font-size: 18px;">PHI Area සිතියම</p>
                              <small style="font-size: 13px; margin-top: 8px; display: block;">ක්ලික් කරන්න PHI Area සිතියම විවෘත කිරීමට</small>
                            </div>
                          </div>
                        </div>
                        
                        <div class="admin-forms-container">
                          <!-- Modern Administration Form (A4) -->
                          <div class="a4-section">
                            <h5>Administration Form (A4)</h5>
                            <div id="adminForm" class="form-box-content">
                              <i class="fas fa-file-contract form-box-icon"></i>
                              <p class="form-box-title">පරිපාලන ආකෘති පත්‍රය</p>
                              <p class="form-box-description">පරිපාලන සංගණන, වාර්තා, රැස්වීම්, කළමනාකරණ දත්ත</p>
                            </div>
                          </div>
                          
                          <!-- Modern Public Health Statistics Form (A4) -->
                          <div class="a4-section">
                            <h5>Public Health Statistics (A4)</h5>
                            <div id="statsForm" class="form-box-content">
                              <i class="fas fa-chart-line form-box-icon"></i>
                              <p class="form-box-title">සෞඛ්‍ය සංඛ්‍යාලේඛන</p>
                              <p class="form-box-description">රෝග, එන්නත්, සෞඛ්‍ය සේවා, වැඩසටහන් දත්ත</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Board 2: Epidemiology - Modern Glass Version -->
                <div class="carousel-slide" data-slide="1">
                  <div class="board-item">
                    <h3>Epidemiology & Disease Control</h3>
                    <div class="board-content">
                      <h4>වසංගත රෝග විද්‍යාව සහ පාලනය</h4>
                      <div class="board-stats">
                        <div class="stat-item">
                          <span class="stat-number">34</span>
                          <span class="stat-label">බෝවන රෝග වර්ග</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">156</span>
                          <span class="stat-label">රෝගීන් ගණන</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">78</span>
                          <span class="stat-label">පරීක්ෂණ සමුලු</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">92%</span>
                          <span class="stat-label">වළක්වා ගැනීමේ සාර්ථකත්වය</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">6</span>
                          <span class="stat-label">වසංගත විමර්ශන</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">100%</span>
                          <span class="stat-label">වාර්තාකරණ සම්පූර්ණත්වය</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Board 3: Environmental Health - Modern Glass Version -->
                <div class="carousel-slide" data-slide="2">
                  <div class="board-item">
                    <h3>Environmental Health & Safety</h3>
                    <div class="board-content">
                      <h4>පරිසර සෞඛ්‍යය සහ ආරක්ෂාව</h4>
                      <div class="board-stats">
                        <div class="stat-item">
                          <span class="stat-number">67</span>
                          <span class="stat-label">ජල පරීක්ෂණ සමුලු</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">23</span>
                          <span class="stat-label">පිරිසිදු වාතය කලාප</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">45</span>
                          <span class="stat-label">කසල කළමනාකරණ වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">89%</span>
                          <span class="stat-label">සනීපාරක්ෂක සාර්ථකත්වය</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">12</span>
                          <span class="stat-label">පාරිසරික වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">34</span>
                          <span class="stat-label">පරිශ්‍රීල පරීක්ෂා</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Board 4: School Health - Modern Glass Version -->
                <div class="carousel-slide" data-slide="3">
                  <div class="board-item">
                    <h3>School Health & Immunization</h3>
                    <div class="board-content">
                      <h4>පාසල් සෞඛ්‍යය සහ එන්නත් කිරීම</h4>
                      <div class="board-stats">
                        <div class="stat-item">
                          <span class="stat-number">15</span>
                          <span class="stat-label">පාසල් සංඛ්‍යාව</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">2,450</span>
                          <span class="stat-label">සිසුන් ගණන</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">89%</span>
                          <span class="stat-label">එන්නත් කිරීමේ සාර්ථකත්වය</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">156</span>
                          <span class="stat-label">සෞඛ්‍ය වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">23</span>
                          <span class="stat-label">ගුරු පුහුණු වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">100%</span>
                          <span class="stat-label">සෞඛ්‍ය අධ්‍යක්ෂණ සම්පූර්ණත්වය</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Board 5: Miscellaneous - Modern Glass Version -->
                <div class="carousel-slide" data-slide="4">
                  <div class="board-item">
                    <h3>Miscellaneous Activities</h3>
                    <div class="board-content">
                      <h4>විවිධාකාර ක්‍රියාකාරකම්</h4>
                      <div class="board-stats">
                        <div class="stat-item">
                          <span class="stat-number">45</span>
                          <span class="stat-label">සමුළු සහ සම්මන්ත්‍රණ</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">78</span>
                          <span class="stat-label">පුහුණු වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">234</span>
                          <span class="stat-label">සහභාගීන් ගණන</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">15</span>
                          <span class="stat-label">සමාජ මාධ්‍ය වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">67</span>
                          <span class="stat-label">ප්‍රචාරක වැඩසටහන්</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-number">92%</span>
                          <span class="stat-label">සමාජ සහභාගීත්ව සාර්ථකත්වය</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Modern Carousel Controls -->
            <div class="carousel-controls">
              <button class="carousel-btn prev-btn" aria-label="පෙර පුවරුව">
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <div class="carousel-indicators">
                <button class="indicator active" data-slide="0" title="Administration & Statistics"></button>
                <button class="indicator" data-slide="1" title="Epidemiology"></button>
                <button class="indicator" data-slide="2" title="Environmental Health"></button>
                <button class="indicator" data-slide="3" title="School Health"></button>
                <button class="indicator" data-slide="4" title="Miscellaneous"></button>
              </div>
              
              <button class="carousel-btn next-btn" aria-label="මීළඟ පුවරුව">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <div class="carousel-counter">
              <span class="current-slide">1</span> / <span class="total-slides">5</span>
              <div class="slide-title">Administration & Statistics</div>
            </div>

            <!-- Modern Auto-play Controls -->
            <div class="auto-play-controls">
              <button id="playPauseBtn" class="playing">
                <i class="fas fa-pause"></i> Pause Auto-Play
              </button>
            </div>
          </div>
        </div>
      `;
    };
    // after generateBoardsContent() inserted and DOM ready
if (document.getElementById('boardsPNBWrap') && typeof window.renderBoardsPNB === 'function') {
  window.renderBoardsPNB('boardsPNBWrap');
}

   // ---------- Boards as Pocket-Note style carousel (5 boards) ----------
window.renderBoardsPNB = function(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;

  // five board definitions (title, subtitle, optional image/icon html)
  const boards = [
    { title: 'Administration & Statistics', subtitle: 'පරිපාලනය සහ සංඛ්‍යාලේඛන', icon: '<i class="fas fa-chart-line fa-2x"></i>' },
    { title: 'Epidemiology & Disease Control', subtitle: 'රෝග විද්‍යාව හා පාලනය', icon: '<i class="fas fa-virus fa-2x"></i>' },
    { title: 'Environmental Health & Safety', subtitle: 'පරිසර සෞඛ්‍ය හා ආරක්ෂාව', icon: '<i class="fas fa-leaf fa-2x"></i>' },
    { title: 'School Health & Immunization', subtitle: 'පාසල් සෞඛ්‍ය හා එන්නත්කරණ', icon: '<i class="fas fa-school fa-2x"></i>' },
    { title: 'Miscellaneous Activities', subtitle: 'වෙනත් ක්‍රියාකාරකම්', icon: '<i class="fas fa-ellipsis-h fa-2x"></i>' }
  ];

  // build container skeleton using existing PNB CSS classes
  wrap.innerHTML = `
    <div class="pnb-carousel-wrap" style="padding:18px;">
      <div class="pnb-carousel" role="region" aria-label="Boards carousel">
        <button class="pnb-arrow left" aria-label="Previous">&lsaquo;</button>
        <div class="pnb-track" tabindex="0"></div>
        <button class="pnb-arrow right" aria-label="Next">&rsaquo;</button>
      </div>
    </div>
  `;

  const track = wrap.querySelector('.pnb-track');
  const leftBtn = wrap.querySelector('.pnb-arrow.left');
  const rightBtn = wrap.querySelector('.pnb-arrow.right');

  // map boards -> pnb-card markup (reuse .pnb-card, .pnb-img, .pnb-body)
  track.innerHTML = boards.map((b, i) => `
    <div class="pnb-card" data-idx="${i}" style="pointer-events:auto;">
      <div class="pnb-img" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg, rgba(235,235,235,0.95), rgba(245,245,245,0.95));">
        ${b.icon}
      </div>
      <div class="pnb-body">
        <div class="pnb-date" style="font-size:16px;">${escapeHtml(b.title)}</div>
        <div class="pnb-places" style="font-size:13px;color:#444;">${escapeHtml(b.subtitle)}</div>
      </div>
    </div>
  `).join('');

  // simple carousel logic reusing approach from pocketNoteBook renderPNBCarousel
  const cards = Array.from(track.querySelectorAll('.pnb-card'));
  if (!cards.length) return;

  let active = 0;
  function update() {
    cards.forEach((card, idx) => {
      card.classList.remove('center','left','right','preview','hidden');
      // position classes
      if (idx === active) {
        card.classList.add('center');
        card.style.transform = 'translate(-50%,-50%) scale(1.03)';
        card.style.zIndex = 30;
      } else if (idx === (active - 1 + cards.length) % cards.length) {
        card.classList.add('left','preview');
        card.style.transform = 'translate(-150%,-50%) scale(0.9) rotate(-3deg)';
        card.style.zIndex = 20;
      } else if (idx === (active + 1) % cards.length) {
        card.classList.add('right','preview');
        card.style.transform = 'translate(50%,-50%) scale(0.9) rotate(3deg)';
        card.style.zIndex = 20;
      } else {
        card.classList.add('hidden');
        card.style.zIndex = 10;
      }
    });
  }

  function next() { active = (active + 1) % cards.length; update(); }
  function prev() { active = (active - 1 + cards.length) % cards.length; update(); }

  // user interactions
  rightBtn.addEventListener('click', next);
  leftBtn.addEventListener('click', prev);

  // keyboard navigation
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key >= '1' && e.key <= String(cards.length)) {
      active = Number(e.key) - 1;
      update();
    }
  });

  // click on card to open corresponding board (hook to existing behavior)
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      // map index -> action (you can customize to open different pages)
      const boardActions = [
        () => alert('Open Administration & Statistics'),
        () => alert('Open Epidemiology & Disease Control'),
        () => alert('Open Environmental Health & Safety'),
        () => alert('Open School Health & Immunization'),
        () => alert('Open Miscellaneous Activities')
      ];
      if (typeof boardActions[idx] === 'function') boardActions[idx]();
    });
  });

  // initial placement
  update();

  // optional: auto-rotate every 6s (like boards carousel)
  let auto = setInterval(next, 6000);
  wrap.addEventListener('mouseenter', () => clearInterval(auto));
  wrap.addEventListener('mouseleave', () => { auto = setInterval(next, 6000); });
};
 
})();