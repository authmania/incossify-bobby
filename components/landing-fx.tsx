"use client";

import { useEffect } from "react";

export function LandingFx({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const header = document.getElementById("siteHeader");
    const onScroll = () => {
      if (!header) return;
      header.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));

    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const target = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || "";
        const dur = 1600;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = (Math.round(target * (1 - Math.pow(1 - p, 3)))).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      cio.disconnect();
    };
  }, []);

  return <>{children}</>;
}

export function MobileMenuToggle() {
  return (
    <button
      className="btn btn-ghost btn-sm mobile-menu"
      onClick={() => {
        const menu = document.getElementById("mobileMenu");
        menu?.classList.toggle("site-menu-open");
      }}
      aria-label="Menu"
    >
      ☰
    </button>
  );
}
