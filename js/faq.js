/* SCENTIE FAQ — category filtering, live search and accordion */
(() => {
  "use strict";
  const root = document.querySelector(".faq-page");
  if (!root) return;
  const search = document.getElementById("faqSearchInput");
  const form = document.getElementById("faqSearchForm");
  const categories = [...document.querySelectorAll(".faq-category")];
  const groups = [...document.querySelectorAll(".faq-group")];
  const items = [...document.querySelectorAll(".faq-item")];
  const noResults = document.getElementById("faqNoResults");
  const count = document.getElementById("faqResultCount");
  const expand = document.getElementById("faqExpandAll");
  let activeCategory = "all";
  let query = "";

  function update() {
    let visible = 0;
    groups.forEach(group => {
      const groupCategory = group.dataset.faqGroup;
      let groupVisible = 0;
      group.querySelectorAll(".faq-item").forEach(item => {
        const matchesCategory = activeCategory === "all" || item.dataset.category === activeCategory;
        const matchesQuery = !query || item.textContent.toLocaleLowerCase("vi").includes(query);
        const show = matchesCategory && matchesQuery;
        item.hidden = !show;
        if (show) { visible++; groupVisible++; }
        else item.classList.remove("is-open");
      });
      group.classList.toggle("is-hidden", groupVisible === 0);
    });
    count.textContent = `${visible} câu hỏi`;
    noResults.hidden = visible !== 0;
    expand.disabled = visible === 0;
    expand.innerHTML = items.some(item => !item.hidden && item.classList.contains("is-open"))
      ? 'Thu gọn tất cả <span>−</span>' : 'Mở tất cả <span>＋</span>';
  }

  categories.forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.faqCategory;
    categories.forEach(x => {
      const active = x === button;
      x.classList.toggle("is-active", active);
      x.setAttribute("aria-pressed", String(active));
    });
    update();
  }));

  form.addEventListener("submit", event => { event.preventDefault(); query = search.value.trim().toLocaleLowerCase("vi"); update(); });
  search.addEventListener("input", () => { query = search.value.trim().toLocaleLowerCase("vi"); update(); });
  document.querySelectorAll("[data-faq-suggest]").forEach(button => button.addEventListener("click", () => {
    search.value = button.dataset.faqSuggest;
    query = search.value.toLocaleLowerCase("vi");
    update();
    document.querySelector(".faq-main-section").scrollIntoView({behavior:"smooth",block:"start"});
  }));
  document.getElementById("faqClearSearch").addEventListener("click", () => {
    search.value = ""; query = ""; activeCategory = "all";
    categories.forEach(x => { const active = x.dataset.faqCategory === "all"; x.classList.toggle("is-active",active); x.setAttribute("aria-pressed",String(active)); });
    update();
  });

  items.forEach(item => {
    const button = item.querySelector(".faq-question");
    button.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      updateExpandLabel();
    });
  });
  function updateExpandLabel() {
    const visibleItems = items.filter(item => !item.hidden);
    const allOpen = visibleItems.length > 0 && visibleItems.every(item => item.classList.contains("is-open"));
    expand.innerHTML = allOpen ? 'Thu gọn tất cả <span>−</span>' : 'Mở tất cả <span>＋</span>';
  }
  expand.addEventListener("click", () => {
    const visibleItems = items.filter(item => !item.hidden);
    const shouldOpen = !visibleItems.every(item => item.classList.contains("is-open"));
    visibleItems.forEach(item => {
      item.classList.toggle("is-open", shouldOpen);
      item.querySelector(".faq-question").setAttribute("aria-expanded", String(shouldOpen));
    });
    updateExpandLabel();
  });
  update();
})();
