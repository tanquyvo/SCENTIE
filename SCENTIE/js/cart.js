
/* =========================================================
   SCENTIE — COMPLETE CART SYSTEM
   LocalStorage + Cart Rendering + Cart Interactions
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       1. CONFIGURATION
    ===================================================== */

    const CART_STORAGE_KEY = "SCENTIE_CART_V1";

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    /* =====================================================
       2. STORAGE MANAGEMENT
    ===================================================== */

    function getCart() {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            const parsedCart = storedCart ? JSON.parse(storedCart) : [];

            return Array.isArray(parsedCart) ? parsedCart : [];
        } catch (error) {
            console.error("SCENTIE Cart: Unable to read cart.", error);
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

        updateCartCount();

        window.dispatchEvent(new CustomEvent("scentie:cart-updated", {
            detail: { cart }
        }));

        renderCart();
    }

    /* =====================================================
       3. CART CALCULATIONS
    ===================================================== */

    function getTotalQuantity() {
        return getCart().reduce((total, item) => {
            return total + Number(item.quantity || 0);
        }, 0);
    }

    function getSubtotal() {
        return getCart().reduce((total, item) => {
            return total +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 0);
        }, 0);
    }

    function getItemCount() {
        return getCart().length;
    }

    function formatMoney(price) {
        return new Intl.NumberFormat("vi-VN")
            .format(Number(price) || 0) + "đ";
    }

    /* =====================================================
       4. HEADER CART COUNT
    ===================================================== */

    function updateCartCount() {
        const totalQuantity = getTotalQuantity();

        $$("[data-cart-count], #cartCount, .cart-count")
            .forEach(element => {
                element.textContent = totalQuantity;

                element.setAttribute(
                    "aria-label",
                    `${totalQuantity} sản phẩm trong giỏ hàng`
                );

                element.hidden = totalQuantity <= 0;
            });

        $$(".header-cart").forEach(element => {
            element.setAttribute(
                "aria-label",
                `Giỏ hàng, ${totalQuantity} sản phẩm`
            );
        });
    }

    /* =====================================================
       5. ADD ITEM
       Compatible with product-detail.js
    ===================================================== */

    function addItem(product, quantity = 1) {
        if (!product || !product.id) {
            console.error("SCENTIE Cart: Invalid product.");
            return false;
        }

        const safeQuantity = Math.max(
            1,
            Math.min(99, Math.floor(Number(quantity) || 1))
        );

        const cart = getCart();

        const existingItem = cart.find(item =>
            item.id === product.id
        );

        if (existingItem) {
            existingItem.quantity = Math.min(
                99,
                Number(existingItem.quantity || 0) + safeQuantity
            );
        } else {
            cart.push({
                id: product.id,
                name: product.name || "SCENTIE Product",
                price: Number(product.price) || 0,
                originalPrice: Number(product.originalPrice) || null,
                image: product.image || null,

                moods: Array.isArray(product.moods)
                    ? [...product.moods]
                    : [],

                imageMoods: Array.isArray(product.imageMoods)
                    ? [...product.imageMoods]
                    : [],

                category: product.category || "",
                patches: Number(product.patches) || 0,
                url: product.url || "",
                quantity: safeQuantity
            });
        }

        saveCart(cart);

        return true;
    }

    /* =====================================================
       6. UPDATE QUANTITY
    ===================================================== */

    function updateQuantity(productId, quantity) {
        const cart = getCart();

        const item = cart.find(product =>
            product.id === productId
        );

        if (!item) return false;

        const safeQuantity = Math.floor(Number(quantity));

        if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
            removeItem(productId);
            return true;
        }

        item.quantity = Math.min(99, safeQuantity);

        saveCart(cart);

        return true;
    }

    /* =====================================================
       7. REMOVE ITEM
    ===================================================== */

    function removeItem(productId) {
        const cart = getCart().filter(item =>
            item.id !== productId
        );

        saveCart(cart);

        return true;
    }

    /* =====================================================
       8. CLEAR CART
    ===================================================== */

    function clearCart() {
        saveCart([]);
    }

    /* =====================================================
       9. PRODUCT IMAGE
    ===================================================== */

    function getProductImage(item) {
        // Ưu tiên ảnh sản phẩm có sẵn.
        if (item.image) {
            return normalizeImagePath(item.image);
        }

        // Nếu là Combo, lấy ảnh từ các mood.
        const moods = Array.isArray(item.imageMoods) &&
            item.imageMoods.length
            ? item.imageMoods
            : Array.isArray(item.moods)
                ? item.moods
                : [];

        if (moods.length) {
            return `../assets/images/mockups/mockup-${moods[0]}.png`;
        }

        // Ảnh dự phòng.
        return "../assets/images/logo/logo-scentie-den.png";
    }

    function getProductImages(item) {
        const moods = Array.isArray(item.imageMoods) &&
            item.imageMoods.length
            ? item.imageMoods
            : Array.isArray(item.moods)
                ? item.moods
                : [];

        if (moods.length > 1) {
            return moods.map(mood =>
                `../assets/images/mockups/mockup-${mood}.png`
            );
        }

        return [getProductImage(item)];
    }

    function normalizeImagePath(path) {
        if (!path) return "";

        if (
            path.startsWith("http://") ||
            path.startsWith("https://") ||
            path.startsWith("data:") ||
            path.startsWith("../")
        ) {
            return path;
        }

        return "../" + path.replace(/^\/+/, "");
    }

    /* =====================================================
       10. PRODUCT URL
    ===================================================== */

    function getProductURL(item) {
        if (item.url) {
            return item.url
                .replace(/^pages\//, "")
                .replace(/^\/+/, "");
        }

        return "shop.html";
    }

    /* =====================================================
       11. SAFE HTML
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    /* =====================================================
       12. EMPTY CART
    ===================================================== */

    function renderEmptyCart() {
        const cartContent = $("#cartContent");
        const cartEmpty = $("#cartEmpty");
        const cartItems = $("#cartItems");

        if (cartItems) cartItems.innerHTML = "";

        if (cartContent) cartContent.hidden = true;
        if (cartEmpty) cartEmpty.hidden = false;

        updateSummary(0);
    }

    /* =====================================================
       13. CART SUMMARY
    ===================================================== */

    function updateSummary(subtotal) {
        const subtotalElement = $("#cartSubtotal");
        const totalElement = $("#cartTotal");
        const countElement = $("#cartItemCount");
        const checkoutButton = $("#checkoutBtn");

        if (subtotalElement) {
            subtotalElement.textContent = formatMoney(subtotal);
        }

        if (totalElement) {
            totalElement.textContent = formatMoney(subtotal);
        }

        if (countElement) {
            countElement.textContent =
                `${getTotalQuantity()} sản phẩm`;
        }

        if (checkoutButton) {
            checkoutButton.disabled = subtotal <= 0;
        }
    }

    /* =====================================================
       14. RENDER CART ITEMS
    ===================================================== */

    function renderCart() {
        const cartItemsContainer = $("#cartItems");

        // Không phải trang Cart thì bỏ qua phần hiển thị.
        if (!cartItemsContainer) return;

        const cart = getCart();

        if (!cart.length) {
            renderEmptyCart();
            return;
        }

        const cartContent = $("#cartContent");
        const cartEmpty = $("#cartEmpty");

        if (cartContent) cartContent.hidden = false;
        if (cartEmpty) cartEmpty.hidden = true;

        const subtotal = getSubtotal();

        cartItemsContainer.innerHTML = cart.map(item => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const image = getProductImage(item);

            const moods = Array.isArray(item.moods)
                ? item.moods
                : [];

            const productURL = getProductURL(item);

            const moodText = moods.join(" · ");

            const comboImages = getProductImages(item);

            const imageHTML = comboImages.length > 1
                ? `
                    <div class="cart-item-collage">
                        ${comboImages.map((src, index) => `
                            <img
                                src="${escapeHTML(src)}"
                                alt="${escapeHTML(item.name)}"
                                style="--image-index:${index}"
                                loading="lazy"
                                onerror="this.style.display='none'"
                            >
                        `).join("")}
                    </div>
                `
                : `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(item.name)}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='../assets/images/logo/logo-scentie-den.png';"
                    >
                `;

            return `
                <article
                    class="cart-item"
                    data-product-id="${escapeHTML(item.id)}"
                >

                    <a
                        href="${escapeHTML(productURL)}"
                        class="cart-item-image"
                    >
                        ${imageHTML}
                    </a>

                    <div class="cart-item-info">

                        <span class="cart-item-category">
                            ${escapeHTML(item.category || "SCENTIE COLLECTION")}
                        </span>

                        <h3 class="cart-item-name">
                            <a href="${escapeHTML(productURL)}">
                                ${escapeHTML(item.name)}
                            </a>
                        </h3>

                        ${moodText ? `
                            <p class="cart-item-moods">
                                ${escapeHTML(moodText)}
                            </p>
                        ` : ""}

                        <p class="cart-item-patches">
                            ${Number(item.patches) || 0} MIẾNG DÁN
                        </p>

                        <div class="cart-item-mobile-price">
                            ${formatMoney(price)}
                        </div>

                        <div class="cart-item-controls">

                            <div class="cart-quantity">

                                <button
                                    type="button"
                                    data-action="decrease"
                                    aria-label="Giảm số lượng"
                                    ${quantity <= 1 ? "disabled" : ""}
                                >
                                    −
                                </button>

                                <span>${quantity}</span>

                                <button
                                    type="button"
                                    data-action="increase"
                                    aria-label="Tăng số lượng"
                                    ${quantity >= 99 ? "disabled" : ""}
                                >
                                    +
                                </button>

                            </div>

                            <button
                                type="button"
                                class="cart-remove"
                                data-action="remove"
                            >
                                Xóa sản phẩm
                            </button>

                        </div>

                    </div>

                    <div class="cart-item-price">
                        ${formatMoney(price * quantity)}
                    </div>

                </article>
            `;
        }).join("");

        // Progressive reveal for newly rendered product cards.
        const renderedItems = $$(".cart-item", cartItemsContainer);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduceMotion && "IntersectionObserver" in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.12 });
            renderedItems.forEach((element, index) => {
                element.classList.add("cart-reveal");
                element.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
                revealObserver.observe(element);
            });
        }

        updateSummary(subtotal);
    }

    /* =====================================================
       15. CART INTERACTIONS
    ===================================================== */

    document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const cartItem = button.closest(".cart-item");

        if (!cartItem) return;

        const productId = cartItem.dataset.productId;
        const action = button.dataset.action;

        const item = getCart().find(product =>
            product.id === productId
        );

        if (!item) return;

        if (action === "increase") {
            updateQuantity(productId, item.quantity + 1);
        }

        if (action === "decrease") {
            updateQuantity(productId, item.quantity - 1);
        }

        if (action === "remove") {
            removeItem(productId);
        }
    });

    /* =====================================================
       16. CHECKOUT BUTTON
       Chưa tích hợp cổng thanh toán.
    ===================================================== */

    document.addEventListener("click", function (event) {
        const checkoutButton = event.target.closest("#checkoutBtn");

        if (!checkoutButton) return;

        if (getCart().length === 0) return;

        window.dispatchEvent(new CustomEvent("scentie:checkout-request", {
            detail: {
                cart: getCart(),
                subtotal: getSubtotal()
            }
        }));

        window.location.href = "checkout.html";
    });

    /* =====================================================
       17. PUBLIC API
       Giữ tương thích với product-detail.js.
    ===================================================== */

    const SCENTIE_CART = {
        getCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,

        getTotalQuantity,
        getSubtotal,
        getItemCount,

        updateCartCount,
        renderCart,
        formatMoney
    };

    window.SCENTIE_CART = SCENTIE_CART;

    /* =====================================================
       18. INITIALIZE
    ===================================================== */

    function initializeCart() {
        updateCartCount();
        renderCart();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeCart);
    } else {
        initializeCart();
    }

    /* =====================================================
       19. CROSS-TAB SYNCHRONIZATION
    ===================================================== */

    window.addEventListener("storage", function (event) {
        if (event.key === CART_STORAGE_KEY) {
            updateCartCount();
            renderCart();
        }
    });

})();

/* =====================================================
   17. IMMERSIVE CART MICRO-INTERACTIONS
   Visual-only enhancement; cart data and API remain unchanged.
===================================================== */
(function initCartTechArt() {
    document.addEventListener("DOMContentLoaded", () => {
        const page = document.querySelector(".cart-page");
        if (!page) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
            page.addEventListener("pointermove", event => {
                const target = event.target.closest(".cart-item, .cart-summary");
                if (!target) return;
                const rect = target.getBoundingClientRect();
                target.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
                target.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
            });
        }

        page.addEventListener("click", event => {
            const control = event.target.closest('[data-action="increase"], [data-action="decrease"]');
            if (!control) return;
            const item = control.closest(".cart-item");
            if (!item) return;
            item.classList.remove("is-updating");
            requestAnimationFrame(() => item.classList.add("is-updating"));
        });

        window.addEventListener("scentie:cart-updated", () => {
            page.classList.add("cart-has-update");
            window.setTimeout(() => page.classList.remove("cart-has-update"), 500);
        });
    });
})();
