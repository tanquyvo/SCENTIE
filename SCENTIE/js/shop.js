


/* ========================================
   SCENTIE - SHOP PAGE
   Product Rendering & Smart Filtering
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const productGrid = document.getElementById("productGrid");
    const productCount = document.getElementById("productCount");
    const emptyState = document.getElementById("shopEmptyState");

    const categoryButtons = document.querySelectorAll(".shop-category-btn");

    const moodInputs = document.querySelectorAll(
        'input[name="shopMood"]'
    );

    const priceInputs = document.querySelectorAll(
        'input[name="shopPrice"]'
    );

    const sortSelect = document.getElementById("shopSortSelect");
    const clearButton = document.getElementById("clearShopFilters");

    const resultDescription = document.getElementById(
        "shopResultDescription"
    );

    const emptyTitle = document.getElementById("shopEmptyTitle");
    const emptyDescription = document.getElementById(
        "shopEmptyDescription"
    );

    // Kiểm tra Shop Page
    if (
        !productGrid ||
        !productCount ||
        !emptyState ||
        typeof SCENTIE_PRODUCTS === "undefined"
    ) {
        return;
    }


    /* ========================================
       1. DATA
       ======================================== */

    const visibleProducts = SCENTIE_PRODUCTS.filter(function (product) {
        return product.visible !== false;
    });

    let selectedCategory = "all";
    let isFiltering = false;


    /* ========================================
       2. HELPER FUNCTIONS
       ======================================== */

    function formatShopPrice(price) {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }


    function getShopImagePath(imagePath) {

        if (!imagePath) return "";

        if (imagePath.startsWith("../")) {
            return imagePath;
        }

        return "../" + imagePath;
    }


    function getProductUrl(url) {

        if (!url) return "product-detail.html";

        if (url.startsWith("pages/")) {
            return "product-detail.html" +
                url.substring("pages/product-detail.html".length);
        }

        if (url.startsWith("../") || url.startsWith("http")) {
            return url;
        }

        return url;
    }


    function getMoodImagePath(mood) {

        const moodKey = String(mood).toLowerCase();

        return `../assets/images/mockups/mockup-${moodKey}.png`;
    }


    /* ========================================
       3. PRODUCT IMAGE
       ======================================== */

    function renderProductImage(product) {

        if (
            product.type === "combo" &&
            product.imageMoods?.length
        ) {

            const moodImages = product.imageMoods.map(function (mood) {

                return `
                    <img
                        src="${getMoodImagePath(mood)}"
                        alt="SCENTIE ${mood}"
                        loading="lazy"
                    >
                `;

            }).join("");

            return `
                <div class="shop-combo-collage">
                    ${moodImages}
                </div>
            `;
        }


        if (product.image) {

            return `
                <img
                    src="${getShopImagePath(product.image)}"
                    alt="SCENTIE ${product.name}"
                    loading="lazy"
                >
            `;
        }


        return `
            <div class="shop-image-placeholder">
                SCENTIE
            </div>
        `;
    }


    /* ========================================
       4. PRODUCT CARD
       ======================================== */

    function renderProductCard(product) {

        const isSale =
            product.originalPrice &&
            product.originalPrice > product.price;

        const discount = isSale
            ? product.discount ||
                Math.round(
                    (1 - product.price / product.originalPrice) * 100
                )
            : 0;


        const badgeText = isSale
            ? `-${discount}%`
            : product.type === "combo"
                ? "MOOD COMBO"
                : product.mood?.toUpperCase() || "SINGLE MOOD";


        const originalPriceHTML = isSale
            ? `
                <span class="shop-product-original-price">
                    ${formatShopPrice(product.originalPrice)}
                </span>
            `
            : "";


        const discountHTML = isSale
            ? `
                <span class="shop-product-discount">
                    -${discount}%
                </span>
            `
            : "";


        return `
            <article class="shop-product-card">

                <a
                    href="${getProductUrl(product.url)}"
                    class="shop-product-image"
                    aria-label="Xem ${product.name}"
                >

                    <span class="shop-product-badge">
                        ${badgeText}
                    </span>

                    ${renderProductImage(product)}

                </a>


                <div class="shop-product-info">

                    <p class="shop-product-category">
                        ${product.category || "SCENTIE COLLECTION"}
                    </p>

                    <h3 class="shop-product-name">
                        ${product.name}
                    </h3>

                    <p class="shop-product-description">
                        ${product.description ||
                            `${product.patches || ""} fragrance patches`}
                    </p>

                    <div class="shop-product-price-row">

                        <span class="shop-product-price">
                            ${formatShopPrice(product.price)}
                        </span>

                        ${originalPriceHTML}
                        ${discountHTML}

                    </div>

                    <a
                        href="${getProductUrl(product.url)}"
                        class="shop-product-link"
                    >
                        Khám phá ngay
                    </a>

                </div>

            </article>
        `;
    }


    /* ========================================
       5. GET FILTER VALUES
       ======================================== */

    function getSelectedMoods() {

        return Array.from(moodInputs)
            .filter(input => input.checked)
            .map(input => input.value.toLowerCase());
    }


    function getSelectedPrice() {

        const selected = Array.from(priceInputs)
            .find(input => input.checked);

        return selected ? selected.value : "all";
    }


    function getSelectedSort() {

        return sortSelect ? sortSelect.value : "default";
    }


    /* ========================================
       6. CATEGORY FILTER
       ======================================== */

    function filterByCategory(products) {

        if (selectedCategory === "special") {
            return [];
        }

        if (selectedCategory === "single") {

            return products.filter(function (product) {
                return product.type === "single";
            });
        }

        if (selectedCategory === "combo") {

            return products.filter(function (product) {
                return product.type === "combo";
            });
        }

        return products;
    }


    /* ========================================
       7. MOOD FILTER
       ======================================== */

    function filterByMood(products) {

        const selectedMoods = getSelectedMoods();

        if (selectedMoods.length === 0) {
            return products;
        }

        return products.filter(function (product) {

            const productMoods = (product.moods || [])
                .map(mood => mood.toLowerCase());

            // AND logic:
            // Sản phẩm phải chứa tất cả mood được chọn.
            return selectedMoods.every(function (mood) {
                return productMoods.includes(mood);
            });

        });
    }


    /* ========================================
       8. PRICE FILTER
       ======================================== */

    function filterByPrice(products) {

        const selectedPrice = getSelectedPrice();

        if (selectedPrice === "all") {
            return products;
        }

        return products.filter(function (product) {

            const price = product.price;

            switch (selectedPrice) {

                case "under-100":
                    return price < 100000;

                case "100-200":
                    return price >= 100000 && price < 200000;

                case "200-300":
                    return price >= 200000 && price <= 300000;

                case "over-300":
                    return price > 300000;

                default:
                    return true;
            }

        });
    }


    /* ========================================
       9. SORT PRODUCTS
       ======================================== */

    function sortProducts(products) {

        const sortedProducts = [...products];

        const sortType = getSelectedSort();

        switch (sortType) {

            case "price-asc":

                sortedProducts.sort(function (a, b) {
                    return a.price - b.price;
                });

                break;


            case "price-desc":

                sortedProducts.sort(function (a, b) {
                    return b.price - a.price;
                });

                break;


            case "promotion":

                sortedProducts.sort(function (a, b) {

                    const discountA = a.originalPrice
                        ? a.discount ||
                            Math.round(
                                (1 - a.price / a.originalPrice) * 100
                            )
                        : 0;

                    const discountB = b.originalPrice
                        ? b.discount ||
                            Math.round(
                                (1 - b.price / b.originalPrice) * 100
                            )
                        : 0;

                    return discountB - discountA;

                });

                break;


            default:
                // Giữ thứ tự mặc định trong products.js.
                break;
        }

        return sortedProducts;
    }


    /* ========================================
       10. APPLY ALL FILTERS
       ======================================== */

    function getFilteredProducts() {

        let products = [...visibleProducts];

        products = filterByCategory(products);

        products = filterByMood(products);

        products = filterByPrice(products);

        products = sortProducts(products);

        return products;
    }


    /* ========================================
       11. UPDATE RESULT DESCRIPTION
       ======================================== */

    function updateResultDescription(products) {

        if (!resultDescription) return;

        const selectedMoods = getSelectedMoods();
        const selectedPrice = getSelectedPrice();

        const descriptions = [];

        if (selectedCategory === "single") {
            descriptions.push("Single Mood");
        } else if (selectedCategory === "combo") {
            descriptions.push("Mood Combo");
        } else if (selectedCategory === "special") {
            descriptions.push("Special Edition");
        } else {
            descriptions.push("Tất cả sản phẩm");
        }


        if (selectedMoods.length > 0) {
            descriptions.push(selectedMoods.join(" + "));
        }


        const priceLabels = {
            "under-100": "Dưới 100.000đ",
            "100-200": "100.000đ – 200.000đ",
            "200-300": "200.000đ – 300.000đ",
            "over-300": "Trên 300.000đ"
        };

        if (priceLabels[selectedPrice]) {
            descriptions.push(priceLabels[selectedPrice]);
        }


        if (getSelectedSort() === "promotion") {
            descriptions.push("Ưu đãi nổi bật");
        }


        resultDescription.textContent = descriptions.join(" · ");
    }


    /* ========================================
       12. EMPTY STATE
       ======================================== */

    function updateEmptyState(products) {

        const hasProducts = products.length > 0;

        productGrid.hidden = !hasProducts;
        emptyState.hidden = hasProducts;


        if (hasProducts) {
            return;
        }


        if (selectedCategory === "special") {

            emptyTitle.innerHTML = "Something special<br>is on its way!";

            emptyDescription.textContent =
                "SCENTIE đang chuẩn bị những điều thú vị hơn. " +
                "Hãy quay lại sớm để khám phá nhé!";

            return;
        }


        emptyTitle.textContent = "No mood, no match?";

        emptyDescription.textContent =
            "Chưa tìm thấy sản phẩm phù hợp với lựa chọn của bạn. " +
            "Hãy thử thay đổi hoặc xóa bộ lọc nhé!";
    }


    /* ========================================
       13. RENDER PRODUCTS
       ======================================== */

    function renderProducts(products) {

        productGrid.innerHTML = products
            .map(renderProductCard)
            .join("");


        productCount.textContent = `${products.length} sản phẩm`;

        updateEmptyState(products);

        updateResultDescription(products);
    }


    /* ========================================
       14. UPDATE ACTIVE CATEGORY
       ======================================== */

    function updateCategoryButtons() {

        categoryButtons.forEach(function (button) {

            const isActive =
                button.dataset.filter === selectedCategory;

            button.classList.toggle("active", isActive);

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

        });
    }


    /* ========================================
       15. FILTER TRANSITION
       ======================================== */

    function applyFiltersWithTransition() {

        if (isFiltering) return;

        isFiltering = true;

        productGrid.classList.remove("is-entering");
        productGrid.classList.add("is-changing");


        setTimeout(function () {

            const filteredProducts = getFilteredProducts();

            renderProducts(filteredProducts);

            productGrid.classList.remove("is-changing");


            if (!productGrid.hidden) {
                productGrid.classList.add("is-entering");
            }


            setTimeout(function () {

                productGrid.classList.remove("is-entering");

                isFiltering = false;

            }, 700);

        }, 360);

    }


    /* ========================================
       16. CATEGORY EVENTS
       ======================================== */

    categoryButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const newCategory = button.dataset.filter;

            if (newCategory === selectedCategory) {
                return;
            }

            if (isFiltering) return;

            selectedCategory = newCategory;

            updateCategoryButtons();

            applyFiltersWithTransition();

        });

    });


    /* ========================================
       17. MOOD EVENTS
       ======================================== */

    moodInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            applyFiltersWithTransition();

        });

    });


    /* ========================================
       18. PRICE EVENTS
       ======================================== */

    priceInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            applyFiltersWithTransition();

        });

    });


    /* ========================================
       19. SORT EVENTS
       ======================================== */

    if (sortSelect) {

        sortSelect.addEventListener("change", function () {

            applyFiltersWithTransition();

        });

    }


    /* ========================================
       20. RESET ALL FILTERS
       ======================================== */

    if (clearButton) {

        clearButton.addEventListener("click", function () {

            if (isFiltering) return;

            moodInputs.forEach(function (input) {
                input.checked = false;
            });

            priceInputs.forEach(function (input) {
                input.checked = false;
            });

            if (sortSelect) {
                sortSelect.value = "default";
            }

            selectedCategory = "all";

            updateCategoryButtons();

            applyFiltersWithTransition();

        });

    }


    /* ========================================
       21. INITIAL RENDER
       ======================================== */

    updateCategoryButtons();

    renderProducts(visibleProducts);

});

