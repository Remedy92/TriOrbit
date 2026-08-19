// ─────────────────────────────────────────────────────────────
// TriOrbit Group — interactivity
// Language toggle · sticky nav · mobile menu · scroll reveals · inquiry form
// ─────────────────────────────────────────────────────────────
(() => {

  // ── Language ──────────────────────────────────────────────
  const detectInitialLang = () => {
    try {
      const param = new URLSearchParams(location.search).get("lang");
      if (param === "bg" || param === "en") return param;
    } catch (_) {}
    try {
      const stored = localStorage.getItem("triorbit-lang");
      if (stored === "bg" || stored === "en") return stored;
    } catch (_) {}
    return "bg";
  };

  const applyLang = (lang) => {
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-bg][data-en]").forEach((el) => {
      const next = el.getAttribute("data-" + lang);
      if (next != null && el.textContent !== next) el.textContent = next;
    });

    document.querySelectorAll("[data-bg-placeholder][data-en-placeholder]").forEach((el) => {
      const next = el.getAttribute("data-" + lang + "-placeholder");
      if (next != null) el.setAttribute("placeholder", next);
    });

    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });

    try { localStorage.setItem("triorbit-lang", lang); } catch (_) {}
  };

  let currentLang = detectInitialLang();
  applyLang(currentLang);
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.addEventListener("click", () => {
      currentLang = b.getAttribute("data-lang");
      applyLang(currentLang);
    });
  });

  // ── Sticky nav shadow ─────────────────────────────────────
  const nav = document.getElementById("site-nav");
  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── Mobile menu ───────────────────────────────────────────
  const burger = document.getElementById("nav-burger");
  const mobile = document.getElementById("nav-mobile");
  if (burger && mobile) {
    burger.addEventListener("click", () => {
      const open = mobile.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobile.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ── Scroll reveal ─────────────────────────────────────────
  const reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveal.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("is-visible"));
  }

  // ── Inquiry form ──────────────────────────────────────────
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  const steps = form.querySelectorAll(".fstep");
  const stepCurrentEl = document.getElementById("step-current");
  const stepNameEl = document.getElementById("step-name");
  const progressBar = document.getElementById("progress-bar");
  const progressBlock = document.getElementById("form-progress");
  const actionsBlock = document.getElementById("form-actions");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  const btnSubmit = document.getElementById("btn-submit");
  const submitLabel = document.getElementById("btn-submit-label");
  const successEl = document.getElementById("inquiry-success");
  const btnReset = document.getElementById("btn-reset");
  const errorEl = document.getElementById("inquiry-error");
  const TOTAL = 3;

  const STEP_NAMES = [
    { bg: "услуга", en: "service" },
    { bg: "обект", en: "site" },
    { bg: "контакт", en: "contact" },
  ];

  const data = {
    service: "", propertyType: "", size: "", when: "", notes: "",
    name: "", phone: "", email: "", consent: false, company: "",
  };

  const submitLabelOriginal = {
    bg: submitLabel ? submitLabel.getAttribute("data-bg") : "Изпратете заявката",
    en: submitLabel ? submitLabel.getAttribute("data-en") : "Send the request",
  };
  const setText = (el, bg, en) => {
    if (!el) return;
    el.setAttribute("data-bg", bg);
    el.setAttribute("data-en", en);
    el.textContent = currentLang === "en" ? en : bg;
  };
  const showError = (bg, en) => {
    if (!errorEl) return;
    errorEl.hidden = false;
    setText(errorEl, bg, en);
  };
  const clearError = () => {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = "";
  };

  let step = 0;

  const renderStep = () => {
    steps.forEach((s) => {
      s.classList.toggle("is-active", Number(s.getAttribute("data-step")) === step);
    });
    if (stepCurrentEl) stepCurrentEl.textContent = String(step + 1);
    setText(stepNameEl, STEP_NAMES[step].bg, STEP_NAMES[step].en);
    if (progressBar) {
      [...progressBar.children].forEach((seg, i) => seg.classList.toggle("is-done", i <= step));
    }
    if (btnBack) btnBack.style.visibility = step > 0 ? "visible" : "hidden";
    if (step < TOTAL - 1) {
      btnNext.style.display = "";
      btnSubmit.style.display = "none";
    } else {
      btnNext.style.display = "none";
      btnSubmit.style.display = "";
    }
    updateActionState();
  };

  const updateActionState = () => {
    if (step === 0) btnNext.disabled = !data.service;
    else if (step === 1) btnNext.disabled = !(data.propertyType && data.when);
    btnSubmit.disabled = !(data.name && (data.phone || data.email) && data.consent);
  };

  const wireChoices = (selector, field) => {
    const buttons = form.querySelectorAll(selector);
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        data[field] = btn.getAttribute("data-value");
        updateActionState();
      });
    });
  };
  wireChoices('.choice-grid[data-field="service"] .choice', "service");
  wireChoices('.choice-pills[data-field="propertyType"] .pill', "propertyType");

  form.querySelectorAll("input, textarea, select").forEach((el) => {
    const name = el.getAttribute("name");
    if (!name) return;
    const evt = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(evt, () => {
      data[name] = el.type === "checkbox" ? el.checked : el.value;
      updateActionState();
    });
  });

  btnNext.addEventListener("click", () => {
    if (step < TOTAL - 1) { step += 1; renderStep(); }
  });
  btnBack.addEventListener("click", () => {
    if (step > 0) { step -= 1; renderStep(); }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btnSubmit.disabled) return;

    clearError();
    btnSubmit.disabled = true;
    setText(submitLabel, "Изпращане…", "Sending…");

    try {
      const honeypot = form.querySelector('input[name="company"]');
      const payload = { ...data, company: honeypot ? honeypot.value : "" };

      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        showError(
          "Изпратихте няколко заявки наскоро. Моля, опитайте отново след малко или ни пишете на triorbit.group@gmail.com.",
          "You've sent several requests recently. Please try again in a few minutes, or email us at triorbit.group@gmail.com."
        );
        btnSubmit.disabled = false;
        setText(submitLabel, submitLabelOriginal.bg, submitLabelOriginal.en);
        return;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);

      steps.forEach((s) => s.classList.remove("is-active"));
      if (progressBlock) progressBlock.style.display = "none";
      if (actionsBlock) actionsBlock.style.display = "none";
      successEl.classList.add("is-active");
    } catch (err) {
      console.error("Inquiry submit failed", err);
      showError(
        "Заявката не можа да бъде изпратена. Моля, опитайте отново или ни пишете директно на triorbit.group@gmail.com.",
        "We couldn't send your request. Please try again, or email us directly at triorbit.group@gmail.com."
      );
      btnSubmit.disabled = false;
      setText(submitLabel, submitLabelOriginal.bg, submitLabelOriginal.en);
    }
  });

  btnReset.addEventListener("click", () => {
    step = 0;
    Object.keys(data).forEach((k) => { data[k] = typeof data[k] === "boolean" ? false : ""; });
    form.reset();
    form.querySelectorAll(".choice.is-selected").forEach((b) => b.classList.remove("is-selected"));
    successEl.classList.remove("is-active");
    if (progressBlock) progressBlock.style.display = "";
    if (actionsBlock) actionsBlock.style.display = "";
    clearError();
    setText(submitLabel, submitLabelOriginal.bg, submitLabelOriginal.en);
    renderStep();
  });

  renderStep();
})();

