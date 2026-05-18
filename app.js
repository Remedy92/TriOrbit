// ─────────────────────────────────────────────────────────────
// TriOrbit Group — interactivity
// Lang toggle · sticky-nav state · multi-step inquiry · scroll reveals
// ─────────────────────────────────────────────────────────────
(() => {

  // ── Language ─────────────────────────────────────────────
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

    // Swap text on any element that carries data-bg / data-en
    document.querySelectorAll("[data-bg][data-en]").forEach((el) => {
      const next = el.getAttribute("data-" + lang);
      if (next != null && el.textContent !== next) el.textContent = next;
    });

    // Swap placeholder text on inputs/textareas
    document.querySelectorAll("[data-bg-placeholder][data-en-placeholder]").forEach((el) => {
      const next = el.getAttribute("data-" + lang + "-placeholder");
      if (next != null) el.setAttribute("placeholder", next);
    });

    // Swap selected button values on the form (keeps stored data in sync)
    document.querySelectorAll(".choice.is-selected, .pill.is-selected").forEach((btn) => {
      const v = btn.getAttribute("data-value-" + (lang === "en" ? "en" : ""));
      // For bg, the canonical value is data-value; for en, data-value-en (fallback to data-value)
      const display = lang === "en" ? btn.getAttribute("data-value-en") : btn.getAttribute("data-value");
      if (display) btn.dataset.displayValue = display;
    });

    // Toggle button active state
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

  // ── Sticky nav scroll state ───────────────────────────────
  const nav = document.getElementById("site-nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── Mobile burger menu ────────────────────────────────────
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
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("is-visible"));
  }

  // ── Inquiry form ──────────────────────────────────────────
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  const steps = form.querySelectorAll(".inquiry-step");
  const stepCurrentEl = document.getElementById("step-current");
  const progressFill = document.getElementById("progress-fill");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  const btnSubmit = document.getElementById("btn-submit");
  const successEl = document.getElementById("inquiry-success");
  const btnReset = document.getElementById("btn-reset");
  const progressBlock = form.querySelector(".inquiry-progress");
  const actionsBlock = form.querySelector(".inquiry-actions");
  const TOTAL = 3;

  const data = {
    service: "",
    propertyType: "",
    size: "",
    when: "",
    notes: "",
    name: "",
    phone: "",
    email: "",
    consent: false,
    company: "", // honeypot
  };

  const errorEl = document.getElementById("inquiry-error");
  const submitLabel = document.getElementById("btn-submit-label");
  const submitLabelOriginal = {
    bg: submitLabel ? submitLabel.getAttribute("data-bg") : "Изпрати заявка",
    en: submitLabel ? submitLabel.getAttribute("data-en") : "Send request",
  };
  const setSubmitLabel = (bg, en) => {
    if (!submitLabel) return;
    submitLabel.setAttribute("data-bg", bg);
    submitLabel.setAttribute("data-en", en);
    submitLabel.textContent = currentLang === "en" ? en : bg;
  };
  const showError = (bg, en) => {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.setAttribute("data-bg", bg);
    errorEl.setAttribute("data-en", en);
    errorEl.textContent = currentLang === "en" ? en : bg;
  };
  const clearError = () => {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = "";
  };

  let step = 0;

  const renderStep = () => {
    steps.forEach((s) => {
      const n = Number(s.getAttribute("data-step"));
      s.classList.toggle("is-active", n === step);
    });
    if (stepCurrentEl) stepCurrentEl.textContent = String(step + 1);
    if (progressFill) progressFill.style.width = ((step + 1) / TOTAL) * 100 + "%";

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
    const canNext0 = !!data.service;
    const canNext1 = !!data.propertyType && !!data.when;
    const canSubmit = !!data.name && (!!data.phone || !!data.email) && !!data.consent;

    if (step === 0) btnNext.disabled = !canNext0;
    else if (step === 1) btnNext.disabled = !canNext1;

    btnSubmit.disabled = !canSubmit;
  };

  // Choice grid (radio, step 0)
  form.querySelectorAll('.choice-grid[data-field="service"] .choice').forEach((btn) => {
    btn.addEventListener("click", () => {
      form.querySelectorAll('.choice-grid[data-field="service"] .choice').forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      data.service = btn.getAttribute("data-value");
      updateActionState();
    });
  });

  // Pills (radio, step 1)
  form.querySelectorAll('.choice-pills[data-field="propertyType"] .pill').forEach((btn) => {
    btn.addEventListener("click", () => {
      form.querySelectorAll('.choice-pills[data-field="propertyType"] .pill').forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      data.propertyType = btn.getAttribute("data-value");
      updateActionState();
    });
  });

  // Inputs
  form.querySelectorAll("input, textarea, select").forEach((el) => {
    const name = el.getAttribute("name");
    if (!name) return;
    const evt = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(evt, () => {
      data[name] = el.type === "checkbox" ? el.checked : el.value;
      updateActionState();
    });
  });

  // Navigation buttons
  btnNext.addEventListener("click", () => {
    if (step < TOTAL - 1) {
      step += 1;
      renderStep();
    }
  });
  btnBack.addEventListener("click", () => {
    if (step > 0) {
      step -= 1;
      renderStep();
    }
  });

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btnSubmit.disabled) return;

    clearError();
    btnSubmit.disabled = true;
    setSubmitLabel("Изпращане…", "Sending…");

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
        setSubmitLabel(submitLabelOriginal.bg, submitLabelOriginal.en);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

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
      setSubmitLabel(submitLabelOriginal.bg, submitLabelOriginal.en);
    }
  });

  // Reset
  btnReset.addEventListener("click", () => {
    step = 0;
    Object.keys(data).forEach((k) => { data[k] = typeof data[k] === "boolean" ? false : ""; });
    form.reset();
    form.querySelectorAll(".choice.is-selected, .pill.is-selected").forEach((b) => b.classList.remove("is-selected"));
    successEl.classList.remove("is-active");
    if (progressBlock) progressBlock.style.display = "";
    if (actionsBlock) actionsBlock.style.display = "";
    clearError();
    setSubmitLabel(submitLabelOriginal.bg, submitLabelOriginal.en);
    renderStep();
  });

  renderStep();
})();

