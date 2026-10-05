"use strict";

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

function setMenuOpen(open) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});
mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});

const gallery = document.querySelector(".styles-grid");
const galleryFilters = document.querySelectorAll(".gallery-filter");
const galleryCards = [...document.querySelectorAll(".style-tile")];
const galleryCount = document.querySelector(".gallery-count");

galleryFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    galleryFilters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    let visible = 0;
    galleryCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    gallery?.classList.toggle("is-filtered", filter !== "all");
    if (galleryCount) galleryCount.textContent = `${visible} ${visible === 1 ? "фотография" : "фотографии"}`;
    window.ScrollTrigger?.refresh();

    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(galleryCards.filter((card) => !card.hidden),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.07, ease: "power2.out", overwrite: "auto" });
    }
  });
});

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();

  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .from(".site-header", { autoAlpha: 0, y: -12, duration: 0.5 })
      .from(".hero-copy .overline", { autoAlpha: 0, y: 14, duration: 0.45 }, "-=0.16")
      .from(".hero h1 span", { autoAlpha: 0, y: 34, duration: 0.62, stagger: 0.12 }, "-=0.12")
      .from(".hero-description, .hero-copy .button", { autoAlpha: 0, y: 14, duration: 0.42, stagger: 0.08 }, "-=0.18");

    gsap.utils.toArray(".process-step, .style-tile, .statement blockquote, .faq-list, .booking-copy, .booking-form").forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        y: 22,
        duration: 0.68,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 87%", once: true },
      });
    });

    gsap.to(".hero-photo", {
      yPercent: 5,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      galleryCards.forEach((card) => {
        const image = card.querySelector("img");
        if (!image) return;
        const xTo = gsap.quickTo(image, "x", { duration: 0.35, ease: "power3.out" });
        const yTo = gsap.quickTo(image, "y", { duration: 0.35, ease: "power3.out" });

        card.addEventListener("pointerenter", () => { image.style.willChange = "transform"; });
        card.addEventListener("pointermove", (event) => {
          if (event.pointerType !== "mouse") return;
          const bounds = card.getBoundingClientRect();
          xTo(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
          yTo(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
        });
        card.addEventListener("pointerleave", () => {
          xTo(0);
          yTo(0);
          image.style.willChange = "auto";
        });
      });
    }

    return () => {
      entrance.kill();
      gsap.killTweensOf(".hero-photo");
    };
  });
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");

galleryCards.forEach((card) => {
  const openButton = card.querySelector(".tile-open");
  const photo = card.querySelector("img");
  if (!openButton || !photo || !lightbox || !lightboxImage || !lightboxCaption) return;

  openButton.addEventListener("click", () => {
    lightboxImage.src = photo.currentSrc || photo.src;
    lightboxImage.alt = photo.alt;
    lightboxCaption.textContent = card.querySelector("h3")?.textContent ?? "Татуировка";
    lightbox.showModal();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.gsap) {
      gsap.fromTo(lightboxImage, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out" });
    }
  });
});

lightboxClose?.addEventListener("click", () => lightbox?.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const form = document.querySelector("#booking-form");
const status = document.querySelector("#form-status");
const fields = form?.querySelectorAll("input[required], textarea[required]");

function setFieldError(field, message = "") {
  const error = document.getElementById(`${field.id}-error`);
  if (message) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
  if (error) {
    error.hidden = !message;
    error.textContent = message;
  }
}

fields?.forEach((field) => {
  field.addEventListener("input", () => {
    setFieldError(field);
    if (status) status.textContent = "";
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form || !status) return;

  const honeypot = form.querySelector('input[name="website"]');
  if (honeypot?.value) {
    status.textContent = "Не удалось отправить форму. Обнови страницу и попробуй ещё раз.";
    return;
  }

  const invalid = [...(fields ?? [])].filter((field) => !field.checkValidity());
  if (invalid.length) {
    invalid.forEach((field) => {
      const messages = {
        "client-name": "Напиши имя длиной от 2 до 80 знаков.",
        contact: "Добавь телефон или ник в Telegram.",
        idea: "Опиши, какую татуировку хочется сделать.",
      };
      setFieldError(field, messages[field.id] ?? "Проверь это поле.");
    });
    status.textContent = "Исправь поля с подсказками, затем отправь заявку.";
    invalid[0].focus();
    return;
  }

  const contact = form.elements.namedItem("contact");
  if (contact && !/[+@a-z\d][+@a-z\d .()_-]{3,78}/i.test(contact.value.trim())) {
    setFieldError(contact, "Укажи телефон или имя пользователя в Telegram.");
    status.textContent = "Исправь поле с подсказкой, затем отправь заявку.";
    contact.focus();
    return;
  }

  status.textContent = "Форма заполнена. Подключи канал приёма заявок, чтобы передать её мастеру.";
});
