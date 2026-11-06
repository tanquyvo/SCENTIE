
/* =========================================================
   SCENTIE — HOMEPAGE INTERACTIVE 3D EFFECTS
   Homepage only
   ========================================================= */

(() => {
    "use strict";

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const isMobile = window.matchMedia(
        "(max-width: 767px)"
    ).matches;

    /* ---------- 1. HERO PRODUCT INTERACTION ---------- */

    const heroVisual = document.querySelector(".hero-visual");

    if (heroVisual && !reducedMotion) {
        const products = heroVisual.querySelectorAll(
            ".hero-product-focus, " +
            ".hero-product-energy, " +
            ".hero-product-calm, " +
            ".hero-product-date, " +
            ".hero-product-fun"
        );

        const resetHero = () => {
            heroVisual.classList.remove("has-active");

            products.forEach((product) => {
                product.classList.remove("is-active");
                product.style.removeProperty("--sc-tilt-x");
                product.style.removeProperty("--sc-tilt-y");
            });
        };

        products.forEach((product) => {
            product.addEventListener("pointerenter", () => {
                if (isMobile) return;

                heroVisual.classList.add("has-active");

                products.forEach((item) => {
                    item.classList.toggle("is-active", item === product);
                });
            });

            product.addEventListener("pointermove", (event) => {
                if (isMobile || event.pointerType === "touch") return;

                const rect = product.getBoundingClientRect();

                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;

                const tiltY = (x - 0.5) * 18;
                const tiltX = (0.5 - y) * 18;

                product.style.setProperty(
                    "--sc-tilt-x",
                    `${tiltX.toFixed(2)}deg`
                );

                product.style.setProperty(
                    "--sc-tilt-y",
                    `${tiltY.toFixed(2)}deg`
                );
            });

            product.addEventListener("pointerleave", () => {
                product.style.removeProperty("--sc-tilt-x");
                product.style.removeProperty("--sc-tilt-y");

                if (!isMobile) {
                    resetHero();
                }
            });

            /* Touch fallback: tap to focus one product */
            product.addEventListener("click", () => {
                if (!isMobile) return;

                const wasActive = product.classList.contains("is-active");

                products.forEach((item) => {
                    item.classList.remove("is-active");
                });

                if (wasActive) {
                    heroVisual.classList.remove("has-active");
                } else {
                    heroVisual.classList.add("has-active");
                    product.classList.add("is-active");
                }
            });
        });

        heroVisual.addEventListener("pointerleave", () => {
            if (!isMobile) resetHero();
        });
    }

    /* ---------- 2. CURSOR TILT + GLARE ---------- */

    if (!reducedMotion && !isMobile) {
        const tiltElements = document.querySelectorAll(
            ".mood-card, .step-card, .contact-form-wrapper"
        );

        tiltElements.forEach((element) => {
            element.addEventListener("pointermove", (event) => {
                const rect = element.getBoundingClientRect();

                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;

                const tiltY = (x - 0.5) * 9;
                const tiltX = (0.5 - y) * 9;

                element.style.setProperty(
                    "--sc-card-tilt-x",
                    `${tiltX.toFixed(2)}deg`
                );

                element.style.setProperty(
                    "--sc-card-tilt-y",
                    `${tiltY.toFixed(2)}deg`
                );

                element.style.setProperty(
                    "--sc-glare-x",
                    `${(x * 100).toFixed(1)}%`
                );

                element.style.setProperty(
                    "--sc-glare-y",
                    `${(y * 100).toFixed(1)}%`
                );
            });

            element.addEventListener("pointerleave", () => {
                element.style.setProperty("--sc-card-tilt-x", "0deg");
                element.style.setProperty("--sc-card-tilt-y", "0deg");
            });
        });
    }

    /* ---------- 3. SCROLL REVEAL ---------- */

    const revealGroups = [
        {
            selector: ".mood-card",
            delay: true
        },
        {
            selector: ".product-card",
            delay: true
        },
        {
            selector: ".step-card",
            delay: true
        },
        {
            selector: ".quiz-box",
            delay: false
        },
        {
            selector: ".story-image, .story-copy",
            delay: false
        },
        {
            selector: ".mega-sale-content, .mega-sale-visual",
            delay: false
        },
        {
            selector: ".contact-content, .contact-form-wrapper",
            delay: false
        }
    ];

    const revealElements = [];

    revealGroups.forEach((group) => {
        const elements = document.querySelectorAll(group.selector);

        elements.forEach((element, index) => {
            element.classList.add("sc-reveal");

            if (group.delay) {
                const delay = (index % 5) + 1;
                element.dataset.scDelay = String(delay);
            }

            revealElements.push(element);
        });
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -45px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    }

})();
