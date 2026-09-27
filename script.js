    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;
    const intro = document.querySelector(".intro-screen");
    const progress = document.querySelector(".progress");
    const hero = document.querySelector(".hero");
    const interestCards = [...document.querySelectorAll(".interest")];
    const flowStage = document.querySelector("[data-flow-stage]");
    const flowLanes = flowStage ? [...flowStage.querySelectorAll(".flow-lane")] : [];
    const siteHeader = document.querySelector(".site-header");
    const frameFlash = document.querySelector(".frame-flash");
    const frameFlashName = document.querySelector(".frame-flash-name");
    const frameFlashIndex = document.querySelector(".frame-flash-index");
    const gsapEngine = window.gsap;
    const scrollTriggerEngine = window.ScrollTrigger;
    const LenisEngine = window.Lenis;
    let motionSuspended = false;

    let smoothScroll = null;
    if (!reduceMotion && LenisEngine && gsapEngine) {
      smoothScroll = new LenisEngine({
        lerp: .06,
        smoothWheel: true,
        wheelMultiplier: .45,
        anchors: true
      });
      if (scrollTriggerEngine) smoothScroll.on("scroll", scrollTriggerEngine.update);
      gsapEngine.ticker.add((time) => smoothScroll.raf(time * 1000));
      gsapEngine.ticker.lagSmoothing(0);
      if (intro) smoothScroll.stop();
    }
    const setScrollPosition = (top, immediate = true) => {
      if (smoothScroll) {
        smoothScroll.scrollTo(top, immediate ? { immediate: true, force: true } : { duration: .8, force: true });
        return;
      }
      window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
    };

    if (hero && !reduceMotion) {
      hero.insertAdjacentHTML("afterbegin", `
        <div class="hero-beat-stage" aria-hidden="true">
          <div class="hero-beat-wash"></div>
          <div class="hero-beat-status">
            <span class="hero-beat-status-name">LIGHTFRAME / ASSEMBLING</span>
            <span class="hero-beat-ticks"><i></i><i></i><i></i><i></i><i></i></span>
          </div>
          <i class="hero-beat-line"></i>
          <i class="hero-beat-line"></i>
          <span class="hero-beat-index"><span>FRAME</span> <span>01</span> / <span>05</span></span>
        </div>
        <div class="hero-ambient" aria-hidden="true">
          <i class="hero-orb hero-orb-a"></i>
          <i class="hero-orb hero-orb-b"></i>
          <i class="hero-scan"></i>
          <div class="hero-kinetic-rail"><span>DESIGN · CODE · MOTION · DESIGN · CODE · MOTION ·&nbsp;</span><span>DESIGN · CODE · MOTION · DESIGN · CODE · MOTION ·&nbsp;</span></div>
          <span class="hero-signal"><i></i><span>LIVE FRAME</span><b>01</b></span>
        </div>
      `);
      body.classList.add("kinetic-hero");
    }

    document.querySelectorAll("[data-split]").forEach((element) => {
      const characters = Array.from(element.textContent);
      element.textContent = "";
      characters.forEach((character, index) => {
        const span = document.createElement("span");
        span.className = "char";
        span.style.setProperty("--i", index);
        span.textContent = character === " " ? "\u00a0" : character;
        element.appendChild(span);
      });
    });

    document.querySelectorAll([
      "[data-flow-text]",
      ".section-label",
      ".hero-meta",
      ".code-label",
      ".scroll-cue",
      ".hero-description",
      ".statement-side",
      ".principle-index",
      ".principle h3",
      ".principle p",
      ".interest-meta",
      ".interest h3",
      ".interest p",
      ".flow-note",
      ".contact-copy",
      ".magnetic-inner",
      ".footer-line"
    ].join(",")).forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach((node) => {
        if (!node.textContent.trim()) return;
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.append(part);
            return;
          }
          const word = document.createElement("span");
          word.className = "flow-word";
          word.textContent = part;
          fragment.append(word);
        });
        node.replaceWith(fragment);
      });
    });

    document.querySelectorAll(".hero-bottom p, .principle p, .interest p, .contact-copy").forEach((element) => {
      element.classList.add("text-drift");
    });

    const flowTracks = [...document.querySelectorAll("[data-flow-track]")];
    flowTracks.forEach((track) => {
      const source = track.innerHTML;
      const sourceCount = track.children.length;
      let segmentCopies = 1;

      while (track.scrollWidth < window.innerWidth * 1.25 && segmentCopies < 6) {
        track.insertAdjacentHTML("beforeend", source);
        segmentCopies += 1;
      }

      const loopSegment = track.innerHTML;
      track.insertAdjacentHTML("beforeend", loopSegment);
      [...track.children].forEach((pill, index) => {
        if (index >= sourceCount) pill.setAttribute("aria-hidden", "true");
      });
    });

    const boostTechnology = () => {
      if (reduceMotion || motionSuspended || flowStage?.matches(":hover")) return;
      flowTracks.forEach((track) => {
        const animation = track.getAnimations()[0];
        if (!animation) return;
        cancelAnimationFrame(track._speedRaf || 0);
        const initialRate = animation.playbackRate;
        const startedAt = performance.now();
        const renderSpeed = (time) => {
          if (motionSuspended) {
            track._speedRaf = requestAnimationFrame(renderSpeed);
            return;
          }
          const progress = Math.min(1,(time - startedAt) / 1450);
          const acceleration = Math.min(1,progress / .18);
          const settling = Math.max(0,(progress - .18) / .82);
          const easedSettling = 1 - Math.pow(1 - settling,3);
          const peakRate = initialRate + (3 - initialRate) * acceleration;
          animation.updatePlaybackRate(peakRate + (1 - peakRate) * easedSettling);
          if (progress < 1) track._speedRaf = requestAnimationFrame(renderSpeed);
          else animation.updatePlaybackRate(1);
        };
        track._speedRaf = requestAnimationFrame(renderSpeed);
      });
    };

    const cancelTechnologyBoost = () => {
      flowTracks.forEach((track) => {
        cancelAnimationFrame(track._speedRaf || 0);
        track._speedRaf = 0;
        track.getAnimations()[0]?.updatePlaybackRate(1);
      });
    };

    if (flowStage) {
      let flowWasVisible = false;
      const flowObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !flowWasVisible) requestAnimationFrame(boostTechnology);
        flowWasVisible = entry.isIntersecting;
      }, { threshold: .48 });
      flowObserver.observe(flowStage);
      flowStage.addEventListener("pointerenter", cancelTechnologyBoost, { passive: true });
    }

    const finishIntro = () => {
      if (!window.location.hash || window.location.hash === "#home") {
        window.scrollTo(0, 0);
        setScrollPosition(0);
      }
      body.classList.add("ready");
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("motion-booting");
        intro?.remove();
        smoothScroll?.start();
        scrollTriggerEngine?.refresh();
        syncSceneFromViewport(true);
      });
    };

    const playIntro = () => {
      if (!intro || reduceMotion) {
        finishIntro();
        return;
      }
      let hasVisited = false;
      try {
        hasVisited = sessionStorage.getItem("lightframe-intro-seen") === "1";
        sessionStorage.setItem("lightframe-intro-seen", "1");
      } catch (_) {}

      intro.insertAdjacentHTML("afterbegin", `
        <div class="intro-spectrum" aria-hidden="true"></div>
        <div class="intro-grid" aria-hidden="true"></div>
        <div class="intro-particles" aria-hidden="true">${Array.from({ length: 14 }, (_, index) => `<i style="--particle:${index}"></i>`).join("")}</div>
        <div class="intro-code" aria-hidden="true"><span>const message =</span><strong>“일상의 문제를 웹으로 정리합니다”;</strong></div>
        <div class="intro-meter" aria-hidden="true"><i></i></div>
      `);

      if (!gsapEngine) {
        const fallbackLockup = intro.querySelector(".intro-lockup");
        if (fallbackLockup) fallbackLockup.style.opacity = "1";
        intro.querySelectorAll(".intro-code > *").forEach((line) => {
          line.style.opacity = "1";
          line.style.transform = "none";
        });
        window.setTimeout(() => {
          body.classList.add("ready");
          intro.animate(
            [{ opacity: 1, transform: "translate3d(0,0,0)" }, { opacity: 0, transform: "translate3d(0,-5%,0)" }],
            { duration: hasVisited ? 320 : 650, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
          ).finished.then(finishIntro).catch(finishIntro);
        }, hasVisited ? 420 : 1250);
        return;
      }

      const durationScale = hasVisited ? .4 : 1;
      const particles = intro.querySelectorAll(".intro-particles i");
      gsapEngine.set(particles, {
        x: (index) => Math.cos(index / particles.length * Math.PI * 2) * (hasVisited ? 100 : 260),
        y: (index) => Math.sin(index / particles.length * Math.PI * 2) * (hasVisited ? 70 : 190),
        scale: 0,
        opacity: 0
      });
      gsapEngine.timeline({ onComplete: finishIntro })
        .fromTo(".intro-spectrum", { scaleX: .035, scaleY: .18, opacity: .68 }, { scaleX: 1.08, scaleY: 1, opacity: 1, duration: .85 * durationScale, ease: "expo.out" })
        .to(particles, { scale: 1, opacity: .9, x: 0, y: 0, duration: .68 * durationScale, stagger: .018 * durationScale, ease: "power4.in" }, 0)
        .to(particles, {
          x: (index) => Math.cos(index / particles.length * Math.PI * 2) * (hasVisited ? 170 : 560),
          y: (index) => Math.sin(index / particles.length * Math.PI * 2) * (hasVisited ? 100 : 330),
          scale: 0,
          opacity: 0,
          duration: .72 * durationScale,
          ease: "expo.out"
        }, .52 * durationScale)
        .fromTo(".intro-lockup", { opacity: 0, scale: .82 }, { opacity: 1, scale: 1, duration: .72 * durationScale, ease: "expo.out" }, .42 * durationScale)
        .fromTo(".intro-code > *", { opacity: 0, yPercent: 110, rotateX: -35 }, { opacity: 1, yPercent: 0, rotateX: 0, duration: .58 * durationScale, stagger: .08 * durationScale, ease: "power4.out" }, .72 * durationScale)
        .fromTo(".intro-meter i", { scaleX: 0 }, { scaleX: 1, duration: .9 * durationScale, ease: "power2.inOut" }, .68 * durationScale)
        .to(".intro-lockup,.intro-code", { opacity: 0, y: -18, duration: .34 * durationScale, ease: "power3.in" }, hasVisited ? .46 : 1.82)
        .to(intro, { yPercent: -100, duration: .62 * durationScale, ease: "expo.inOut" }, ">-.03");
    };

    playIntro();

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: "0px 0px -4%" });
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

    const principles = document.querySelector(".principles");
    const aboutFrame = document.querySelector("#about");
    const principleRows = [...document.querySelectorAll(".principle")];
    let principleSweepTimers = [];
    const stopPrincipleSweep = () => {
      principleSweepTimers.forEach(clearTimeout);
      principleSweepTimers = [];
      principleRows.forEach((row) => row.classList.remove("is-sweeping"));
    };
    const runPrincipleSweep = () => {
      if (reduceMotion || !principleRows.length) return;
      stopPrincipleSweep();
      principleRows.forEach((row, index) => {
        principleSweepTimers.push(setTimeout(() => {
          if (!row.matches(":hover")) row.classList.add("is-sweeping");
        }, index * 260));
        principleSweepTimers.push(setTimeout(() => row.classList.remove("is-sweeping"), index * 260 + 340));
      });
    };
    if (principles) {
      let principlesWereVisible = false;
      const principleObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !principlesWereVisible) requestAnimationFrame(runPrincipleSweep);
        principlesWereVisible = entry.isIntersecting;
      }, { threshold: .55 });
      principleObserver.observe(aboutFrame || principles);
      principleRows.forEach((row) => {
        row.addEventListener("pointerenter", () => row.classList.remove("is-sweeping"));
      });
    }

    let scrollTicking = false;
    const updateScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.setProperty("--scroll", Math.min(1, Math.max(0, ratio)));
      if (!reduceMotion && hero) {
        const heroProgress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * .92)));
        hero.style.setProperty("--hero-progress", heroProgress.toFixed(4));
      }
      if (!reduceMotion) {
        interestCards.forEach((card, index) => {
          const nextCard = interestCards[index + 1];
          if (!nextCard) {
            card.style.setProperty("--card-scale", "1");
            return;
          }
          const overlap = Math.min(1, Math.max(0, (150 - nextCard.getBoundingClientRect().top) / 170));
          card.style.setProperty("--card-scale", String(1 - overlap * .055));
        });
      }
      scrollTicking = false;
    };
    window.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateScroll);
    }, { passive: true });
    updateScroll();

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      if (flowStage) {
        const flow = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 };
        let flowRaf = 0;
        let flowLastTime = performance.now();
        const scheduleFlow = () => { if (!flowRaf) flowRaf = requestAnimationFrame(renderFlow); };
        flowStage.addEventListener("pointermove", (event) => {
          const rect = flowStage.getBoundingClientRect();
          flow.targetX = ((event.clientX - rect.left) / rect.width - .5) * 26;
          flow.targetY = ((event.clientY - rect.top) / rect.height - .5) * 18;
          scheduleFlow();
        }, { passive: true });
        flowStage.addEventListener("pointerleave", () => { flow.targetX = 0; flow.targetY = 0; scheduleFlow(); });
        const renderFlow = (time) => {
          flowRaf = 0;
          if (motionSuspended) {
            flowLastTime = time;
            scheduleFlow();
            return;
          }
          const frameScale = Math.min(2,Math.max(.35,(time - flowLastTime) / 16.667));
          flowLastTime = time;
          const damping = Math.pow(.74,frameScale);
          flow.vx = (flow.vx + (flow.targetX - flow.x) * .12 * frameScale) * damping;
          flow.vy = (flow.vy + (flow.targetY - flow.y) * .12 * frameScale) * damping;
          flow.x += flow.vx * frameScale;
          flow.y += flow.vy * frameScale;
          flowStage.style.setProperty("--flow-x", flow.x.toFixed(3));
          flowStage.style.setProperty("--flow-y", flow.y.toFixed(3));
          if (Math.abs(flow.targetX - flow.x) > .01 || Math.abs(flow.targetY - flow.y) > .01 || Math.abs(flow.vx) > .01 || Math.abs(flow.vy) > .01) scheduleFlow();
        };
      }

      interestCards.forEach((card) => {
        const tilt = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 };
        let tiltRaf = 0;
        let tiltLastTime = performance.now();
        const scheduleTilt = () => { if (!tiltRaf) tiltRaf = requestAnimationFrame(renderTilt); };
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          tilt.targetX = ((event.clientY - rect.top) / rect.height - .5) * -5;
          tilt.targetY = ((event.clientX - rect.left) / rect.width - .5) * 6;
          scheduleTilt();
        }, { passive: true });
        card.addEventListener("pointerleave", () => { tilt.targetX = 0; tilt.targetY = 0; scheduleTilt(); });
        const renderTilt = (time) => {
          tiltRaf = 0;
          if (motionSuspended) {
            tiltLastTime = time;
            scheduleTilt();
            return;
          }
          const frameScale = Math.min(2,Math.max(.35,(time - tiltLastTime) / 16.667));
          tiltLastTime = time;
          const damping = Math.pow(.7,frameScale);
          tilt.vx = (tilt.vx + (tilt.targetX - tilt.x) * .14 * frameScale) * damping;
          tilt.vy = (tilt.vy + (tilt.targetY - tilt.y) * .14 * frameScale) * damping;
          tilt.x += tilt.vx * frameScale;
          tilt.y += tilt.vy * frameScale;
          card.style.setProperty("--tilt-x", `${tilt.x.toFixed(3)}deg`);
          card.style.setProperty("--tilt-y", `${tilt.y.toFixed(3)}deg`);
          if (Math.abs(tilt.targetX - tilt.x) > .01 || Math.abs(tilt.targetY - tilt.y) > .01 || Math.abs(tilt.vx) > .01 || Math.abs(tilt.vy) > .01) scheduleTilt();
        };
      });

      document.querySelectorAll(".magnetic").forEach((element) => {
        const state = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
        let active = false;
        let magneticRaf = 0;
        let magneticLastTime = performance.now();
        const scheduleMagnetic = () => { if (!magneticRaf) magneticRaf = requestAnimationFrame(renderSpring); };
        element.addEventListener("pointerenter", () => { active = true; scheduleMagnetic(); });
        element.addEventListener("pointermove", (event) => {
          const rect = element.getBoundingClientRect();
          state.tx = (event.clientX - rect.left - rect.width / 2) * .26;
          state.ty = (event.clientY - rect.top - rect.height / 2) * .26;
          scheduleMagnetic();
        });
        element.addEventListener("pointerleave", () => { active = false; state.tx = 0; state.ty = 0; scheduleMagnetic(); });
        const renderSpring = (time) => {
          magneticRaf = 0;
          if (motionSuspended) {
            magneticLastTime = time;
            scheduleMagnetic();
            return;
          }
          const stiffness = active ? .115 : .14;
          const damping = active ? .76 : .72;
          const frameScale = Math.min(2,Math.max(.35,(time - magneticLastTime) / 16.667));
          magneticLastTime = time;
          const scaledDamping = Math.pow(damping,frameScale);
          state.vx = (state.vx + (state.tx - state.x) * stiffness * frameScale) * scaledDamping;
          state.vy = (state.vy + (state.ty - state.y) * stiffness * frameScale) * scaledDamping;
          state.x += state.vx * frameScale;
          state.y += state.vy * frameScale;
          element.style.transform = `translate3d(${state.x}px,${state.y}px,0)`;
          if (Math.abs(state.tx - state.x) > .1 || Math.abs(state.ty - state.y) > .1 || Math.abs(state.vx) > .05 || Math.abs(state.vy) > .05) scheduleMagnetic();
        };
      });
    }

    const frames = [...document.querySelectorAll(".frame")];
    const flowStageIndex = frames.indexOf(flowStage);
    let frameWheelLocked = false;
    let frameTransitionToken = 0;
    let stackScrollTrigger = null;
    const stackScrollBounds = () => {
      if (!flowStage) return null;
      if (stackScrollTrigger) return { start: stackScrollTrigger.start, end: stackScrollTrigger.end };
      const start = flowStage.offsetTop;
      return { start, end: start + flowStage.offsetHeight - window.innerHeight };
    };
    const isInsideStackScroll = (slack = 2) => {
      const bounds = stackScrollBounds();
      return bounds && window.scrollY >= bounds.start - slack && window.scrollY <= bounds.end + slack;
    };
    const nearestFrameIndex = () => {
      if (!reduceMotion && isInsideStackScroll()) return flowStageIndex;
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      frames.forEach((frame, index) => {
        const distance = Math.abs(frame.offsetTop - window.scrollY);
        if (distance >= nearestDistance) return;
        nearestDistance = distance;
        nearestIndex = index;
      });
      return nearestIndex;
    };

    let stackProgressRaf = 0;
    const renderStackProgress = (forcedValue) => {
      stackProgressRaf = 0;
      const bounds = stackScrollBounds();
      if (!bounds || reduceMotion) return;
      const distance = Math.max(1, bounds.end - bounds.start);
      const measuredValue = (window.scrollY - bounds.start) / distance;
      const value = Math.min(1, Math.max(0, Number.isFinite(forcedValue) ? forcedValue : measuredValue));
      const visualProgress = .16 + value * .84;
      const handoffProgress = Math.min(1, Math.max(0, (value - .9) / .1));
      flowStage.style.setProperty("--stack-scroll", value.toFixed(4));
      flowStage.style.setProperty("--stack-progress", visualProgress.toFixed(4));
      flowStage.style.setProperty("--stack-handoff", handoffProgress.toFixed(4));
      flowLanes.forEach((lane, index) => {
        const laneProgress = Math.min(1, Math.max(0, (value + .03 - index * .09) / .56));
        const direction = index % 2 ? 1 : -1;
        const travel = direction * value * (18 + index * 4);
        lane.style.setProperty("--lane-progress", laneProgress.toFixed(4));
        lane.style.setProperty("--track-scroll-x", `${travel.toFixed(3)}vw`);
      });
      flowStage.classList.toggle("is-scrub-active", window.scrollY >= bounds.start - 2 && window.scrollY <= bounds.end + 2);
      document.documentElement.classList.toggle("is-stack-scrubbing", window.scrollY >= bounds.start - 2 && window.scrollY <= bounds.end + 2);
    };
    const queueStackProgress = () => {
      if (stackProgressRaf) return;
      stackProgressRaf = requestAnimationFrame(() => renderStackProgress());
    };
    window.addEventListener("scroll", queueStackProgress, { passive: true });
    window.addEventListener("resize", queueStackProgress, { passive: true });
    if (gsapEngine && scrollTriggerEngine && flowStage && !reduceMotion) {
      gsapEngine.registerPlugin(scrollTriggerEngine);
      stackScrollTrigger = scrollTriggerEngine.create({
        trigger: flowStage,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 4.8)}`,
        pin: flowStage,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => renderStackProgress(self.progress),
        onRefresh: (self) => renderStackProgress(self.progress)
      });
      window.addEventListener("load", () => scrollTriggerEngine.refresh(), { once: true });
      document.fonts?.ready.then(() => scrollTriggerEngine.refresh());
      requestAnimationFrame(() => {
        scrollTriggerEngine.refresh();
        const hashTarget = window.location.hash && document.querySelector(window.location.hash);
        if (!hashTarget) return;
        const targetTop = hashTarget === flowStage ? stackScrollTrigger.start : hashTarget.offsetTop;
        setScrollPosition(targetTop);
        if (hashTarget === flowStage) renderStackProgress(0);
      });
    }
    requestAnimationFrame(() => renderStackProgress());

    const sceneSelectors = new Map([
      ["hero", ".hero-meta,.code-label,.hero-title .line,.scroll-cue,.hero-description"],
      ["about", ".section-label,.statement-side,.statement-copy,.principle"],
      ["now", ".section-label,.now-title,.interest"],
      ["stack-section", ".section-label,.stack-heading h2,.flow-field,.flow-note"],
      ["contact", ".section-label,.contact-title,.contact-copy,.magnetic,.footer-line"]
    ]);

    const createSceneSpringFrames = (offset, noScale) => {
      const keyframes = [];
      let position = 0;
      let velocity = 0;
      const samples = 30;
      for (let index = 0; index < samples; index += 1) {
        if (index > 0) {
          velocity = (velocity + (1 - position) * .055) * .7;
          position = Math.min(1,position + velocity);
        }
        const scale = noScale ? 1 : .995 + position * .005;
        keyframes.push({
          offset: index / (samples - 1),
          opacity: Math.min(1,position * 1.12),
          transform: `translate3d(0,${(offset * (1 - position)).toFixed(3)}px,0) scale(${scale.toFixed(5)})`
        });
      }
      keyframes[keyframes.length - 1] = { offset: 1, opacity: 1, transform: "translate3d(0,0,0) scale(1)" };
      return keyframes;
    };

    const createTextFlowFrames = (direction, index) => {
      const sway = index % 2 ? .022 : -.022;
      return [
        { opacity: 0, filter: "blur(9px)", transform: `translate3d(${sway}em,${direction * .34}em,0) scale(.975,.93)` },
        { offset: .56, opacity: .94, filter: "blur(1.8px)", transform: `translate3d(${(sway * -.3).toFixed(3)}em,${direction * -.035}em,0) scale(1.006,1.018)` },
        { offset: .8, opacity: 1, filter: "blur(0px)", transform: `translate3d(0,${direction * .008}em,0) scale(.999,1)` },
        { opacity: 1, filter: "blur(0px)", transform: "translate3d(0,0,0) scale(1)" }
      ];
    };

    const createBodyTextFrames = (direction) => [
      { opacity: 0, filter: "blur(4px)", transform: `translate3d(0,${direction * 10}px,0)` },
      { offset: .72, opacity: 1, filter: "blur(0px)", transform: `translate3d(0,${direction * -1}px,0)` },
      { opacity: 1, filter: "blur(0px)", transform: "translate3d(0,0,0)" }
    ];

    let activeSceneTimeline = null;
    let heroIdleTimeline = null;
    const animateScene = (frame, direction = 1) => {
      if (!frame) return;
      siteHeader?.classList.toggle("is-on-light", frame === flowStage);
      const sceneKey = [...sceneSelectors.keys()].find((key) => frame.classList.contains(key));
      const selector = sceneSelectors.get(sceneKey);
      if (!selector) return;
      const items = [...frame.querySelectorAll(selector)];
      if (gsapEngine) {
        heroIdleTimeline?.kill();
        heroIdleTimeline = null;
        activeSceneTimeline?.kill();
        gsapEngine.killTweensOf([...items, ...frame.querySelectorAll(".flow-word,.stack-pill")]);
        items.forEach((item) => item.classList.add("is-visible"));
        if (reduceMotion) {
          gsapEngine.set(items, { clearProps: "all" });
          return;
        }

        const timeline = gsapEngine.timeline({
          defaults: { ease: "power4.out" },
          onComplete: () => {
            items.forEach((item) => item.style.removeProperty("will-change"));
          }
        });
        activeSceneTimeline = timeline;
        const noDepth = window.matchMedia("(max-width: 720px)").matches;
        items.forEach((item) => { item.style.willChange = "transform, opacity, filter"; });

        if (sceneKey === "hero") {
          const titleLines = [...frame.querySelectorAll(".hero-title .line")];
          const titleCharacters = titleLines.map((line) => [...line.querySelectorAll(".char")]);
          const beatStage = frame.querySelector(".hero-beat-stage");
          const beatWash = frame.querySelector(".hero-beat-wash");
          const beatStatus = frame.querySelector(".hero-beat-status");
          const beatTicks = [...frame.querySelectorAll(".hero-beat-ticks i")];
          const beatLines = [...frame.querySelectorAll(".hero-beat-line")];
          const beatIndexParts = [...frame.querySelectorAll(".hero-beat-index span")];
          const descriptionWords = [...frame.querySelectorAll(".hero-description .flow-word")];

          gsapEngine.set(items, { opacity: 1, clearProps: "filter" });
          gsapEngine.set(siteHeader, { opacity: 0, y: -28, scaleX: .94, transformOrigin: "50% 0%" });
          gsapEngine.set(frame.querySelector(".hero-meta"), { opacity: 0, y: -18 });
          gsapEngine.set(frame.querySelector(".code-label"), { opacity: 0, x: -34 });
          gsapEngine.set(titleLines[0], { opacity: 0, xPercent: -9, yPercent: -34 });
          gsapEngine.set(titleLines[1], { opacity: 0, xPercent: 9, yPercent: 34 });
          gsapEngine.set(titleCharacters.flat(), { opacity: 0, yPercent: 112, rotateX: noDepth ? 0 : -36, filter: "blur(7px)", transformPerspective: 900 });
          gsapEngine.set(frame.querySelector(".hero-bottom"), { opacity: 0, y: 26 });
          gsapEngine.set(descriptionWords, { opacity: 0, yPercent: 75 });
          gsapEngine.set(beatIndexParts, { opacity: 0, yPercent: 120 });
          gsapEngine.set(beatStatus, { opacity: 0, y: 12 });
          gsapEngine.set(beatTicks, { opacity: 0, scaleX: 0, transformOrigin: "left center" });

          timeline
            .set(beatWash, { yPercent: 0 })
            .set(beatStage, { opacity: 1 })
            .to(beatStatus, { opacity: 1, y: 0, duration: .15, ease: "power3.out" }, 0)
            .to(beatTicks, { opacity: 1, scaleX: 1, duration: .11, stagger: .022, ease: "power2.out" }, .03)
            .to(beatStatus, { opacity: 0, y: -10, duration: .12, ease: "power3.in" }, .2)
            .to(beatWash, { yPercent: -102, duration: .32, ease: "expo.inOut" }, .19)
            .to(siteHeader, { opacity: 1, y: 0, scaleX: 1, duration: .34, ease: "expo.out", clearProps: "transform,opacity" }, .3)
            .to(frame.querySelector(".hero-meta"), { opacity: 1, y: 0, duration: .28, ease: "power4.out", clearProps: "transform,opacity" }, .37)
            .to(frame.querySelector(".code-label"), { opacity: 1, x: 0, duration: .3, ease: "expo.out", clearProps: "transform,opacity" }, .42)
            .to(beatLines, { scaleX: 1, duration: .34, stagger: .055, ease: "expo.inOut" }, .42)
            .to(titleLines, { opacity: 1, xPercent: 0, yPercent: 0, duration: .42, stagger: .075, ease: "expo.out", clearProps: "transform,opacity" }, .47)
            .to(titleCharacters[0], { opacity: 1, yPercent: 0, rotateX: 0, filter: "blur(0px)", duration: .38, stagger: .018, ease: "power4.out", clearProps: "transform,filter,opacity" }, .5)
            .to(titleCharacters[1], { opacity: 1, yPercent: 0, rotateX: 0, filter: "blur(0px)", duration: .38, stagger: .016, ease: "power4.out", clearProps: "transform,filter,opacity" }, .6)
            .to(beatIndexParts, { opacity: 1, yPercent: 0, duration: .24, stagger: .045, ease: "power4.out" }, .7)
            .to(frame.querySelector(".hero-bottom"), { opacity: 1, y: 0, duration: .34, ease: "expo.out", clearProps: "transform,opacity" }, .8)
            .to(descriptionWords, { opacity: 1, yPercent: 0, duration: .28, stagger: .014, ease: "power4.out", clearProps: "transform,opacity" }, .84)
            .to(beatLines, { opacity: .2, scaleX: .18, duration: .28, stagger: .035, ease: "power3.inOut" }, 1)
            .to(beatIndexParts, { opacity: .42, duration: .2 }, 1.04);

          timeline.eventCallback("onComplete", () => {
            items.forEach((item) => item.style.removeProperty("will-change"));
            titleCharacters.flat().forEach((character) => {
              character.style.removeProperty("will-change");
              character.style.removeProperty("filter");
            });
            frame.classList.add("is-assembled");
            heroIdleTimeline = gsapEngine.timeline({ repeat: -1, repeatDelay: .45, delay: .28 })
              .to(titleLines[0], { x: -14, duration: .42, ease: "power3.inOut" }, 0)
              .to(titleLines[1], { x: 14, duration: .42, ease: "power3.inOut" }, 0)
              .to(titleCharacters.flat(), {
                y: (index) => index % 3 === 0 ? -7 : index % 3 === 1 ? 4 : -2,
                opacity: (index) => index % 4 === 0 ? .62 : 1,
                duration: .24,
                stagger: { each: .014, from: "start" },
                ease: "power2.out"
              }, .48)
              .to(titleCharacters.flat(), { y: 0, opacity: 1, duration: .34, stagger: { each: .01, from: "end" }, ease: "power3.out" }, .76)
              .to(titleLines, { x: 0, duration: .52, ease: "expo.out" }, .92)
              .to(frame.querySelector(".hero-meta"), { x: 9, duration: .24, ease: "power2.out" }, 1.08)
              .to(frame.querySelector(".hero-meta"), { x: 0, duration: .34, ease: "expo.out" }, 1.32);
          });
          return;
        }

        const isEditorialScene = sceneKey === "about" || sceneKey === "now";
        if (isEditorialScene) {
          const textGroups = items
            .map((item) => [...item.querySelectorAll(".flow-word")])
            .filter((group) => group.length);
          const animatedWords = textGroups.flat();
          const surfaces = items.filter((item) => item.matches(".principle,.interest"));

          animatedWords.forEach((word) => {
            word.style.willChange = "transform, opacity, filter";
          });
          gsapEngine.set(items, { opacity: 1, clearProps: "transform,filter" });
          gsapEngine.set(animatedWords, {
            opacity: 0,
            yPercent: direction * 78,
            rotateX: noDepth ? 0 : direction * -28,
            skewY: direction * 1.5,
            transformPerspective: 800,
            filter: "blur(5px)"
          });

          if (surfaces.length) {
            timeline.fromTo(surfaces,
              { opacity: 0, y: direction * 24, scale: .992 },
              { opacity: 1, y: 0, scale: 1, duration: .46, stagger: .075, clearProps: "transform" },
              .03
            );
          }

          textGroups.forEach((words, groupIndex) => {
            timeline.to(words,
              {
                opacity: 1,
                yPercent: 0,
                rotateX: 0,
                skewY: 0,
                filter: "blur(0px)",
                duration: .54,
                stagger: Math.min(.026, .28 / Math.max(1, words.length)),
                clearProps: "transform,filter"
              },
              .055 + groupIndex * .082
            );
          });

          timeline.eventCallback("onComplete", () => {
            items.forEach((item) => item.style.removeProperty("will-change"));
            animatedWords.forEach((word) => word.style.removeProperty("will-change"));
          });
          return;
        }

        timeline.fromTo(items,
          {
            opacity: 0,
            y: (index) => direction * Math.min(44, 22 + index * 5),
            scale: .985,
            rotateX: noDepth ? 0 : direction * -7,
            transformPerspective: 900,
            filter: "blur(8px)"
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: frame === flowStage ? .48 : .76,
            stagger: frame === flowStage ? .03 : .055,
            clearProps: "transform,filter"
          }, 0
        );

        const words = [...frame.querySelectorAll(".flow-word")].slice(0, 42);
        if (words.length) {
          timeline.fromTo(words,
            { opacity: 0, yPercent: direction * 115, rotateX: direction * -42, skewY: direction * 3, filter: "blur(7px)" },
            { opacity: 1, yPercent: 0, rotateX: 0, skewY: 0, filter: "blur(0px)", duration: .64, stagger: .022, clearProps: "transform,filter" },
            .08
          );
        }

        if (frame === flowStage) {
          const pills = [...frame.querySelectorAll(".stack-pill")];
          timeline.fromTo(pills,
            {
              opacity: 0,
              x: (index) => (index % 2 ? 1 : -1) * Math.min(110, 42 + (index % 7) * 10),
              y: (index) => ((index % 3) - 1) * 20,
              scale: .86,
              rotate: (index) => ((index % 5) - 2) * 2
            },
            { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: .44, stagger: { each: .006, from: "center" }, ease: "expo.out", clearProps: "transform,opacity" },
            .04
          );
        }
        return;
      }
      frame.querySelectorAll(".is-springing").forEach((item) => {
        item._sceneAnimation?.cancel();
        item._sceneAnimation = null;
        item.classList.remove("is-springing");
        item.style.removeProperty("opacity");
        item.style.removeProperty("filter");
        item.style.removeProperty("transform");
        item.style.removeProperty("will-change");
      });
      items.forEach((item) => item.classList.add("is-springing","is-visible"));
      if (reduceMotion) {
        items.forEach((item) => item.classList.remove("is-springing"));
        return;
      }

      const sceneToken = Symbol("scene");
      frame._sceneToken = sceneToken;
      items.forEach((item, index) => {
        const offset = direction * Math.min(32, 18 + index * 4);
        const noScale = item.classList.contains("principle") || item.classList.contains("interest");
        item.style.willChange = "transform,opacity";
        const animation = item.animate(createSceneSpringFrames(offset,noScale),{
          duration: 480,
          delay: index * 24,
          easing: "linear",
          fill: "both"
        });
        item._sceneAnimation = animation;
        animation.finished.then(() => {
          if (frame._sceneToken !== sceneToken) return;
          animation.cancel();
          item._sceneAnimation = null;
          item.style.removeProperty("will-change");
          item.classList.remove("is-springing");
        }).catch(() => {});

        const flowWords = [
          ...(item.matches(".flow-word") ? [item] : []),
          ...item.querySelectorAll(".flow-word")
        ];
        flowWords.forEach((word, wordIndex) => {
          word.getAnimations().forEach((wordAnimation) => wordAnimation.cancel());
          word.style.willChange = "transform, opacity, filter";
          const wordAnimation = word.animate(createTextFlowFrames(direction, wordIndex),{
            duration: 600,
            delay: 62 + index * 34 + Math.min(wordIndex,28) * 20,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "both"
          });
          wordAnimation.finished.then(() => {
            if (word.getAnimations().includes(wordAnimation)) wordAnimation.cancel();
            word.style.removeProperty("will-change");
          }).catch(() => word.style.removeProperty("will-change"));
        });

        const driftingText = [
          ...(item.matches(".text-drift") ? [item] : []),
          ...item.querySelectorAll(".text-drift")
        ].filter((text) => !text.querySelector(".flow-word"));
        driftingText.forEach((text, textIndex) => {
          text.getAnimations().forEach((textAnimation) => textAnimation.cancel());
          text.style.willChange = "transform, opacity, filter";
          const textAnimation = text.animate(createBodyTextFrames(direction),{
            duration: 540,
            delay: index * 22 + textIndex * 42 + 90,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "both"
          });
          textAnimation.finished.then(() => {
            if (text.getAnimations().includes(textAnimation)) textAnimation.cancel();
            text.style.removeProperty("will-change");
          }).catch(() => text.style.removeProperty("will-change"));
        });
      });
    };

    // Native trackpad scrolling can bypass the wheel transition. Keep scene
    // activation tied to the frame actually occupying the viewport so every
    // frame entry receives the same text motion, regardless of input method.
    let activeFrameIndex = -1;
    const activateFrameScene = (index, direction = 1, force = false) => {
      const frame = frames[index];
      if (!frame || (!force && index === activeFrameIndex)) return;
      const previousIndex = activeFrameIndex;
      activeFrameIndex = index;
      frames.forEach((candidate, candidateIndex) => candidate.classList.toggle("is-scene-active", candidateIndex === index));
      const resolvedDirection = direction || (previousIndex < 0 ? 1 : Math.sign(index - previousIndex) || 1);
      animateScene(frame, resolvedDirection);
      if (frame === flowStage) requestAnimationFrame(boostTechnology);
    };

    const syncSceneFromViewport = (force = false) => {
      const nextIndex = nearestFrameIndex();
      const direction = activeFrameIndex < 0 ? 1 : Math.sign(nextIndex - activeFrameIndex) || 1;
      activateFrameScene(nextIndex, direction, force);
    };

    let sceneSyncRaf = 0;
    let lastObservedScrollY = window.scrollY;
    let stackTraversalGuard = false;
    const guardStackTraversal = () => {
      if (stackTraversalGuard || reduceMotion) {
        lastObservedScrollY = window.scrollY;
        return false;
      }
      const bounds = stackScrollBounds();
      if (!bounds) {
        lastObservedScrollY = window.scrollY;
        return false;
      }
      const currentY = window.scrollY;
      let guardedY = null;
      if (lastObservedScrollY < bounds.start - 2 && currentY > bounds.end + 2) {
        guardedY = bounds.start;
      } else if (lastObservedScrollY > bounds.end + 2 && currentY < bounds.start - 2) {
        guardedY = bounds.end;
      } else if (lastObservedScrollY >= bounds.start - 2 && lastObservedScrollY < bounds.end - 2 && currentY > bounds.end + 2) {
        guardedY = Math.min(bounds.end - 2, lastObservedScrollY + window.innerHeight * .34);
      } else if (lastObservedScrollY <= bounds.end + 2 && lastObservedScrollY > bounds.start + 2 && currentY < bounds.start - 2) {
        guardedY = Math.max(bounds.start + 2, lastObservedScrollY - window.innerHeight * .34);
      }
      if (guardedY === null) {
        lastObservedScrollY = currentY;
        return false;
      }
      stackTraversalGuard = true;
      lastObservedScrollY = guardedY;
      setScrollPosition(guardedY);
      renderStackProgress();
      requestAnimationFrame(() => { stackTraversalGuard = false; });
      return true;
    };
    const queueSceneSync = () => {
      if (sceneSyncRaf || frameWheelLocked) return;
      sceneSyncRaf = requestAnimationFrame(() => {
        sceneSyncRaf = 0;
        if (!frameWheelLocked) syncSceneFromViewport();
      });
    };
    window.addEventListener("scroll", () => {
      if (!guardStackTraversal()) queueSceneSync();
    }, { passive: true });

    const alignFrame = (index) => {
      const frame = frames[index];
      if (!frame) return;
      const top = frame === flowStage && stackScrollTrigger ? stackScrollTrigger.start : frame.offsetTop;
      setScrollPosition(top);
    };

    let wheelAccumulator = 0;
    let wheelInputReady = true;
    let lastWheelAt = 0;
    let wheelReleaseToken = 0;
    const releaseWheelInput = () => {
      const token = ++wheelReleaseToken;
      const startedAt = performance.now();
      const waitForRest = () => {
        if (token !== wheelReleaseToken) return;
        const now = performance.now();
        if (now - lastWheelAt >= 160 || now - startedAt >= 600) {
          wheelAccumulator = 0;
          wheelInputReady = true;
          return;
        }
        requestAnimationFrame(waitForRest);
      };
      requestAnimationFrame(waitForRest);
    };

    const goToFrame = (targetIndex, direction, gestureVelocity = 0) => {
      const target = frames[targetIndex];
      if (!target) return;
      frameTransitionToken += 1;
      const token = frameTransitionToken;

      if (reduceMotion || !frameFlash) {
        alignFrame(targetIndex);
        activateFrameScene(targetIndex, direction, true);
        if (!wheelInputReady) releaseWheelInput();
        return;
      }

      frameWheelLocked = true;
      motionSuspended = true;
      body.classList.add("is-transitioning");
      frameFlash.style.setProperty("--flash-color", target.dataset.frameColor || "#0066ff");
      frameFlash.style.setProperty("--flash-ink", target.dataset.frameInk || "#ffffff");
      frameFlashName.textContent = target.dataset.frameName || "Lightframe.";
      frameFlashIndex.textContent = `${String(targetIndex + 1).padStart(2,"0")} / ${String(frames.length).padStart(2,"0")}`;
      frameFlash.style.opacity = "1";
      frameFlash.style.transform = `translate3d(0,${direction > 0 ? 110 : -110}%,0)`;

      const axis = direction > 0 ? 1 : -1;
      let phase = "cover";
      let position = 0;
      let velocity = Math.min(.012, Math.abs(gestureVelocity) / 22000);
      let holdStartedAt = 0;
      let transitionLastTime = performance.now();
      const renderTransition = (time) => {
        if (token !== frameTransitionToken) return;
        frameFlash.style.opacity = "1";
        const frameScale = Math.min(2,Math.max(.35,(time - transitionLastTime) / 16.667));
        transitionLastTime = time;

        if (phase === "cover") {
          velocity = (velocity + (1 - position) * .08 * frameScale) * Math.pow(.65,frameScale);
          position = Math.min(1, position + velocity * frameScale);
          frameFlash.style.transform = `translate3d(0,${(axis * 110 * (1 - position)).toFixed(3)}%,0)`;
          if (position < .995) {
            requestAnimationFrame(renderTransition);
            return;
          }
          frameFlash.style.transform = "translate3d(0,0,0)";
          alignFrame(targetIndex);
          phase = "hold";
          holdStartedAt = time;
          position = 0;
          velocity = 0;
          requestAnimationFrame(renderTransition);
          return;
        }

        if (phase === "hold") {
          frameFlash.style.transform = "translate3d(0,0,0)";
          if (time - holdStartedAt < 100) {
            requestAnimationFrame(renderTransition);
            return;
          }
          phase = "reveal";
          position = 0;
          velocity = 0;
          transitionLastTime = time;
          activateFrameScene(targetIndex, direction, true);
          requestAnimationFrame(renderTransition);
          return;
        }

        velocity = (velocity + (1 - position) * .065 * frameScale) * Math.pow(.68,frameScale);
        position = Math.min(1, position + velocity * frameScale);
        frameFlash.style.transform = `translate3d(0,${(-axis * 110 * position).toFixed(3)}%,0)`;
        if (position < .995) {
          requestAnimationFrame(renderTransition);
          return;
        }
        alignFrame(targetIndex);
        frameFlash.style.opacity = "0";
        frameFlash.style.transform = `translate3d(0,${direction > 0 ? -110 : 110}%,0)`;
        motionSuspended = false;
        body.classList.remove("is-transitioning");
        frameWheelLocked = false;
        if (!wheelInputReady) releaseWheelInput();
      };
      requestAnimationFrame(renderTransition);
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        const targetIndex = frames.indexOf(target);
        if (targetIndex < 0) return;
        event.preventDefault();
        const currentIndex = nearestFrameIndex();
        if (targetIndex === currentIndex) return alignFrame(targetIndex);
        if (frameWheelLocked) return;
        goToFrame(targetIndex, Math.sign(targetIndex - currentIndex), 0);
      });
    });

    // Keep wheel scrolling native. ScrollTrigger uses the browser scroll position as
    // its single source of truth, so Chrome trackpad momentum remains reversible and
    // cannot be misread as a request to skip directly to the next full-screen frame.
    window.addEventListener("wheel", () => {
      lastWheelAt = performance.now();
      wheelAccumulator = 0;
      wheelInputReady = true;
    }, { passive: true });

    window.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return;
      const down = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
      const up = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
      if (!down && !up) return;
      const stackBounds = stackScrollBounds();
      if (!reduceMotion && stackBounds && isInsideStackScroll(3)) {
        const canMoveInside = (down && window.scrollY < stackBounds.end - 2) || (up && window.scrollY > stackBounds.start + 2);
        if (canMoveInside) {
          event.preventDefault();
          setScrollPosition(window.scrollY + (down ? 1 : -1) * window.innerHeight * .16, false);
          return;
        }
      }
      event.preventDefault();
      if (frameWheelLocked) return;
      const currentIndex = nearestFrameIndex();
      const direction = down ? 1 : -1;
      const nextIndex = Math.min(frames.length - 1, Math.max(0, currentIndex + direction));
      if (nextIndex !== currentIndex) goToFrame(nextIndex, direction, 0);
    });

    window.addEventListener("scrollend", () => {
      if (!frameWheelLocked) queueSceneSync();
    }, { passive: true });

    window.addEventListener("resize", () => {
      if (!frameWheelLocked) {
        if (stackScrollTrigger) stackScrollTrigger.refresh();
        queueSceneSync();
      }
    }, { passive: true });

    if (reduceMotion) requestAnimationFrame(() => syncSceneFromViewport(true));