// ─────────────────────────────────────────────────────────────
// Coverage map — interactive Bulgaria
// Sticky selection synced between SVG nodes and the city list.
// ─────────────────────────────────────────────────────────────
(() => {
  const wrap = document.querySelector(".coverage-map-wrap");
  if (!wrap) return;

  const nodes = [...wrap.querySelectorAll(".map-node")];
  const links = [...wrap.querySelectorAll(".map-link")];
  const btns = [...wrap.querySelectorAll(".map-citybtn")];
  const roCity = wrap.querySelector("#ro-city");
  const roRegion = wrap.querySelector("#ro-region");
  const roNote = wrap.querySelector("#ro-note");
  if (!roCity || !roRegion || !roNote) return;

  const lang = () =>
    document.documentElement.getAttribute("lang") === "en" ? "en" : "bg";

  const NOTE = {
    bg: (c) => `Обслужваме ${c} и областта. Без такса за пътуване · крайни цени и срокове след оглед на обекта.`,
    en: (c) => `We cover ${c} and the surrounding area. No travel surcharge · final pricing and timing after a site visit.`,
  };
  const BASE_NOTE = {
    bg: "Седалище на TriOrbit Group. Без такса за пътуване — отговор на запитване до 1 час.",
    en: "TriOrbit Group's home base. No travel surcharge — inquiry response within 1 hour.",
  };

  const setText = (el, bg, en) => {
    el.setAttribute("data-bg", bg);
    el.setAttribute("data-en", en);
    el.textContent = lang() === "en" ? en : bg;
  };

  let current = "lovech";

  const select = (key) => {
    const btn = btns.find((b) => b.dataset.city === key);
    if (!btn) return;
    current = key;

    nodes.forEach((n) => n.classList.toggle("is-active", n.dataset.city === key));
    links.forEach((l) => l.classList.toggle("is-active", l.dataset.city === key));
    btns.forEach((b) => {
      const on = b.dataset.city === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    const nameEl = btn.querySelector(".cb-name");
    const nameBg = nameEl.getAttribute("data-bg");
    const nameEn = nameEl.getAttribute("data-en");

    setText(roCity, nameBg, nameEn);
    setText(roRegion, btn.dataset.regionBg, btn.dataset.regionEn);
    if (key === "lovech") {
      setText(roNote, BASE_NOTE.bg, BASE_NOTE.en);
    } else {
      setText(roNote, NOTE.bg(nameBg), NOTE.en(nameEn));
    }
  };

  btns.forEach((b) => {
    const k = b.dataset.city;
    b.addEventListener("click", () => select(k));
    b.addEventListener("mouseenter", () => select(k));
    b.addEventListener("focus", () => select(k));
  });

  nodes.forEach((n) => {
    const k = n.dataset.city;
    n.addEventListener("mouseenter", () => select(k));
    n.addEventListener("click", () => {
      const btn = btns.find((b) => b.dataset.city === k);
      if (btn) btn.focus();
      else select(k);
    });
  });

  // Re-render the active readout after a language switch so the
  // templated note picks up the localized city name.
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.addEventListener("click", () => setTimeout(() => select(current), 0));
  });

  select("lovech");
})();
