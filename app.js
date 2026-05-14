// ─────────────────────────────────────────────────────────────
// TriOrbit Group — interactivity
// Lang toggle · sticky-nav state · multi-step inquiry · scroll reveals
// ─────────────────────────────────────────────────────────────
(() => {

  // ── Language ─────────────────────────────────────────────
  const detectInitialLang = () => {
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
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (btnSubmit.disabled) return;

    // No backend; surface success state. Hook your endpoint here.
    // Example payload: console.log("inquiry payload", data);

    steps.forEach((s) => s.classList.remove("is-active"));
    if (progressBlock) progressBlock.style.display = "none";
    if (actionsBlock) actionsBlock.style.display = "none";
    successEl.classList.add("is-active");
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
    renderStep();
  });

  renderStep();
})();
