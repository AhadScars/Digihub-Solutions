(function () {
  "use strict";

  const cfg = window.DIGIHUB_CONFIG || {};
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const yearEl = document.getElementById("year");
  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Support / contact displays
  document.querySelectorAll("[data-support-hours]").forEach((el) => {
    el.textContent = cfg.supportHours || "Mon–Sat, 10:00 AM – 7:00 PM IST";
  });
  document.querySelectorAll("[data-support-note]").forEach((el) => {
    el.textContent = cfg.supportNote || "";
  });
  document.querySelectorAll("[data-whatsapp-display]").forEach((el) => {
    el.textContent = cfg.whatsappDisplay || "";
  });
  document.querySelectorAll("[data-email-display]").forEach((el) => {
    el.textContent = cfg.email || "";
    if (el.tagName === "A") el.href = "mailto:" + (cfg.email || "");
  });

  // Stats
  if (cfg.stats) {
    document.querySelectorAll("[data-stat]").forEach((el) => {
      const key = el.getAttribute("data-stat");
      if (cfg.stats[key] != null) el.textContent = cfg.stats[key];
    });
  }

  // WhatsApp
  const waNumber = (cfg.whatsapp || "").replace(/\D/g, "");
  const waDefaultMsg = encodeURIComponent(
    "Hi DigiHub, I want to start a free trial for your POS software."
  );
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${waDefaultMsg}`
    : "contact.html";

  document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
    el.href = waUrl;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  // Sticky header
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    const bar = document.querySelector(".trial-bar");
    if (bar) bar.classList.toggle("is-visible", window.scrollY > 420);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Active nav
  const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const page = path === "" ? "index.html" : path;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = (link.getAttribute("data-nav") || "").toLowerCase();
    if (!target) return;
    const targets = target.split(",").map((t) => t.trim());
    if (targets.includes(page)) {
      link.classList.add("is-active");
      const parent = link.closest(".nav-dropdown");
      if (parent) {
        const trigger = parent.querySelector(":scope > a");
        if (trigger) trigger.classList.add("is-active");
      }
    }
  });

  // Mobile nav
  const closeNav = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.querySelectorAll(".nav-dropdown.open").forEach((d) => d.classList.remove("open"));
  };
  const openNav = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  };
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      if (navMenu.classList.contains("open")) closeNav();
      else openNav();
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        const dropdown = link.closest(".nav-dropdown");
        if (
          dropdown &&
          link === dropdown.querySelector(":scope > a") &&
          window.matchMedia("(max-width: 720px)").matches
        ) {
          e.preventDefault();
          dropdown.classList.toggle("open");
          return;
        }
        closeNav();
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Prefill business
  if (form && form.business) {
    const params = new URLSearchParams(window.location.search);
    const product = (params.get("product") || "").toLowerCase();
    if (["pharmacy", "restaurant", "hotel"].includes(product)) {
      form.business.value = product;
    }
  }

  // Contact form
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = ((form.name && form.name.value) || "").trim();
      const email = ((form.email && form.email.value) || "").trim();
      const business = ((form.business && form.business.value) || "").trim();
      const message = ((form.message && form.message.value) || "").trim();
      if (!name || !email || !business) {
        if (formNote) formNote.textContent = "Please fill in name, email, and business type.";
        return;
      }
      if (waNumber) {
        const text = encodeURIComponent(
          ["Hi DigiHub,", `Name: ${name}`, `Email: ${email}`, `Business: ${business}`, message || ""]
            .filter(Boolean)
            .join("\n")
        );
        window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank", "noopener,noreferrer");
        if (formNote) formNote.textContent = "Opening WhatsApp…";
        return;
      }
      const subject = encodeURIComponent(`DigiHub inquiry — ${business} — ${name}`);
      const body = encodeURIComponent(
        [`Name: ${name}`, `Email: ${email}`, `Business: ${business}`, "", message || ""].join("\n")
      );
      window.location.href = `mailto:${cfg.email || "hello@digihub.solutions"}?subject=${subject}&body=${body}`;
    });
  }

  // Screenshot tabs
  document.querySelectorAll(".shot-tabs").forEach((tabs) => {
    const root = tabs.closest("section") || document;
    tabs.querySelectorAll(".shot-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-shot");
        tabs.querySelectorAll(".shot-tab").forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        root.querySelectorAll("[data-shot-panel]").forEach((panel) => {
          panel.classList.toggle("active", panel.getAttribute("data-shot-panel") === id);
        });
      });
    });
  });

  // FAQ accordion
  document.querySelectorAll(".faq-acc").forEach((acc) => {
    acc.querySelectorAll(".faq-acc-item").forEach((item) => {
      const btn = item.querySelector(".faq-acc-btn");
      const panel = item.querySelector(".faq-acc-panel");
      if (!btn || !panel) return;
      btn.addEventListener("click", () => {
        const open = item.classList.contains("open");
        acc.querySelectorAll(".faq-acc-item.open").forEach((other) => {
          if (other !== item) {
            other.classList.remove("open");
            const b = other.querySelector(".faq-acc-btn");
            const p = other.querySelector(".faq-acc-panel");
            if (b) b.setAttribute("aria-expanded", "false");
            if (p) p.hidden = true;
          }
        });
        item.classList.toggle("open", !open);
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
      });
    });
  });

  // Currency
  const currencies = cfg.currencies || {};
  let currency =
    localStorage.getItem("digihub_currency") || cfg.defaultCurrency || "INR";
  if (!currencies[currency]) currency = "INR";

  function formatMoney(inrAmount, code) {
    const c = currencies[code] || currencies.INR;
    const val = inrAmount * (c.rate || 1);
    const rounded = code === "INR" ? Math.round(val) : Math.round(val * 100) / 100;
    if (code === "INR") return c.symbol + rounded.toLocaleString("en-IN");
    return c.symbol + rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function applyCurrency(code) {
    currency = code;
    localStorage.setItem("digihub_currency", code);
    const monthly = cfg.priceMonthlyInr || 399;
    const yearly = cfg.priceYearlyInr || 3999;
    const monthlyYear = monthly * 12;
    const save = monthlyYear - yearly;

    document.querySelectorAll("[data-price='monthly']").forEach((el) => {
      el.textContent = formatMoney(monthly, code);
    });
    document.querySelectorAll("[data-price='yearly']").forEach((el) => {
      el.textContent = formatMoney(yearly, code);
    });
    document.querySelectorAll("[data-price='monthly12']").forEach((el) => {
      el.textContent = formatMoney(monthlyYear, code);
    });
    document.querySelectorAll("[data-price='save']").forEach((el) => {
      el.textContent = formatMoney(save, code);
    });
    document.querySelectorAll("[data-currency-code]").forEach((el) => {
      el.textContent = code;
    });
    document.querySelectorAll(".currency-select").forEach((sel) => {
      if (sel.value !== code) sel.value = code;
    });
    updateCalculator();
  }

  document.querySelectorAll(".currency-select").forEach((sel) => {
    Object.keys(currencies).forEach((code) => {
      if (![...sel.options].some((o) => o.value === code)) {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = currencies[code].label || code;
        sel.appendChild(opt);
      }
    });
    sel.value = currency;
    sel.addEventListener("change", () => applyCurrency(sel.value));
  });

  // Pricing calculator
  function updateCalculator() {
    const appsEl = document.getElementById("calcApps");
    const yearsEl = document.getElementById("calcYears");
    if (!appsEl || !yearsEl) return;
    const apps = Math.max(1, parseInt(appsEl.value, 10) || 1);
    const years = Math.max(1, parseInt(yearsEl.value, 10) || 1);
    const monthly = (cfg.priceMonthlyInr || 399) * apps * years * 12;
    const yearly = (cfg.priceYearlyInr || 3999) * apps * years;
    const save = monthly - yearly;
    const set = (id, inr) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatMoney(inr, currency);
    };
    set("calcMonthlyTotal", monthly);
    set("calcYearlyTotal", yearly);
    set("calcSaveTotal", save);
    const pctEl = document.getElementById("calcSavePct");
    if (pctEl && monthly > 0) {
      pctEl.textContent = Math.round((save / monthly) * 100) + "%";
    }
  }

  const appsEl = document.getElementById("calcApps");
  const yearsEl = document.getElementById("calcYears");
  if (appsEl) appsEl.addEventListener("input", updateCalculator);
  if (yearsEl) yearsEl.addEventListener("input", updateCalculator);

  // Count-up stats
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.done) return;
          el.dataset.done = "1";
          const target = parseFloat(el.getAttribute("data-count-to"));
          const suffix = el.getAttribute("data-count-suffix") || "";
          const prefix = el.getAttribute("data-count-prefix") || "";
          const isFloat = String(target).includes(".");
          const dur = 1200;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent =
              prefix +
              (isFloat ? val.toFixed(1) : Math.round(val).toLocaleString("en-IN")) +
              suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );
    counters.forEach((el) => io.observe(el));
  }

  // Trial bar dismiss
  const trialBar = document.querySelector(".trial-bar");
  const dismiss = document.querySelector(".trial-bar-dismiss");
  if (dismiss && trialBar) {
    if (sessionStorage.getItem("digihub_trial_bar") === "hide") {
      trialBar.classList.add("is-hidden");
    }
    dismiss.addEventListener("click", () => {
      trialBar.classList.add("is-hidden");
      sessionStorage.setItem("digihub_trial_bar", "hide");
    });
  }

  applyCurrency(currency);
})();
