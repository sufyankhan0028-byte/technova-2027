import confetti from 'canvas-confetti';
import { RetroArcadeScene } from './three-scene.js';
import { arcadeAudio } from './audio.js';
import { ArcadeMinigame } from './minigame.js';

/**
 * TECHNOVA 2027 — MAIN APPLICATION LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. INITIALIZE 3D ARCADE HERO EXPERIENCE
  const heroScene = new RetroArcadeScene('three-canvas');
  if (heroScene) {
    heroScene.onObjectClick = (objName) => {
      arcadeAudio.playPowerup();
      // Temporary badge notification or console feedback
      console.log(`[3D Arcade] Popped: ${objName}`);
    };
  }

  // 2. INITIALIZE 2D RETRO ARCADE MINIGAME
  const minigame = new ArcadeMinigame();

  // 3. AUDIO SFX TOGGLE HUD
  const sfxBtn = document.getElementById('sfx-toggle-btn');
  if (sfxBtn) {
    const updateSfxBtn = (isEnabled) => {
      sfxBtn.setAttribute('aria-pressed', isEnabled);
      const icon = sfxBtn.querySelector('.hud-icon');
      const label = sfxBtn.querySelector('.hud-label');
      if (icon) icon.textContent = isEnabled ? '🔊' : '🔇';
      if (label) label.textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
      if (isEnabled) sfxBtn.classList.add('active');
      else sfxBtn.classList.remove('active');
    };

    updateSfxBtn(arcadeAudio.enabled);

    sfxBtn.addEventListener('click', () => {
      const isEnabled = arcadeAudio.toggle();
      updateSfxBtn(isEnabled);
    });
  }

  // 4. CRT SCANLINE TOGGLE HUD
  const crtBtn = document.getElementById('crt-toggle-btn');
  if (crtBtn) {
    let crtEnabled = true;
    crtBtn.addEventListener('click', () => {
      arcadeAudio.playBlip();
      crtEnabled = !crtEnabled;
      document.body.classList.toggle('crt-enabled', crtEnabled);
      crtBtn.setAttribute('aria-pressed', crtEnabled);
      const icon = crtBtn.querySelector('.hud-icon');
      const label = crtBtn.querySelector('.hud-label');
      if (icon) icon.textContent = crtEnabled ? '📺' : '⬛';
      if (label) label.textContent = crtEnabled ? 'CRT: ON' : 'CRT: OFF';
      if (crtEnabled) crtBtn.classList.add('active');
      else crtBtn.classList.remove('active');
    });
  }

  // 5. ATTACH SOUNDS TO BUTTONS & LINKS
  document.querySelectorAll('.arcade-btn').forEach((btn) => {
    btn.addEventListener('mouseenter', () => arcadeAudio.playBlip());
    btn.addEventListener('click', () => arcadeAudio.playCoin());
  });

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((link) => {
    link.addEventListener('mouseenter', () => arcadeAudio.playBlip());
    link.addEventListener('click', () => arcadeAudio.playLaser());
  });

  // 6. LIVE RETRO ARCADE COUNTDOWN TIMER
  const targetDate = new Date('2027-03-12T09:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      document.getElementById('arcade-countdown').innerHTML =
        '<div class="timer-header"><span class="timer-led-dot"></span><span>HACKATHON IS LIVE!</span></div>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('mins');
    const sEl = document.getElementById('secs');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 7. MOBILE NAVIGATION DRAWER
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      arcadeAudio.playLaser();
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on nav link click
    mobileMenu.querySelectorAll('.mobile-nav-link, .arcade-btn').forEach((item) => {
      item.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 8. METRIC COUNTERS (ANIMATED ON SCROLL)
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counters.forEach((counter) => {
            const target = +counter.getAttribute('data-target');
            const duration = 1500;
            const startTime = performance.now();

            function animateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out expo
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentVal = Math.floor(easeProgress * target);
              counter.textContent = currentVal;

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                counter.textContent = target;
              }
            }

            requestAnimationFrame(animateCount);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const metricsSection = document.querySelector('.metrics-row');
  if (metricsSection) {
    observer.observe(metricsSection);
  }

  // 9. TRACKS FILTER LOGIC
  const filterBtns = document.querySelectorAll('.filter-btn');
  const trackCards = document.querySelectorAll('.track-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      arcadeAudio.playBlip();
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      trackCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 10. TRACK DETAILS MODAL (MISSION SPECS)
  const trackModal = document.getElementById('track-modal');
  const trackModalIcon = document.getElementById('track-modal-icon');
  const trackModalTitle = document.getElementById('track-modal-title');
  const trackModalBody = document.getElementById('track-modal-body');
  const trackModalCloseBtn = document.getElementById('track-modal-close-btn');

  const trackDetailsData = {
    track1: {
      icon: '🛡️',
      title: 'TRACK 01: CAN YOU TRUST WHAT YOU SEE?',
      content: `
        <div class="modal-theme-banner">THEME: DIGITAL TRUST, CYBERSECURITY &amp; ONLINE SAFETY</div>
        
        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 01</span>
            <h4 class="challenge-title">The Scam Before the Click</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Online scams are becoming harder to distinguish from genuine messages, websites and payment requests. People often discover they have been manipulated only after sharing personal information or losing money.
            <br><br>
            Build a solution that helps users identify suspicious digital interactions before they act. It could analyze a message, URL, email or screenshot, flag potential warning signs, explain why something looks suspicious and recommend safer next steps.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that detects or assesses suspicious interactions and gives users understandable, actionable warnings.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 02</span>
            <h4 class="challenge-title">Proof Before You Believe</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            AI-generated images, manipulated videos, cloned voices and misleading posts make it increasingly difficult to judge whether digital content is authentic. Simply labelling something as real or fake is not always reliable.
            <br><br>
            Build a tool that helps users investigate suspicious content by examining signs of manipulation, available source information, provenance or corroborating evidence. The solution should communicate uncertainty honestly rather than claiming to know the truth when evidence is insufficient.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A prototype that helps users assess digital content, presents supporting evidence and explains its confidence or limitations.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge open-badge">PS 03: OPEN INNOVATION</span>
            <h4 class="challenge-title">Open Innovation: The Trust Layer</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Digital life depends on people trusting the identities, information, platforms and transactions they interact with. Yet existing tools do not solve every online safety problem.
            <br><br>
            Identify a meaningful challenge involving digital trust, cybersecurity, privacy, identity verification or misinformation and build an original solution that makes online interactions safer.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype addressing a clearly defined digital safety problem, with a demonstration of how the solution reduces risk or improves trust.</div>
          </div>
        </div>
      `
    },
    track2: {
      icon: '💳',
      title: 'TRACK 02: SURVIVE THE MONEY GAME',
      content: `
        <div class="modal-theme-banner">THEME: FINTECH, FINANCIAL LITERACY &amp; FINANCIAL INCLUSION</div>
        
        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 01</span>
            <h4 class="challenge-title">Make It to Month-End</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Students, first-time earners and households with irregular incomes often struggle to understand where their money goes, plan upcoming expenses and avoid running short before their next income arrives. Traditional budgeting tools can feel complicated or fail to reflect real spending habits.
            <br><br>
            Build an intuitive financial companion that helps users track expenses, estimate upcoming obligations and understand how current spending could affect their remaining budget. It should turn financial data into practical, easy-to-understand decisions.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that provides useful budget insights, identifies potential shortfalls and helps users plan their spending.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 02</span>
            <h4 class="challenge-title">The Payment Pause</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Digital payment scams often exploit urgency, fake payment screenshots, deceptive QR codes and social engineering. Many users lack a simple way to assess the risk of a payment request before proceeding.
            <br><br>
            Build a solution that helps users evaluate suspicious payment requests or transaction scenarios before they act. It could assess warning signs in a message or payment request, explain potential risks and guide users towards safer verification steps.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A prototype that evaluates sample payment scenarios and provides clear, explainable risk warnings without requiring access to real banking credentials or live payment systems.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge open-badge">PS 03: OPEN INNOVATION</span>
            <h4 class="challenge-title">Open Innovation: Money for Everyone</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Financial systems can be difficult to navigate for people with limited financial knowledge, small businesses, underserved communities and individuals who struggle to access suitable financial services.
            <br><br>
            Identify an important financial problem not covered by the other two challenges. Build an original solution that improves financial access, transparency, money management or financial understanding.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that addresses a clearly identified financial need and demonstrates how the proposed solution improves the user's experience or decision-making.</div>
          </div>
        </div>
      `
    },
    track3: {
      icon: '🌱',
      title: 'TRACK 03: FROM SOIL TO SHELF',
      content: `
        <div class="modal-theme-banner">THEME: AGRITECH, FOOD SYSTEMS &amp; SUPPLY CHAINS</div>
        
        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 01</span>
            <h4 class="challenge-title">A Fair Price for Every Harvest</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Farmers often make selling decisions without convenient access to reliable market-price information, demand trends or comparisons between potential buyers. Limited visibility can make it harder to negotiate fair prices and plan when and where to sell produce.
            <br><br>
            Build a solution that helps farmers or agricultural cooperatives compare available market information, understand price differences and make better-informed selling decisions. Your prototype could combine market data, demand estimates, transport considerations or buyer discovery.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A prototype that turns agricultural market information into practical selling insights. Teams may use sample datasets or clearly identified data sources.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 02</span>
            <h4 class="challenge-title">The Fight Against Food Waste</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Food is lost or wasted at multiple stages, from harvesting and storage to retail and consumption. Poor demand forecasting, inadequate inventory visibility and delayed redistribution can cause usable food to be discarded while others struggle to access it.
            <br><br>
            Build a solution that prevents avoidable food waste at one or more stages of the food chain. Consider tools for spoilage-risk alerts, demand prediction, inventory management, surplus-food discovery or coordination between food providers and potential recipients.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that identifies a source of avoidable food waste and demonstrates how it can reduce losses or improve the use of available food.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge open-badge">PS 03: OPEN INNOVATION</span>
            <h4 class="challenge-title">Open Innovation: Rethink the Food Chain</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Agriculture and food distribution face interconnected challenges involving crop health, water use, unpredictable weather, logistics, market access and resource efficiency.
            <br><br>
            Identify a meaningful problem affecting farmers, food producers, distributors or consumers, and build an original technology-based solution. Your idea may use AI, IoT, data analytics, mapping or another suitable approach.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that addresses a specific agricultural or food-system problem and demonstrates measurable or clearly explainable potential benefits.</div>
          </div>
        </div>
      `
    },
    track4: {
      icon: '♿',
      title: 'TRACK 04: TECHNOLOGY WITHOUT BARRIERS',
      content: `
        <div class="modal-theme-banner">THEME: ACCESSIBILITY, ASSISTIVE TECHNOLOGY &amp; INCLUSIVE HEALTHCARE</div>
        
        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 01</span>
            <h4 class="challenge-title">Navigate with Confidence</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Everyday environments can create significant barriers for people with visual, mobility or other disabilities. Navigating unfamiliar spaces, identifying obstacles and accessing useful environmental information can require assistance from others.
            <br><br>
            Build an assistive solution that helps people navigate or interact with their surroundings more independently. Possible approaches include accessible navigation, obstacle awareness, voice-based guidance, object recognition or accessible environmental information.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A demonstrable prototype tested in a defined environment, with accessibility considered from the beginning and clear communication of its limitations in safety-critical situations.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 02</span>
            <h4 class="challenge-title">Healthcare Without the Maze</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Accessing healthcare can be difficult for older adults, people with disabilities, caregivers and individuals who face language or digital-literacy barriers. Finding the right service, understanding instructions, preparing documents and coordinating appointments can turn a basic healthcare visit into a stressful process.
            <br><br>
            Build an accessible solution that makes one or more parts of the healthcare journey easier. It could simplify non-diagnostic health information, support local-language communication, help users prepare for appointments or improve coordination between patients and caregivers.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that removes a clearly defined barrier to accessing or navigating healthcare. It should protect sensitive information and avoid presenting unqualified AI outputs as medical diagnoses.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge open-badge">PS 03: OPEN INNOVATION</span>
            <h4 class="challenge-title">Open Innovation: Inclusion by Design</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Many digital services, public spaces and everyday tools are not designed for the full range of human needs and abilities. This can prevent people from learning, communicating, accessing services or living independently.
            <br><br>
            Identify a meaningful accessibility or inclusion problem and build an original solution that gives people greater independence, participation or access to essential services.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype designed around a clearly identified user need, with an explanation of how it improves accessibility and usability.</div>
          </div>
        </div>
      `
    },
    track5: {
      icon: '🤖',
      title: 'TRACK 05: MAKE THE IMPOSSIBLE ROUTINE',
      content: `
        <div class="modal-theme-banner">THEME: AI AGENTS, INTELLIGENT AUTOMATION &amp; SMART SYSTEMS</div>
        
        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 01</span>
            <h4 class="challenge-title">From Request to Done</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Many digital tasks require people to move between applications, gather information, make decisions and complete several steps manually. Conventional chatbots may provide instructions but leave users to do the actual work.
            <br><br>
            Build an AI-powered agent that can take a user request, plan a sequence of actions, use appropriate tools and complete a multi-step workflow. The system should show its progress, handle errors and request human confirmation before consequential or irreversible actions.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working agent that completes at least one useful end-to-end workflow using real or simulated tools, with a traceable record of its actions.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge">PS 02</span>
            <h4 class="challenge-title">Give Small Teams Superpowers</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            Small businesses, student organizations and early-stage teams spend valuable time on repetitive administrative work, such as collecting form responses, organizing records, preparing reports, managing requests and following up on pending tasks. They often lack the resources to adopt complex enterprise systems.
            <br><br>
            Build an affordable automation solution that connects everyday tools and reduces manual work in a defined workflow. It should handle routine cases automatically, identify exceptions and allow people to review important decisions.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype that automates a real or simulated organizational workflow and demonstrates the time or effort it can save.</div>
          </div>
        </div>

        <div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-badge open-badge">PS 03: OPEN INNOVATION</span>
            <h4 class="challenge-title">Open Innovation: Beyond the Chatbot</h4>
          </div>
          <div class="challenge-section-heading">PROBLEM STATEMENT</div>
          <p class="challenge-desc-text">
            AI can do more than generate text. It can help coordinate tools, interpret information, support decisions and automate complex tasks. However, many AI applications remain limited to simple question-and-answer interactions.
            <br><br>
            Identify a problem that could benefit from an intelligent agent, autonomous workflow or AI-assisted system, and develop an original solution. Your project should demonstrate a meaningful capability beyond simply wrapping a general-purpose chatbot.
          </p>
          <div class="challenge-outcome-box">
            <div class="challenge-outcome-heading">EXPECTED OUTCOME</div>
            <div class="challenge-outcome-text">A working prototype demonstrating intelligent action, useful tool integration or multi-step problem-solving, with appropriate safeguards and clear handling of uncertainty.</div>
          </div>
        </div>
      `
    }
  };

  let lastFocusedTrackCard = null;

  function openTrackModal(trackKey, triggerElement) {
    const data = trackDetailsData[trackKey];
    if (data && trackModal) {
      lastFocusedTrackCard = triggerElement || document.activeElement;
      arcadeAudio.playLaser();
      trackModalIcon.textContent = data.icon;
      trackModalTitle.textContent = data.title;
      trackModalBody.innerHTML = data.content;
      trackModal.classList.remove('hidden');
      trackModal.setAttribute('aria-hidden', 'false');
      const modalBox = trackModal.querySelector('.modal-box');
      if (modalBox) modalBox.scrollTop = 0;
      if (trackModalCloseBtn) {
        trackModalCloseBtn.focus();
      }
    }
  }

  function closeTrackModal() {
    if (trackModal && !trackModal.classList.contains('hidden')) {
      trackModal.classList.add('hidden');
      trackModal.setAttribute('aria-hidden', 'true');
      if (lastFocusedTrackCard && typeof lastFocusedTrackCard.focus === 'function') {
        lastFocusedTrackCard.focus();
      }
    }
  }

  // Make entire track card interactive
  trackCards.forEach((card) => {
    const trackKey = card.getAttribute('data-track') || card.getAttribute('data-category');

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      openTrackModal(trackKey, card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTrackModal(trackKey, card);
      }
    });
  });

  if (trackModalCloseBtn && trackModal) {
    trackModalCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTrackModal();
    });
    trackModal.addEventListener('click', (e) => {
      if (e.target === trackModal) {
        closeTrackModal();
      }
    });
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trackModal && !trackModal.classList.contains('hidden')) {
      closeTrackModal();
    }
  });

  // 11. 8-HOUR SINGLE-STAGE TIMELINE (Continuous progression)

  // 12. FAQ ACCORDION
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach((q) => {
    q.addEventListener('click', () => {
      arcadeAudio.playBlip();
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 13. REGISTRATION MODAL & CONFIRMED TICKET GENERATION
  const registerModal = document.getElementById('register-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const regForm = document.getElementById('registration-form');
  const ticketDisplay = document.getElementById('registration-ticket');
  const ticketIdDisplay = document.getElementById('ticket-id-display');
  const ticketNameDisplay = document.getElementById('ticket-name-display');
  const ticketTeamDisplay = document.getElementById('ticket-team-display');
  const closeTicketBtn = document.getElementById('close-ticket-btn');

  // Trigger buttons that open the modal
  const openRegBtns = [
    document.getElementById('open-register-nav-btn'),
    document.getElementById('mobile-register-btn'),
    document.getElementById('hero-register-btn'),
    document.getElementById('final-register-btn')
  ];

  openRegBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        arcadeAudio.playCoin();
        if (registerModal) {
          registerModal.classList.remove('hidden');
          // Reset view to form if previously submitted
          if (regForm && ticketDisplay) {
            regForm.classList.remove('hidden');
            ticketDisplay.classList.add('hidden');
          }
        }
      });
    }
  });

  if (modalCloseBtn && registerModal) {
    modalCloseBtn.addEventListener('click', () => {
      registerModal.classList.add('hidden');
    });
    registerModal.addEventListener('click', (e) => {
      if (e.target === registerModal) registerModal.classList.add('hidden');
    });
  }

  // Handle Form Submission
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('reg-name').value || 'Hacker';
      const team = document.getElementById('reg-team').value || 'Pixel Pioneers';
      const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `TN27-${randomTicketNum}`;

      // Audio celebration
      arcadeAudio.playVictory();

      // Confetti Blast
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff007a', '#ffc400', '#38bdf8', '#ffffff']
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff007a', '#ffc400']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff007a', '#ffc400']
        });
      }, 250);

      // Populate Ticket
      if (ticketIdDisplay) ticketIdDisplay.textContent = ticketId;
      if (ticketNameDisplay) ticketNameDisplay.textContent = name.toUpperCase();
      if (ticketTeamDisplay) ticketTeamDisplay.textContent = team.toUpperCase();

      // Switch form to ticket
      regForm.classList.add('hidden');
      ticketDisplay.classList.remove('hidden');
    });
  }

  if (closeTicketBtn && registerModal) {
    closeTicketBtn.addEventListener('click', () => {
      arcadeAudio.playCoin();
      registerModal.classList.add('hidden');
    });
  }

  // 14. QUICK PLAY MINI-GAME BUTTON
  const quickPlayBtn = document.getElementById('quick-play-btn');
  if (quickPlayBtn) {
    quickPlayBtn.addEventListener('click', () => {
      const arcadeZone = document.getElementById('arcade-zone');
      if (arcadeZone) {
        arcadeZone.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          minigame.startGame();
        }, 600);
      }
    });
  }

  // 15. BACK TO TOP
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      arcadeAudio.playLaser();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  console.log('👾 [TECHNOVA 2027] Retro Arcade Systems Operational.');
});
