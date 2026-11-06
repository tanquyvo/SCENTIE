
/* ========================================
   SCENTIE - HOMEPAGE MOOD QUIZ
   ======================================== */

const quizOptions = document.querySelectorAll(".quiz-option");

const quizResult = document.getElementById("quizResult");
const quizResultTitle = document.getElementById("quizResultTitle");
const quizResultDescription = document.getElementById("quizResultDescription");
const quizResultLink = document.getElementById("quizResultLink");

const moodSuggestions = {
    focus: {
        title: "YOUR FOCUS ERA 📚",
        description: "Bạn đang muốn tập trung và làm chủ những mục tiêu của mình. FOCUS có thể là mood bạn muốn khám phá hôm nay.",
        link: "pages/shop.html?mood=focus"
    },

    energy: {
        title: "LET'S GET ENERGIZED ⚡",
        description: "Bạn đang muốn nạp đầy năng lượng và lan tỏa sự tích cực. Thử khám phá ENERGY nhé!",
        link: "pages/shop.html?mood=energy"
    },

    calm: {
        title: "TAKE IT SLOW ☁️",
        description: "Đôi khi điều tuyệt nhất là cho bản thân một khoảng lặng. CALM có thể là lựa chọn dành cho bạn.",
        link: "pages/shop.html?mood=calm"
    },

    date: {
        title: "A LITTLE ROMANCE 💗",
        description: "Một chút dịu dàng, một chút cuốn hút. DATE sẽ giúp bạn khám phá mood lãng mạn của mình.",
        link: "pages/shop.html?mood=date"
    },

    fun: {
        title: "LET'S HAVE SOME FUN 🎉",
        description: "Bạn muốn tự do thể hiện cá tính và tận hưởng từng khoảnh khắc. FUN đang chờ bạn khám phá!",
        link: "pages/shop.html?mood=fun"
    }
};


// Xử lý khi người dùng chọn mood

quizOptions.forEach(option => {
    option.addEventListener("click", () => {

        // Bỏ trạng thái active ở các lựa chọn khác

        quizOptions.forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
        });

        // Đánh dấu lựa chọn hiện tại

        option.classList.add("active");
        option.setAttribute("aria-pressed", "true");

        // Lấy mood được chọn

        const selectedMood = option.dataset.mood;
        const result = moodSuggestions[selectedMood];

        if (!result) return;

        // Hiển thị kết quả

        quizResultTitle.textContent = result.title;
        quizResultDescription.textContent = result.description;
        quizResultLink.href = result.link;

        quizResult.classList.add("show");

        // Cuộn nhẹ đến kết quả trên màn hình nhỏ

        if (window.innerWidth <= 767) {
            quizResult.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    });
});
