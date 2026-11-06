
/* =========================================
   SCENTIE - PRODUCT DATABASE
   ========================================= */

const SCENTIE_PRODUCTS = [
    // SINGLE MOOD
    {
        id: "focus",
        name: "Focus",
        category: "Single Mood",
        type: "single",
        mood: "Focus",
        moods: ["Focus"],
        selection: "fixed",
        patches: 5,
        price: 69000,
        image: "assets/images/mockups/mockup-focus.png",
        description: "A little clarity for your busiest days.",
        keywords: [
            "focus", "tập trung", "làm việc", "học tập",
            "productivity", "sage green"
        ],
        url: "pages/product-detail.html?mood=focus"
    },
    {
        id: "energy",
        name: "Energy",
        category: "Single Mood",
        type: "single",
        mood: "Energy",
        moods: ["Energy"],
        selection: "fixed",
        patches: 5,
        price: 69000,
        image: "assets/images/mockups/mockup-energy.png",
        description: "A spark of energy to brighten your day.",
        keywords: [
            "energy", "năng lượng", "năng động", "tươi vui",
            "vui vẻ", "pastel yellow"
        ],
        url: "pages/product-detail.html?mood=energy"
    },
    {
        id: "calm",
        name: "Calm",
        category: "Single Mood",
        type: "single",
        mood: "Calm",
        moods: ["Calm"],
        selection: "fixed",
        patches: 5,
        price: 69000,
        image: "assets/images/mockups/mockup-calm.png",
        description: "A soft moment to slow down and breathe.",
        keywords: [
            "calm", "thư giãn", "bình yên", "nhẹ nhàng",
            "relax", "lavender"
        ],
        url: "pages/product-detail.html?mood=calm"
    },
    {
        id: "date",
        name: "Date",
        category: "Single Mood",
        type: "single",
        mood: "Date",
        moods: ["Date"],
        selection: "fixed",
        patches: 5,
        price: 69000,
        image: "assets/images/mockups/mockup-date.png",
        description: "A little confidence for your special moments.",
        keywords: [
            "date", "hẹn hò", "lãng mạn", "tự tin",
            "romantic", "blush"
        ],
        url: "pages/product-detail.html?mood=date"
    },
    {
        id: "fun",
        name: "Fun",
        category: "Single Mood",
        type: "single",
        mood: "Fun",
        moods: ["Fun"],
        selection: "fixed",
        patches: 5,
        price: 69000,
        image: "assets/images/mockups/mockup-fun.png",
        description: "A playful touch for your everyday adventures.",
        keywords: [
            "fun", "vui nhộn", "khám phá", "sáng tạo",
            "playful", "baby blue"
        ],
        url: "pages/product-detail.html?mood=fun"
    },


    // SPECIAL EDITION - COMING SOON
    // Giữ trong database để cập nhật sau, chưa hiển thị trên Shop
    {
        id: "trial-pack",
        name: "Trial Pack",
        category: "Special Edition",
        type: "trial",
        mood: "Surprise",
        moods: [],
        selection: "random",
        patches: 2,
        price: 29000,
        image: null,
        visible: false,
        description: "Two random fragrance patches. Discover your mood!",
        keywords: [
            "trial", "trial pack", "dùng thử", "trải nghiệm",
            "random", "surprise", "2 patches", "2 miếng"
        ],
        url: "pages/product-detail.html?product=trial-pack"
    },

    // FULL MOOD COMBO
    {
        id: "full-mood-combo",
        name: "Full Mood Combo",
        category: "Mood Combo",
        type: "combo",
        mood: "All Moods",
        moods: ["Focus", "Energy", "Calm", "Date", "Fun"],
        imageMoods: ["focus", "energy", "calm", "date", "fun"],
        selection: "all",
        patches: 25,
        price: 230000,
        originalPrice: 329000,
        discount: 30,
        image: null,
        visible: true,
        description: "All five moods, one complete collection.",
        keywords: [
            "full", "full mood", "full combo", "all moods",
            "five moods", "5 moods", "đầy đủ", "trọn bộ",
            "năm mood"
        ],
        url: "pages/product-detail.html?product=full-mood-combo"
    },

    // TRIPLE MOOD COMBO 5C3 = 10 COMBINATIONS

    {
        id: "triple-focus-energy-calm",
        name: "Focus · Energy · Calm",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Focus", "Energy", "Calm"],
        imageMoods: ["focus", "energy", "calm"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of clarity, energy and calm.",
        keywords: ["triple", "focus", "energy", "calm", "3 moods"],
        url: "pages/product-detail.html?product=triple-focus-energy-calm"
    },

    {
        id: "triple-focus-energy-date",
        name: "Focus · Energy · Date",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Focus", "Energy", "Date"],
        imageMoods: ["focus", "energy", "date"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of focus, energy and confidence.",
        keywords: ["triple", "focus", "energy", "date", "3 moods"],
        url: "pages/product-detail.html?product=triple-focus-energy-date"
    },

    {
        id: "triple-focus-energy-fun",
        name: "Focus · Energy · Fun",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Focus", "Energy", "Fun"],
        imageMoods: ["focus", "energy", "fun"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of productivity, energy and playfulness.",
        keywords: ["triple", "focus", "energy", "fun", "3 moods"],
        url: "pages/product-detail.html?product=triple-focus-energy-fun"
    },

    {
        id: "triple-focus-calm-date",
        name: "Focus · Calm · Date",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Focus", "Calm", "Date"],
        imageMoods: ["focus", "calm", "date"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of clarity, calm and romance.",
        keywords: ["triple", "focus", "calm", "date", "3 moods"],
        url: "pages/product-detail.html?product=triple-focus-calm-date"
    },

    {
        id: "triple-focus-calm-fun",
        name: "Focus · Calm · Fun",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Focus", "Calm", "Fun"],
        imageMoods: ["focus", "calm", "fun"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of focus, serenity and creativity.",
        keywords: ["triple", "focus", "calm", "fun", "3 moods"],
        url: "pages/product-detail.html?product=triple-focus-calm-fun"
    },

    {
        id: "triple-focus-date-fun",
        name: "Focus · Date · Fun",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Focus", "Date", "Fun"],
        imageMoods: ["focus", "date", "fun"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of confidence, romance and fun.",
        keywords: ["triple", "focus", "date", "fun", "3 moods"],
        url: "pages/product-detail.html?product=triple-focus-date-fun"
    },

    {
        id: "triple-energy-calm-date",
        name: "Energy · Calm · Date",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Energy", "Calm", "Date"],
        imageMoods: ["energy", "calm", "date"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of energy, relaxation and romance.",
        keywords: ["triple", "energy", "calm", "date", "3 moods"],
        url: "pages/product-detail.html?product=triple-energy-calm-date"
    },

    {
        id: "triple-energy-calm-fun",
        name: "Energy · Calm · Fun",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Energy", "Calm", "Fun"],
        imageMoods: ["energy", "calm", "fun"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of energy, serenity and playfulness.",
        keywords: ["triple", "energy", "calm", "fun", "3 moods"],
        url: "pages/product-detail.html?product=triple-energy-calm-fun"
    },

    {
        id: "triple-energy-date-fun",
        name: "Energy · Date · Fun",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Energy", "Date", "Fun"],
        imageMoods: ["energy", "date", "fun"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of vibrant energy, romance and fun.",
        keywords: ["triple", "energy", "date", "fun", "3 moods"],
        url: "pages/product-detail.html?product=triple-energy-date-fun"
    },

    {
        id: "triple-calm-date-fun",
        name: "Calm · Date · Fun",
        category: "Mood Combo",
        type: "combo",
        mood: "Triple Mood",
        moods: ["Calm", "Date", "Fun"],
        imageMoods: ["calm", "date", "fun"],
        selection: "fixed",
        patches: 15,
        price: 199000,
        image: null,
        visible: true,
        description: "A combination of calm, romance and playful moments.",
        keywords: ["triple", "calm", "date", "fun", "3 moods"],
        url: "pages/product-detail.html?product=triple-calm-date-fun"
    }
];



/* =========================================
   HELPER FUNCTIONS
   ========================================= */

// Format price: 69.000đ
function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}


// Find product by ID
function getProductById(id) {
    return SCENTIE_PRODUCTS.find(product => product.id === id);
}


// Find products by mood
function getProductsByMood(mood) {
    const normalizedMood = mood.toLowerCase();

    return SCENTIE_PRODUCTS.filter(product =>
        product.moods.some(item =>
            item.toLowerCase() === normalizedMood
        )
    );
}


// Search products by keyword
function searchProducts(keyword) {
    const normalizedKeyword = keyword
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    if (!normalizedKeyword) return [];

    return SCENTIE_PRODUCTS.filter(product => {
        const searchableText = [
            product.name,
            product.category,
            product.mood,
            product.description,
            ...product.moods,
            ...product.keywords
        ]
            .join(" ")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return searchableText.includes(normalizedKeyword);
    });
}



/* =========================================
   SCENTIE — MOBILE FILTER TOGGLE
   Chỉ điều khiển đóng / mở sidebar trên mobile
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("shopFilterSidebar");
    const toggleButton = document.getElementById("shopFilterToggle");

    if (!sidebar || !toggleButton) return;

    const toggleText = toggleButton.querySelector(".shop-filter-toggle-text");
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    function closeFilter() {
        sidebar.classList.remove("is-open");
        toggleButton.setAttribute("aria-expanded", "false");

        if (toggleText) {
            toggleText.textContent = "Mở bộ lọc";
        }
    }

    toggleButton.addEventListener("click", function () {
        if (!mobileQuery.matches) return;

        const isOpen = sidebar.classList.toggle("is-open");

        toggleButton.setAttribute("aria-expanded", String(isOpen));

        if (toggleText) {
            toggleText.textContent = isOpen ? "Thu gọn" : "Mở bộ lọc";
        }
    });

    function handleScreenChange(event) {
        if (!event.matches) {
            closeFilter();
        }
    }

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener("change", handleScreenChange);
    } else {
        mobileQuery.addListener(handleScreenChange);
    }
});