/* ── Before / after wipe ──────────────────────────────────────── */
(() => {
  const hero = document.getElementById("top");
  const wipe = document.getElementById("wipe");
  const knob = document.getElementById("wipe-knob");
  const range = document.getElementById("wipe-range");
  if (!hero || !wipe || !knob || !range) return;

  const set = (pct) => {
    const v = Math.min(100, Math.max(0, pct));
    hero.style.setProperty("--x", v + "%");
    range.value = String(Math.round(v));
  };

  const fromEvent = (e) => {
    const r = wipe.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };

  let dragging = false;
  const stopDemo = () => hero.classList.remove("is-demo");

  knob.addEventListener("pointerdown", (e) => {
    dragging = true;
    stopDemo();
    knob.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  knob.addEventListener("pointermove", (e) => { if (dragging) set(fromEvent(e)); });
  knob.addEventListener("pointerup", () => { dragging = false; });
  knob.addEventListener("pointercancel", () => { dragging = false; });

  wipe.addEventListener("pointerdown", (e) => {
    if (e.target === knob || knob.contains(e.target)) return;
    stopDemo();
    set(fromEvent(e));
  });

  knob.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft") { stopDemo(); set(Number(range.value) - step); e.preventDefault(); }
    if (e.key === "ArrowRight") { stopDemo(); set(Number(range.value) + step); e.preventDefault(); }
  });
  range.addEventListener("input", () => { stopDemo(); set(Number(range.value)); });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  set(reduced ? 50 : 96);
  if (!reduced) {
    hero.classList.add("is-demo");
    setTimeout(() => set(38), 700);
    setTimeout(() => { if (!dragging) set(52); }, 2500);
  }
})();

/* ── Section index + nav highlight ────────────────────────────── */
(() => {
  const ids = ["services", "report", "process", "coverage", "pricing", "inquiry", "contact"];
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  const rail = document.querySelectorAll("#idx-rail a");
  const links = document.querySelectorAll(".nav-link");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const mark = (id) => {
    rail.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + id));
    links.forEach((a) => a.classList.toggle("is-here", a.getAttribute("href") === "#" + id));
  };

  const io = new IntersectionObserver((entries) => {
    const hit = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (hit) mark(hit.target.id);
  }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] });

  sections.forEach((s) => io.observe(s));
})();
