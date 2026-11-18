/* =========================================================
   Reyvann — Interaksi Portofolio (Vanilla JS)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const backToTop = document.getElementById("backToTop");
  const contactForm = document.getElementById("contactForm");
  const modal = document.getElementById("successModal");
  const modalClose = document.getElementById("modalClose");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Menu navigasi mobile ---------- */
  const tutupMenu = () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Buka menu navigasi");
    navToggle.innerHTML = '<i class="bi bi-list"></i>';
  };

  navToggle.addEventListener("click", () => {
    const sedangBuka = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(sedangBuka));
    navToggle.setAttribute("aria-label", sedangBuka ? "Tutup menu navigasi" : "Buka menu navigasi");
    navToggle.innerHTML = sedangBuka
      ? '<i class="bi bi-x-lg"></i>'
      : '<i class="bi bi-list"></i>';
  });

  document.addEventListener("click", (event) => {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      tutupMenu();
    }
  });

  /* ---------- 2. Smooth scrolling semua tautan anchor ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      tutupMenu();

      // replaceState bisa gagal saat dibuka lewat file:// (origin null).
      try {
        history.replaceState(null, "", targetId);
      } catch (error) {
        // Diabaikan; scroll tetap berjalan normal.
      }
    });
  });

  /* ---------- 3. Bayangan header & tombol kembali ke atas ---------- */
  const tanganiScroll = () => {
    const posisi = window.scrollY || window.pageYOffset;
    header.classList.toggle("scrolled", posisi > 30);
    backToTop.classList.toggle("show", posisi > 600);
  };

  window.addEventListener("scroll", tanganiScroll, { passive: true });
  tanganiScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- 4. Menu aktif mengikuti section ---------- */
  if ("IntersectionObserver" in window) {
    const pengamatNavigasi = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => pengamatNavigasi.observe(section));
  }

  /* ---------- 5. Efek muncul saat di-scroll ---------- */
  const elemenReveal = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const pengamatReveal = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elemenReveal.forEach((el) => pengamatReveal.observe(el));
  } else {
    elemenReveal.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 6. Animasi angka ---------- */
  const angka = document.querySelectorAll("[data-target]");

  const animasikanAngka = (el) => {
    const target = Number(el.dataset.target) || 0;
    const durasi = 1400;
    const mulai = performance.now();

    const perbarui = (waktu) => {
      const progres = Math.min((waktu - mulai) / durasi, 1);
      const easing = 1 - Math.pow(1 - progres, 3);
      el.textContent = String(Math.round(target * easing));
      if (progres < 1) requestAnimationFrame(perbarui);
    };

    requestAnimationFrame(perbarui);
  };

  if ("IntersectionObserver" in window && !reduceMotion) {
    const pengamatAngka = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animasikanAngka(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    angka.forEach((el) => pengamatAngka.observe(el));
  } else {
    angka.forEach((el) => (el.textContent = el.dataset.target));
  }

  /* ---------- 7. Validasi form & pop-up sukses ---------- */
  const aturanValidasi = {
    nama: (nilai) => nilai.trim().length >= 2,
    email: (nilai) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nilai.trim()),
    pesan: (nilai) => nilai.trim().length >= 10,
  };

  const validasiField = (field) => {
    const aturan = aturanValidasi[field.name];
    if (!aturan) return true;

    const grup = field.closest(".form-group");
    const valid = aturan(field.value);
    grup.classList.toggle("invalid", !valid);
    field.setAttribute("aria-invalid", String(!valid));
    return valid;
  };

  Object.keys(aturanValidasi).forEach((nama) => {
    const field = contactForm.elements[nama];
    if (!field) return;

    field.addEventListener("blur", () => validasiField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-group").classList.contains("invalid")) {
        validasiField(field);
      }
    });
  });

  let elemenTerakhirFokus = null;

  const bukaModal = () => {
    elemenTerakhirFokus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose.focus();
  };

  const tutupModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (elemenTerakhirFokus) elemenTerakhirFokus.focus();
  };

  modalClose.addEventListener("click", tutupModal);
  modal.querySelector("[data-close-modal]").addEventListener("click", tutupModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) tutupModal();

    if (event.key === "Tab" && modal.classList.contains("open")) {
      event.preventDefault();
      modalClose.focus();
    }
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = Object.keys(aturanValidasi)
      .map((nama) => contactForm.elements[nama])
      .filter(Boolean);

    const semuaValid = fields.map(validasiField).every(Boolean);

    if (!semuaValid) {
      const pertamaInvalid = contactForm.querySelector(
        ".form-group.invalid input, .form-group.invalid textarea"
      );
      if (pertamaInvalid) pertamaInvalid.focus();
      return;
    }

    const tombol = contactForm.querySelector('button[type="submit"]');
    const label = tombol.querySelector(".btn-label");
    tombol.disabled = true;
    label.textContent = "Mengirim...";

    // Simulasi pengiriman untuk demo (tanpa backend).
    window.setTimeout(() => {
      tombol.disabled = false;
      label.textContent = "Kirim Pesan";
      contactForm.reset();
      bukaModal();
    }, 700);
  });
});
