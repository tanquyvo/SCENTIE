/* =====================================================
   SCENTIE — ABOUT / IMMERSIVE TECH ART INTERACTIONS
   Page-scoped: no shared header, footer or shop behavior.
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".about-page");
    if (!page) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = page.querySelectorAll(
        ".about-story, .about-philosophy, .about-different, .about-promise, .about-cta"
    );

    revealTargets.forEach(section => section.classList.add("about-reveal"));
    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach(section => section.classList.add("about-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("about-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
        revealTargets.forEach(section => revealObserver.observe(section));
    }

    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const hero = page.querySelector(".about-hero");
    const universe = page.querySelector(".about-product-universe");
    if (hero && universe) {
        hero.addEventListener("pointermove", event => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            universe.style.setProperty("--pointer-x", `${x.toFixed(3)}`);
            universe.style.setProperty("--pointer-y", `${y.toFixed(3)}`);
            universe.style.transform = `translate(${x * 15}px, calc(-50% + ${y * 13}px))`;
            universe.querySelectorAll(".about-product-float").forEach((product, index) => {
                const depth = (index + 1) * 5;
                product.style.translate = `${x * depth}px ${y * depth}px`;
            });
        });
        hero.addEventListener("pointerleave", () => {
            universe.style.transform = "translateY(-50%)";
            universe.querySelectorAll(".about-product-float").forEach(product => product.style.translate = "0 0");
        });
    }

    page.querySelectorAll(".about-value-card, .about-story-visual, .about-different-product-stage").forEach(card => {
        card.addEventListener("pointermove", event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            card.style.setProperty("--pointer-x", `${x}px`);
            card.style.setProperty("--pointer-y", `${y}px`);
            if (card.classList.contains("about-value-card")) {
                const rotateY = ((x / rect.width) - 0.5) * 7;
                const rotateX = (0.5 - (y / rect.height)) * 7;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            }
        });
        card.addEventListener("pointerleave", () => {
            if (card.classList.contains("about-value-card")) card.style.transform = "";
            card.style.setProperty("--pointer-x", "50%");
            card.style.setProperty("--pointer-y", "50%");
        });
    });

    // Gentle scroll-linked depth on the product gallery; no layout measurements are changed.
    const gallery = page.querySelector(".about-story-visual");
    if (gallery && "IntersectionObserver" in window) {
        const galleryObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                gallery.classList.add("gallery-in-view");
                galleryObserver.unobserve(gallery);
            });
        }, { threshold: 0.25 });
        galleryObserver.observe(gallery);
    }
});
