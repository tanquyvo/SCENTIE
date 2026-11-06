
/* =========================================================
   SCENTIE — KHÔNG GIAN HƯƠNG THƠM SỐ
   Tương tác trang chi tiết sản phẩm
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const $ = (selector) => document.querySelector(selector);

    const hero = $(".pd-hero");
    const mainImage = $("#productMainImage");
    const mainProduct = $(".pd-main-product");
    const thumbnails = $("#productThumbnails");
    const productName = $("#productName");
    const productPrice = $("#productPrice");
    const originalPrice = $("#productOriginalPrice");
    const discount = $("#productDiscount");
    const quantityInput = $("#productQuantity");
    const addToCartBtn = $("#addToCartBtn");
    const buyNowBtn = $("#buyNowBtn");
    const modal = $("#cartSuccessOverlay");

    if (!hero || !mainImage || !mainProduct) return;

    /* -----------------------------------------------------
       NHẬN DIỆN HÌNH ẢNH TỪNG TÂM TRẠNG
    ----------------------------------------------------- */

    const MOOD_VISUALS = {
        focus: {
            name: "Tập trung",
            color: "#8da98e",
            light: "#dce9d9",
            dark: "#344e3b",
            tagline: "MỘT CHÚT RÕ RÀNG CHO MỖI NGÀY",
            story: "Dành cho những khoảnh khắc bạn muốn gạt bỏ những ồn ào, tìm lại nhịp điệu của riêng mình và tập trung vào điều thực sự quan trọng. Focus là lời nhắc nhỏ để bạn dành không gian cho hướng đi của chính mình.",
            description: "Một tâm trạng điềm tĩnh và tập trung, dành cho những ngày bạn muốn tìm lại sự tập trung và bước đi có chủ đích.",
            number: "01"
        },
        energy: {
            name: "Năng lượng",
            color: "#e9c85e",
            light: "#fff0bd",
            dark: "#74591e",
            tagline: "THẮP LÊN NGỌN LỬA RIÊNG CỦA BẠN",
            story: "Có những ngày dành riêng cho những ý tưởng lớn, những kế hoạch ngẫu hứng và lời đồng ý với những điều mới mẻ. Energy dành cho những khoảnh khắc bạn muốn mang nguồn năng lượng riêng vào mọi điều mình làm.",
            description: "Một tâm trạng tươi sáng và tràn đầy sức sống, dành cho những ngày bạn sẵn sàng mang năng lượng của mình đến mọi nơi.",
            number: "02"
        },
        calm: {
            name: "Bình yên",
            color: "#a88be8",
            light: "#e5d7ff",
            dark: "#49366c",
            tagline: "MỘT KHOẢNG LẶNG GIỮA THẾ GIỚI BẬN RỘN",
            story: "Hít một hơi thật sâu. Để thế giới chậm lại đôi chút. Calm là lời nhắc nhỏ rằng bạn không phải lúc nào cũng cần vội vàng. Hãy dành chỗ cho những khoảnh khắc bình yên và đơn giản là sống đúng với chính mình.",
            description: "Một tâm trạng dịu dàng dành cho những khoảnh khắc bạn muốn chậm lại, hít thở và tận hưởng khoảng không gian nhỏ của riêng mình.",
            number: "03"
        },
        date: {
            name: "Hẹn hò",
            color: "#df8da6",
            light: "#f8dce5",
            dark: "#74384e",
            tagline: "KHIẾN MỌI KHOẢNH KHẮC TRỞ NÊN ĐẶC BIỆT",
            story: "Một chút tự tin, một điểm nhấn tinh tế và một khoảnh khắc đáng nhớ. Date dành cho những dịp bạn muốn cảm thấy đặc biệt hơn một chút, theo cách riêng của mình.",
            description: "Một tâm trạng lãng mạn và giàu cảm xúc dành cho những khoảnh khắc xứng đáng có thêm chút phép màu.",
            number: "04"
        },
        fun: {
            name: "Vui vẻ",
            color: "#83b8e9",
            light: "#d8ebff",
            dark: "#315b80",
            tagline: "BỚT SUY NGHĨ. THÊM TRẢI NGHIỆM.",
            story: "Cuộc sống không phải lúc nào cũng cần một kế hoạch. Fun dành cho những chuyến phiêu lưu ngẫu hứng, những tràng cười bất chợt và những khoảnh khắc nhỏ biến một ngày bình thường thành một câu chuyện đáng nhớ.",
            description: "Một tâm trạng tinh nghịch dành cho những ngày bạn muốn khám phá, cười thật nhiều và tận hưởng từng khoảnh khắc nhỏ.",
            number: "05"
        }
    };

    const DEFAULT_VISUAL = {
        color: "#a88be8",
        light: "#e5d7ff",
        dark: "#49366c"
    };

    const moodKeys = Object.keys(MOOD_VISUALS);

    function getMoodKey(mood) {
        return String(mood || "").toLowerCase().trim();
    }

    function getMoodVisual(mood) {
        return MOOD_VISUALS[getMoodKey(mood)] || DEFAULT_VISUAL;
    }

    function getMoodImage(mood) {
        return `../assets/images/mockups/mockup-${getMoodKey(mood)}.png`;
    }

    function formatMoney(price) {
        if (typeof formatPrice === "function") {
            return formatPrice(price);
        }

        return new Intl.NumberFormat("vi-VN").format(price || 0) + "đ";
    }

    /* -----------------------------------------------------
       LẤY SẢN PHẨM TỪ ĐƯỜNG DẪN
    ----------------------------------------------------- */

    const params = new URLSearchParams(window.location.search);

    const requestedMood = params.get("mood");
    const requestedProduct = params.get("product");

    let currentProduct = null;

    if (typeof SCENTIE_PRODUCTS !== "undefined") {
        if (requestedMood) {
            currentProduct = SCENTIE_PRODUCTS.find(product =>
                product.id === requestedMood.toLowerCase() ||
                String(product.mood || "").toLowerCase() === requestedMood.toLowerCase()
            );
        } else if (requestedProduct) {
            currentProduct = SCENTIE_PRODUCTS.find(product =>
                product.id === requestedProduct
            );
        }
    }

    /* -----------------------------------------------------
       KHÔNG TÌM THẤY SẢN PHẨM
    ----------------------------------------------------- */

    if (!currentProduct || currentProduct.visible === false) {
        $("#productDetailRoot").hidden = true;

        document.querySelectorAll(
            ".pd-universe, .pd-inside, .pd-howto, .pd-related"
        ).forEach(section => {
            section.hidden = true;
        });

        $("#productNotFound").hidden = false;

        return;
    }

    /* -----------------------------------------------------
       DỮ LIỆU SẢN PHẨM
    ----------------------------------------------------- */

    const productMoods = Array.isArray(currentProduct.moods)
        ? currentProduct.moods
        : currentProduct.mood
            ? [currentProduct.mood]
            : [];

    const normalizedMoods = productMoods.map(mood =>
        moodKeys.find(key => key === getMoodKey(mood)) || getMoodKey(mood)
    );

    const firstMood = normalizedMoods[0] || "calm";
    const primaryVisual = getMoodVisual(firstMood);

    const isCombo = currentProduct.type === "combo";
    const isFullCombo = currentProduct.id === "full-mood-combo";

    const imageMoods = Array.isArray(currentProduct.imageMoods) &&
        currentProduct.imageMoods.length
        ? currentProduct.imageMoods
        : normalizedMoods;

    let activeImageIndex = 0;

    /* -----------------------------------------------------
       ÁP DỤNG HỆ THỐNG MÀU SẮC THEO TÂM TRẠNG
    ----------------------------------------------------- */

    function applyMoodTheme() {
        const colors = normalizedMoods.map(mood => getMoodVisual(mood));

        const accent = primaryVisual.color;
        const light = primaryVisual.light;
        const dark = primaryVisual.dark;

        hero.style.setProperty("--pd-accent", accent);
        hero.style.setProperty("--pd-accent-2", light);
        hero.style.setProperty("--pd-dark", dark);

        document.documentElement.style.setProperty("--pd-accent", accent);
        document.documentElement.style.setProperty("--pd-accent-2", light);

        const universe = $("#moodUniverse");

        if (universe) {
            universe.style.setProperty("--pd-accent", accent);
            universe.style.setProperty("--pd-accent-2", light);
        }

        const inside = $(".pd-inside");

        if (inside) {
            inside.style.setProperty("--pd-accent", accent);
        }

        const howto = $(".pd-howto");

        if (howto) {
            howto.style.setProperty("--pd-accent", accent);
        }

        const related = $(".pd-related");

        if (related) {
            related.style.setProperty("--pd-accent", accent);
        }

        if (isCombo && colors.length > 1) {
            hero.style.background = `
                radial-gradient(circle at 15% 20%, rgba(255,255,255,.95), transparent 25%),
                radial-gradient(circle at 85% 75%, ${colors[1].light}, transparent 35%),
                linear-gradient(125deg, ${colors[0].light}, ${colors[1].light}, ${colors[2] ? colors[2].light : colors[0].light})
            `;
        }
    }

    applyMoodTheme();

    /* -----------------------------------------------------
       NỘI DUNG SẢN PHẨM
    ----------------------------------------------------- */

    const productDisplayName = currentProduct.name || "SCENTIE";

    $("#breadcrumbProduct").textContent = productDisplayName;
    $("#productCategory").textContent = currentProduct.category || "BỘ SƯU TẬP SCENTIE";
    $("#heroNumber").textContent = isFullCombo ? "∞" : primaryVisual.number || "01";

    $("#productTagline").textContent = isCombo
        ? (isFullCombo ? "NĂM TÂM TRẠNG. MỘT VŨ TRỤ NHỎ." : "MỘT CHÚT HƯƠNG VỊ CỦA MỌI ĐIỀU.")
        : primaryVisual.tagline;

    productName.innerHTML = "";

    if (isFullCombo) {
        productName.innerHTML = "<span>TRỌN BỘ</span><strong>TÂM TRẠNG.</strong>";
    } else if (isCombo) {
        productName.innerHTML = "<span>TỔ HỢP</span><strong>TÂM TRẠNG.</strong>";
    } else {
        productName.innerHTML = `<span>MỘT CHÚT</span><strong>${primaryVisual.name.toUpperCase()}.</strong>`;
    }

    $("#productDescription").textContent = currentProduct.description ||
        (isCombo
            ? "Một bộ sưu tập những tâm trạng khác nhau, được tạo ra để đồng hành cùng bạn."
            : primaryVisual.description);

    $("#productCollection").textContent = isCombo
        ? "TỔ HỢP TÂM TRẠNG"
        : "PHIÊN BẢN CÓ THỂ MANG THEO";

    $("#productPatchCount").textContent =
        `${String(currentProduct.patches || 5).padStart(2, "0")} MIẾNG DÁN`;

    $("#productStory").textContent = isFullCombo
        ? "Năm tâm trạng, vô vàn khoảnh khắc nhỏ. Từ tìm lại sự tập trung đến thắp lên nguồn năng lượng riêng, Bộ Sưu Tập Trọn Vẹn cho phép bạn khám phá mọi khía cạnh của chính mình. Hãy chọn một tâm trạng phù hợp với bạn hôm nay, và một tâm trạng khác cho ngày mai."
        : isCombo
            ? `Tại sao chỉ chọn một tâm trạng? ${normalizedMoods.map(mood =>
                MOOD_VISUALS[mood]?.name || mood
            ).join(", ")} — một tổ hợp nhỏ dành cho mọi khía cạnh khác nhau trong bạn.`
            : primaryVisual.story;

    $("#insidePatchText").textContent =
        `Một hộp gồm ${currentProduct.patches || 5} miếng dán hương thơm, giúp bạn mang theo tâm trạng đã chọn bên mình.`;

    $("#universeMood").textContent = isFullCombo
        ? "MỌI TÂM TRẠNG"
        : isCombo
            ? "TỔ HỢP TÂM TRẠNG"
            : primaryVisual.name.toUpperCase();

    document.title = `${productDisplayName} — SCENTIE`;

    /* -----------------------------------------------------
       GIÁ SẢN PHẨM
    ----------------------------------------------------- */

    productPrice.textContent = formatMoney(currentProduct.price);

    if (currentProduct.originalPrice &&
        currentProduct.originalPrice > currentProduct.price) {

        originalPrice.textContent = formatMoney(currentProduct.originalPrice);
        originalPrice.hidden = false;

        const discountPercent = currentProduct.discount ||
            Math.round(
                (1 - currentProduct.price / currentProduct.originalPrice) * 100
            );

        discount.textContent = `-${discountPercent}%`;
        discount.hidden = false;

    } else {
        originalPrice.hidden = true;
        discount.hidden = true;
    }

    /* -----------------------------------------------------
       THẺ TÂM TRẠNG
    ----------------------------------------------------- */

    const moodContainer = $("#productMoods");

    moodContainer.innerHTML = normalizedMoods.map(mood => {
        const visual = getMoodVisual(mood);
        const moodName = MOOD_VISUALS[mood]?.name || mood;

        return `
            <span class="pd-mood-chip" style="--chip-color:${visual.color}">
                ${moodName}
            </span>
        `;
    }).join("");

    /* -----------------------------------------------------
       THƯ VIỆN HÌNH ẢNH SẢN PHẨM
    ----------------------------------------------------- */

    function createComboCollage() {
        const collage = document.createElement("div");

        collage.className = "pd-combo-collage";
        collage.style.cssText = `
            position:relative;
            z-index:2;
            display:grid;
            grid-template-columns:repeat(${imageMoods.length > 3 ? 3 : imageMoods.length},1fr);
            gap:5px;
            width:100%;
            align-items:center;
            justify-items:center;
            padding:12px;
        `;

        imageMoods.forEach((mood, index) => {
            const image = document.createElement("img");

            image.src = getMoodImage(mood);
            image.alt = `Miếng dán hương thơm ${MOOD_VISUALS[mood]?.name || mood}`;
            image.loading = "eager";

            image.style.cssText = `
                width:100%;
                height:${imageMoods.length > 3 ? "150px" : "190px"};
                object-fit:contain;
                filter:drop-shadow(0 12px 9px rgba(40,30,55,.16));
                transform:rotate(${(index % 2 === 0 ? -1 : 1) * 4}deg);
                transition:transform .35s ease;
            `;

            image.addEventListener("mouseenter", () => {
                image.style.transform = "translateY(-8px) rotate(0) scale(1.06)";
            });

            image.addEventListener("mouseleave", () => {
                image.style.transform =
                    `rotate(${(index % 2 === 0 ? -1 : 1) * 4}deg)`;
            });

            collage.appendChild(image);
        });

        return collage;
    }

    function setMainImage(index) {
        activeImageIndex = index;

        const selectedMood = imageMoods[index];

        if (!selectedMood) return;

        if (isCombo) {
            const oldCollage = mainProduct.querySelector(".pd-combo-collage");

            if (oldCollage) oldCollage.remove();

            mainImage.hidden = true;

            const collage = createComboCollage();

            mainProduct.insertBefore(collage, mainProduct.querySelector(".pd-product-shadow"));

        } else {
            const oldCollage = mainProduct.querySelector(".pd-combo-collage");

            if (oldCollage) oldCollage.remove();

            mainImage.hidden = false;
            mainImage.style.opacity = "0";

            const nextImage = getMoodImage(selectedMood);

            const preload = new Image();

            preload.onload = function () {
                mainImage.src = nextImage;
                mainImage.alt = `Miếng dán hương thơm ${MOOD_VISUALS[selectedMood].name}`;
                mainImage.style.opacity = "1";
            };

            preload.onerror = function () {
                mainImage.src = nextImage;
                mainImage.style.opacity = "1";
            };

            preload.src = nextImage;
        }

        document.querySelectorAll(".pd-thumbnail").forEach((thumbnail, i) => {
            thumbnail.classList.toggle("active", i === index);
        });
    }

    function renderThumbnails() {
        thumbnails.innerHTML = "";

        imageMoods.forEach((mood, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "pd-thumbnail";
            button.setAttribute("aria-label", `Xem tâm trạng ${MOOD_VISUALS[mood]?.name || mood}`);

            const image = document.createElement("img");
            image.src = getMoodImage(mood);
            image.alt = MOOD_VISUALS[mood]?.name || mood;

            button.appendChild(image);

            button.addEventListener("click", () => {
                setMainImage(index);
            });

            thumbnails.appendChild(button);
        });

        thumbnails.hidden = imageMoods.length <= 1;
    }

    renderThumbnails();
    setMainImage(0);

    /* -----------------------------------------------------
       SỐ LƯỢNG SẢN PHẨM
    ----------------------------------------------------- */

    function getQuantity() {
        const quantity = parseInt(quantityInput.value, 10);

        if (!Number.isFinite(quantity)) return 1;

        return Math.max(1, Math.min(99, quantity));
    }

    function updateQuantity(value) {
        quantityInput.value = Math.max(1, Math.min(99, value));
    }

    $("#quantityDecrease").addEventListener("click", () => {
        updateQuantity(getQuantity() - 1);
    });

    $("#quantityIncrease").addEventListener("click", () => {
        updateQuantity(getQuantity() + 1);
    });

    quantityInput.addEventListener("change", () => {
        updateQuantity(getQuantity());
    });

    /* -----------------------------------------------------
       GIỎ HÀNG
    ----------------------------------------------------- */

    function buildCartProduct() {
        return {
            ...currentProduct,
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            originalPrice: currentProduct.originalPrice || null,
            image: currentProduct.image ||
                (imageMoods.length ? getMoodImage(imageMoods[0]) : null),
            moods: productMoods,
            category: currentProduct.category,
            patches: currentProduct.patches,
            url: currentProduct.url
        };
    }

    function openCartModal() {
        $("#cartSuccessProduct").textContent =
            `${currentProduct.name} × ${getQuantity()}`;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        $("#cartSuccessClose").focus();
    }

    function closeCartModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    function addProductToCart() {
        if (!window.SCENTIE_CART ||
            typeof window.SCENTIE_CART.addItem !== "function") {

            alert("Không thể kết nối với giỏ hàng. Bà kiểm tra lại file cart.js nhé!");
            return false;
        }

        const product = buildCartProduct();
        const quantity = getQuantity();

        try {
            window.SCENTIE_CART.addItem(product, quantity);
            openCartModal();
            return true;
        } catch (error) {
            console.error("Lỗi giỏ hàng SCENTIE:", error);
            alert("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Bà thử lại nhé!");
            return false;
        }
    }

    addToCartBtn.addEventListener("click", addProductToCart);

    buyNowBtn.addEventListener("click", () => {
        if (addProductToCart()) {
            $("#cartSuccessTitle").innerHTML = "TÂM TRẠNG<br>ĐANG ĐẾN VỚI BẠN.";
        }
    });

    $("#cartSuccessClose").addEventListener("click", closeCartModal);
    $("#continueShoppingBtn").addEventListener("click", closeCartModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeCartModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeCartModal();
        }
    });

    /* -----------------------------------------------------
       SẢN PHẨM LIÊN QUAN
    ----------------------------------------------------- */

    function renderRelatedProducts() {
        const relatedGrid = $("#relatedProductsGrid");

        if (typeof SCENTIE_PRODUCTS === "undefined") return;

        let related = SCENTIE_PRODUCTS.filter(product =>
            product.visible !== false &&
            product.id !== currentProduct.id
        );

        if (!isCombo) {
            const sameMood = related.filter(product =>
                Array.isArray(product.moods) &&
                product.moods.some(mood =>
                    normalizedMoods.includes(getMoodKey(mood))
                )
            );

            related = [...sameMood, ...related.filter(product =>
                !sameMood.some(item => item.id === product.id)
            )];
        }

        related = related.slice(0, 4);

        relatedGrid.innerHTML = "";

        related.forEach(product => {
            const moods = Array.isArray(product.imageMoods) &&
                product.imageMoods.length
                ? product.imageMoods
                : Array.isArray(product.moods)
                    ? product.moods
                    : [];

            const first = getMoodKey(moods[0] || "calm");
            const color = getMoodVisual(first);

            const card = document.createElement("a");

            card.className = "pd-related-card";
            card.href = getRelatedUrl(product.url);

            card.style.setProperty("--card-color", color.light);

            const imageArea = document.createElement("div");
            imageArea.className = "pd-related-image";

            if (product.type === "combo" && moods.length > 1) {
                imageArea.style.display = "flex";
                imageArea.style.alignItems = "center";
                imageArea.style.justifyContent = "center";
                imageArea.style.gap = "0";

                moods.forEach((mood, index) => {
                    const image = document.createElement("img");

                    image.src = getMoodImage(mood);
                    image.alt = `Miếng dán hương thơm ${MOOD_VISUALS[mood]?.name || mood}`;
                    image.loading = "lazy";

                    image.style.width = `${Math.max(26, 76 / moods.length)}%`;
                    image.style.height = "150px";
                    image.style.marginLeft = index ? "-8%" : "0";
                    image.style.position = "relative";
                    image.style.zIndex = index + 1;

                    imageArea.appendChild(image);
                });

            } else {
                const image = document.createElement("img");

                image.src = getMoodImage(first);
                image.alt = product.name;
                image.loading = "lazy";

                imageArea.appendChild(image);
            }

            const type = document.createElement("span");
            type.className = "pd-related-type";
            type.textContent = product.category || "BỘ SƯU TẬP SCENTIE";

            const title = document.createElement("h3");
            title.textContent = product.name;

            const bottom = document.createElement("div");
            bottom.className = "pd-related-bottom";

            const price = document.createElement("span");
            price.className = "pd-related-price";
            price.textContent = formatMoney(product.price);

            const arrow = document.createElement("span");
            arrow.className = "pd-related-arrow";
            arrow.textContent = "↗";

            bottom.append(price, arrow);
            card.append(imageArea, type, title, bottom);

            relatedGrid.appendChild(card);
        });
    }

    function getRelatedUrl(url) {
        if (!url) return "shop.html";

        return url
            .replace(/^pages\//, "")
            .replace(/^\/+/, "");
    }

    renderRelatedProducts();

    /* -----------------------------------------------------
       VŨ TRỤ TÂM TRẠNG TƯƠNG TÁC
    ----------------------------------------------------- */

    const universeStage = $(".pd-universe-stage");

    if (universeStage) {
        universeStage.addEventListener("pointermove", event => {
            if (window.matchMedia("(pointer: coarse)").matches) return;

            const rect = universeStage.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - .5;
            const y = (event.clientY - rect.top) / rect.height - .5;

            const orbs = universeStage.querySelectorAll(".pd-universe-orb");

            orbs.forEach((orb, index) => {
                const strength = (index + 1) * 12;

                orb.style.translate =
                    `${x * strength}px ${y * strength}px`;
            });
        });

        universeStage.addEventListener("pointerleave", () => {
            universeStage.querySelectorAll(".pd-universe-orb").forEach(orb => {
                orb.style.translate = "";
            });
        });
    }

    /* -----------------------------------------------------
       HIỆU ỨNG THỊ GIÁC PARALLAX
    ----------------------------------------------------- */

    const visual = $(".pd-visual");

    if (visual && !window.matchMedia("(pointer: coarse)").matches) {
        visual.addEventListener("pointermove", event => {
            const rect = visual.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - .5;
            const y = (event.clientY - rect.top) / rect.height - .5;

            const product = $(".pd-main-product");

            if (product) {
                product.style.transform =
                    `translate(${x * 10}px, ${y * 10}px)`;
            }
        });

        visual.addEventListener("pointerleave", () => {
            const product = $(".pd-main-product");

            if (product) {
                product.style.transform = "";
            }
        });
    }

    /* -----------------------------------------------------
       HIỆU ỨNG HIỆN DẦN KHI CUỘN TRANG
    ----------------------------------------------------- */

    const revealTargets = document.querySelectorAll(
        ".pd-section-kicker, .pd-universe-heading, .pd-universe-stage, " +
        ".pd-universe-copy, .pd-inside-heading, .pd-inside-card, " +
        ".pd-howto-heading, .pd-step, .pd-related-heading, .pd-related-card"
    );

    revealTargets.forEach(element => {
        element.classList.add("pd-reveal");
    });

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: .12,
            rootMargin: "0px 0px -35px 0px"
        });

        revealTargets.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealTargets.forEach(element => {
            element.classList.add("is-visible");
        });
    }

    /* -----------------------------------------------------
       HIỆU ỨNG CHUỘT / KHẢ NĂNG TRUY CẬP
    ----------------------------------------------------- */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        document.querySelectorAll(".pd-reveal").forEach(element => {
            element.classList.add("is-visible");
        });
    }

});
