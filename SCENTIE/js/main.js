
/* ========================================
   SCENTIE - MAIN JAVASCRIPT
   ======================================== */

// Mobile navigation

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");

if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("active");

        mobileMenuBtn.setAttribute("aria-expanded", isOpen);
        mobileMenuBtn.setAttribute(
            "aria-label",
            isOpen ? "Đóng menu" : "Mở menu"
        );

        mobileMenuBtn.textContent = isOpen ? "✕" : "☰";
    });

    // Đóng menu khi chọn một đường dẫn

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("active");
            mobileMenuBtn.setAttribute("aria-expanded", "false");
            mobileMenuBtn.textContent = "☰";
        });
    });
}

/* =========================================================
   SCENTIE — LIQUID GLASS DOCK EFFECT
   Desktop navigation magnification
   ========================================================= */

(() => {
    const initLiquidDock = () => {
        const nav = document.querySelector('.site-header .main-nav');

        if (!nav || nav.dataset.dockInitialized === 'true') return;

        nav.dataset.dockInitialized = 'true';

        const links = [...nav.querySelectorAll('a')];

        if (!links.length) return;

        // Tạo viên kính di chuyển theo chuột
        const indicator = document.createElement('span');
        indicator.className = 'nav-liquid-indicator';
        indicator.setAttribute('aria-hidden', 'true');

        nav.insertBefore(indicator, nav.firstChild);

        const radius = 105;

        const moveIndicator = (link) => {
            const navRect = nav.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();

            const x = linkRect.left - navRect.left;

            indicator.style.width = `${linkRect.width}px`;
            indicator.style.setProperty('--indicator-x', `${x}px`);
        };

        const resetDock = () => {
            nav.classList.remove('is-dock-active');

            links.forEach(link => {
                link.style.setProperty('--dock-scale', '1');
                link.style.setProperty('--dock-lift', '0');
                link.classList.remove('is-dock-hover');
            });

            const currentLink = nav.querySelector('a[aria-current="page"]');

            if (currentLink) {
                moveIndicator(currentLink);
            }
        };

        nav.addEventListener('pointermove', (event) => {
            if (event.pointerType === 'touch') return;

            const navRect = nav.getBoundingClientRect();
            const mouseX = event.clientX - navRect.left;

            nav.classList.add('is-dock-active');

            let hoveredLink = null;
            let closestDistance = Infinity;

            links.forEach(link => {
                const rect = link.getBoundingClientRect();
                const center = rect.left - navRect.left + rect.width / 2;

                const distance = Math.abs(mouseX - center);

                // Hiệu ứng phóng đại theo khoảng cách
                const proximity = Math.max(0, 1 - distance / radius);
                const influence = proximity * proximity;

                const scale = 1 + influence * 0.16;
                const lift = influence * 7;

                link.style.setProperty('--dock-scale', scale.toFixed(3));
                link.style.setProperty('--dock-lift', lift.toFixed(2));

                link.classList.remove('is-dock-hover');

                if (distance < closestDistance) {
                    closestDistance = distance;
                    hoveredLink = link;
                }
            });

            if (hoveredLink) {
                hoveredLink.classList.add('is-dock-hover');
                moveIndicator(hoveredLink);
            }
        });

        nav.addEventListener('pointerleave', resetDock);

        // Đặt viên kính ở mục hiện tại khi tải trang
        const currentLink = nav.querySelector('a[aria-current="page"]');

        if (currentLink) {
            moveIndicator(currentLink);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiquidDock);
    } else {
        initLiquidDock();
    }
})();