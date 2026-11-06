
/* =========================================
   SCENTIE - LIVE SEARCH
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const searchOpenBtn = document.getElementById("searchOpenBtn");
    const searchCloseBtn = document.getElementById("searchCloseBtn");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.getElementById("searchForm");
    const searchLiveResults = document.getElementById("searchLiveResults");
    const searchTags = document.querySelectorAll(".search-tags button");

    if (!searchOverlay || !searchInput || !searchForm) return;


    // OPEN SEARCH
    function openSearch() {
        searchOverlay.classList.add("active");
        searchOverlay.setAttribute("aria-hidden", "false");

        if (searchOpenBtn) {
            searchOpenBtn.setAttribute("aria-expanded", "true");
        }

        setTimeout(() => searchInput.focus(), 150);
    }


    // CLOSE SEARCH
    function closeSearch() {
        searchOverlay.classList.remove("active");
        searchOverlay.setAttribute("aria-hidden", "true");

        if (searchOpenBtn) {
            searchOpenBtn.setAttribute("aria-expanded", "false");
            searchOpenBtn.focus();
        }
    }


    // OPEN / CLOSE EVENTS
    searchOpenBtn?.addEventListener("click", openSearch);
    searchCloseBtn?.addEventListener("click", closeSearch);


    // CLOSE WHEN CLICKING OUTSIDE PANEL
    searchOverlay.addEventListener("click", (event) => {
        if (event.target === searchOverlay) {
            closeSearch();
        }
    });


    // CLOSE WITH ESCAPE
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && searchOverlay.classList.contains("active")) {
            closeSearch();
        }
    });


    // NORMALIZE TEXT
    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }


    // FORMAT PRICE
    function displayPrice(price) {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }


    // CREATE SEARCH RESULT
    function createResultItem(product) {
        const link = document.createElement("a");
        link.className = "search-result-item";
        link.href = product.url;

        const info = document.createElement("div");
        info.className = "search-result-info";

        const name = document.createElement("span");
        name.className = "search-result-name";
        name.textContent = product.name;

        const category = document.createElement("span");
        category.className = "search-result-category";
        category.textContent = product.category;

        const price = document.createElement("span");
        price.className = "search-result-price";
        price.textContent = displayPrice(product.price);

        info.append(name, category);

        link.append(info, price);

        return link;
    }


    // RENDER LIVE SUGGESTIONS
    function renderSuggestions(keyword) {

        searchLiveResults.innerHTML = "";

        if (!keyword.trim()) {
            searchLiveResults.classList.remove("visible");
            return;
        }

        const normalizedKeyword = normalizeText(keyword);

        const products = SCENTIE_PRODUCTS.filter(product => {

            const searchableContent = [
                product.name,
                product.category,
                product.mood,
                product.description,
                ...product.moods,
                ...product.keywords
            ]
                .join(" ")
                .toLowerCase();

            return normalizeText(searchableContent)
                .includes(normalizedKeyword);
        });

        searchLiveResults.classList.add("visible");

        if (products.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "search-no-results";
            emptyMessage.textContent = "Chưa tìm thấy sản phẩm phù hợp. Thử một từ khóa khác nhé!";
            searchLiveResults.appendChild(emptyMessage);
            return;
        }

        const heading = document.createElement("p");
        heading.className = "search-results-heading";
        heading.textContent = `SẢN PHẨM GỢI Ý (${products.length})`;

        const list = document.createElement("div");
        list.className = "search-results-list";

        products.slice(0, 6).forEach(product => {
            list.appendChild(createResultItem(product));
        });

        searchLiveResults.append(heading, list);
    }


    // LIVE SEARCH WHILE TYPING
    searchInput.addEventListener("input", () => {
        renderSuggestions(searchInput.value);
    });


    // CLICK MOOD TAGS
    searchTags.forEach(button => {
        button.addEventListener("click", () => {

            const mood = button.dataset.mood;

            searchInput.value = mood;
            renderSuggestions(mood);

            searchInput.focus();
        });
    });


    // SUBMIT SEARCH
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const keyword = searchInput.value.trim();

        if (!keyword) return;

        const matchedProducts = SCENTIE_PRODUCTS.filter(product => {

            const searchableContent = [
                product.name,
                product.category,
                product.mood,
                product.description,
                ...product.moods,
                ...product.keywords
            ].join(" ");

            return normalizeText(searchableContent)
                .includes(normalizeText(keyword));
        });

        // If there is an exact product match, open its detail page
        if (matchedProducts.length === 1) {
            window.location.href = matchedProducts[0].url;
            return;
        }

        // Otherwise, open Shop with the search keyword
        const url = new URL("pages/shop.html", window.location.href);
        url.searchParams.set("search", keyword);

        window.location.href = url.toString();
    });

});
