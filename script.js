    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;
    const intro = document.querySelector(".intro-screen");
    const progress = document.querySelector(".progress");
    const hero = document.querySelector(".hero");
    const interestCards = [...document.querySelectorAll(".interest")];
    const flowStage = document.querySelector("[data-flow-stage]");
    const frameFlash = document.querySelector(".frame-flash");
    const frameFlashName = document.querySelector(".frame-flash-name");
    const frameFlashIndex = document.querySelector(".frame-flash-index");
    let motionSuspended = false;

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

    const flowTracks = [...document.querySelectorAll("[data-flow-track]")];
    flowTracks.forEach((track) => track.insertAdjacentHTML("beforeend", track.innerHTML));

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

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".stack-pill").forEach((pill) => {
        pill.addEventListener("pointermove", (event) => {
          const rect = pill.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          pill.style.setProperty("--pill-x", `${(x * 5).toFixed(2)}px`);
          pill.style.setProperty("--pill-y", `${(-7 + y * 3).toFixed(2)}px`);
          pill.style.setProperty("--pill-rx", `${(-y * 4).toFixed(2)}deg`);
          pill.style.setProperty("--pill-ry", `${(x * 5).toFixed(2)}deg`);
        }, { passive: true });
        pill.addEventListener("pointerleave", () => {
          pill.style.setProperty("--pill-x", "0px");
          pill.style.setProperty("--pill-y", "0px");
          pill.style.setProperty("--pill-rx", "0deg");
          pill.style.setProperty("--pill-ry", "0deg");
        }, { passive: true });
      });
    }

    if (reduceMotion) {
      body.classList.add("ready");
      intro?.remove();
    } else {
      window.setTimeout(() => {
        body.classList.add("ready");
        intro.animate(
          [{ opacity: 1, filter: "blur(0px)", transform: "scaleY(1)" }, { opacity: 0, filter: "blur(10px)", transform: "scaleY(.94)" }],
          { duration: 720, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
        ).finished.then(() => intro.remove());
      }, 900);
    }

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
      principles.addEventListener("pointerleave", runPrincipleSweep);
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
    let frameWheelLocked = false;
    let frameTransitionToken = 0;
    const nearestFrameIndex = () => {
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

    const sceneSelectors = new Map([
      ["hero", ".hero-meta,.code-label,.hero-title .line,.hero-bottom"],
      ["about", ".section-label,.statement-side,.statement-copy,.principles"],
      ["now", ".section-label,.now-title,.interest-list"],
      ["stack-section", ".section-label,.stack-heading h2,.flow-field,.flow-note"],
      ["contact", ".section-label,.contact-title,.contact-bottom,.footer-line"]
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

    const animateScene = (frame, direction = 1) => {
      if (!frame) return;
      const sceneKey = [...sceneSelectors.keys()].find((key) => frame.classList.contains(key));
      const selector = sceneSelectors.get(sceneKey);
      if (!selector) return;
      const items = [...frame.querySelectorAll(selector)];
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
        const noScale = item.classList.contains("principles");
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
      });
    };

    const alignFrame = (index) => {
      const frame = frames[index];
      if (!frame) return;
      window.scrollTo({ top: frame.offsetTop, behavior: "auto" });
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
        animateScene(target, direction);
        if (!wheelInputReady) releaseWheelInput();
        return;
      }

      frameWheelLocked = true;
      motionSuspended = true;
      body.classList.add("is-transitioning");
      frameFlash.style.setProperty("--flash-color", target.dataset.frameColor || "#0066ff");
      frameFlash.style.setProperty("--flash-ink", target.dataset.frameInk || "#ffffff");
      frameFlashName.textContent = target.dataset.frameName || "LIGHTFRAME";
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
          animateScene(target, direction);
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

    window.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      lastWheelAt = now;
      if (frameWheelLocked || !wheelInputReady || !frames.length) {
        wheelAccumulator = 0;
        return;
      }
      wheelAccumulator += event.deltaY;
      if (Math.abs(wheelAccumulator) < 12) return;
      const wheelDirection = Math.sign(wheelAccumulator);
      const wheelVelocity = wheelAccumulator;
      wheelAccumulator = 0;
      const currentIndex = nearestFrameIndex();
      const nextIndex = Math.min(frames.length - 1, Math.max(0, currentIndex + wheelDirection));
      if (nextIndex === currentIndex) return;
      wheelInputReady = false;
      goToFrame(nextIndex, wheelDirection, wheelVelocity);
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return;
      const down = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
      const up = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
      if (!down && !up) return;
      event.preventDefault();
      if (frameWheelLocked) return;
      const currentIndex = nearestFrameIndex();
      const direction = down ? 1 : -1;
      const nextIndex = Math.min(frames.length - 1, Math.max(0, currentIndex + direction));
      if (nextIndex !== currentIndex) goToFrame(nextIndex, direction, 0);
    });

    window.addEventListener("scrollend", () => {
      if (!frameWheelLocked) alignFrame(nearestFrameIndex());
    }, { passive: true });

    window.addEventListener("resize", () => {
      if (!frameWheelLocked) alignFrame(nearestFrameIndex());
    }, { passive: true });
