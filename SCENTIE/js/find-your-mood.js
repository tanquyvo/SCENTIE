
/* =========================================================
   SCENTIE — FIND YOUR MOOD
   Five-question weighted mood discovery
   Requires ../js/products.js to load before this file.
   ========================================================= */
(() => {
    "use strict";

    const $ = (selector, root = document) => root.querySelector(selector);
    const quizIntro = $("#quizIntro");
    const quizPanel = $("#quizPanel");
    const quizResult = $("#quizResult");
    const startButton = $("#quizStartBtn");
    const nextButton = $("#quizNextBtn");
    const backButton = $("#quizBackBtn");
    const retakeButton = $("#quizRetakeBtn");
    const questionTitle = $("#quizQuestion");
    const questionKicker = $("#quizQuestionKicker");
    const questionHint = $("#quizQuestionHint");
    const optionsWrap = $("#quizOptions");
    const stepLabel = $("#quizStepLabel");
    const percentLabel = $("#quizPercent");
    const progressFill = $("#quizProgressFill");

    if (!quizIntro || !quizPanel || !optionsWrap) return;

    const moods = ["focus", "energy", "calm", "date", "fun"];

    const questions = [
        {
            kicker: "ĐIỀU GÌ KHIẾN BẠN CẢM THẤY LÀ CHÍNH MÌNH?",
            title: "Khi có một ngày hoàn toàn dành cho bản thân, bạn muốn tận hưởng nó như thế nào?",
            hint: "Hãy chọn hoạt động khiến bạn thấy hào hứng nhất.",
            answers: [
                ["Dành thời gian hoàn thành mục tiêu còn dang dở.", "focus"],
                ["Thử một điều mới, đi đây đó và gặp gỡ mọi người.", "energy"],
                ["Ở một nơi yên tĩnh, đọc sách hoặc nghỉ ngơi.", "calm"],
                ["Chuẩn bị thật chỉn chu cho một buổi hẹn đặc biệt.", "date"],
                ["Làm bất cứ điều gì ngẫu hứng khiến mình vui.", "fun"]
            ]
        },
        {
            kicker: "BẠN THƯỜNG TÌM THẤY NĂNG LƯỢNG Ở ĐÂU?",
            title: "Trong một tập thể, bạn thường là người như thế nào?",
            hint: "Không cần suy nghĩ quá lâu — hãy chọn điều giống bạn nhất.",
            answers: [
                ["Người lên kế hoạch, giữ mọi thứ đi đúng hướng.", "focus"],
                ["Người khuấy động không khí và truyền cảm hứng.", "energy"],
                ["Người lắng nghe, quan sát và tạo cảm giác dễ chịu.", "calm"],
                ["Người tinh tế, quan tâm đến cảm xúc của mọi người.", "date"],
                ["Người tạo ra những ý tưởng bất ngờ và tiếng cười.", "fun"]
            ]
        },
        {
            kicker: "ĐIỀU GÌ ĐANG ĐƯỢC BẠN ƯU TIÊN?",
            title: "Nếu được chọn một điều cho giai đoạn hiện tại, bạn muốn điều gì nhất?",
            hint: "Hãy nghĩ về điều bạn thực sự cần ngay lúc này.",
            answers: [
                ["Sự rõ ràng để tập trung và tiến gần mục tiêu.", "focus"],
                ["Một cú hích để bắt đầu và bứt phá.", "energy"],
                ["Khoảng lặng để cân bằng và hồi phục.", "calm"],
                ["Sự kết nối và những cảm xúc thật đẹp.", "date"],
                ["Sự tự do để trải nghiệm và khám phá.", "fun"]
            ]
        },
        {
            kicker: "MỘT KHÔNG GIAN MANG ĐẬM CHẤT BẠN",
            title: "Bạn muốn không gian quanh mình mang lại cảm giác nào?",
            hint: "Hãy chọn bầu không khí khiến bạn muốn ở lại lâu hơn.",
            answers: [
                ["Gọn gàng, tối giản và giúp mình tập trung.", "focus"],
                ["Rực rỡ, sôi động và đầy sức sống.", "energy"],
                ["Thoáng đãng, dịu nhẹ và thư thái.", "calm"],
                ["Ấm áp, lãng mạn và có chút tinh tế.", "date"],
                ["Đầy màu sắc, vui nhộn và không theo khuôn mẫu.", "fun"]
            ]
        },
        {
            kicker: "VÀ CUỐI CÙNG, BẠN MUỐN MANG THEO ĐIỀU GÌ?",
            title: "Khi bước ra ngoài, bạn muốn người khác cảm nhận điều gì từ mình?",
            hint: "Đây là lựa chọn cuối cùng trước khi SCENTIE bật mí kết quả.",
            answers: [
                ["Sự tự tin, chỉn chu và đáng tin cậy.", "focus"],
                ["Nguồn năng lượng tích cực, đầy cuốn hút.", "energy"],
                ["Sự nhẹ nhàng, bình thản và dễ chịu.", "calm"],
                ["Nét quyến rũ, tinh tế và khó quên.", "date"],
                ["Cá tính tự do, vui vẻ và khác biệt.", "fun"]
            ]
        }
    ];

    const moodResults = {
        focus: {
            name: "FOCUS",
            tagline: "Tập trung · Quyết đoán",
            description: "Bạn yêu thích sự rõ ràng, chủ động và cảm giác làm chủ hành trình của mình. Bạn luôn muốn dành năng lượng cho những điều thực sự quan trọng — một chút tập trung sẽ giúp bạn tiến xa hơn.",
            image: "../assets/images/mockups/mockup-focus.png",
            productId: "focus"
        },
        energy: {
            name: "ENERGY",
            tagline: "Năng động · Tích cực",
            description: "Bạn mang trong mình nguồn năng lượng tươi mới và tinh thần luôn sẵn sàng bắt đầu. Bạn thích khám phá, kết nối và lan tỏa sự tích cực đến thế giới xung quanh.",
            image: "../assets/images/mockups/mockup-energy.png",
            productId: "energy"
        },
        calm: {
            name: "CALM",
            tagline: "Bình yên · Thư thái",
            description: "Bạn trân trọng những khoảng lặng và biết cách lắng nghe chính mình. Với bạn, đôi khi chậm lại, hít thở sâu và tận hưởng hiện tại chính là cách nạp lại năng lượng tuyệt vời nhất.",
            image: "../assets/images/mockups/mockup-calm.png",
            productId: "calm"
        },
        date: {
            name: "DATE",
            tagline: "Dịu dàng · Cuốn hút",
            description: "Bạn yêu những rung động tinh tế, sự kết nối và những khoảnh khắc được chăm chút. Bạn có nét cuốn hút riêng — nhẹ nhàng nhưng đủ để khiến người khác nhớ đến.",
            image: "../assets/images/mockups/mockup-date.png",
            productId: "date"
        },
        fun: {
            name: "FUN",
            tagline: "Tự do · Ngẫu hứng",
            description: "Bạn thích sống theo cách riêng, luôn tò mò với những điều mới mẻ và không ngại khác biệt. Với bạn, cuộc sống thú vị nhất khi được tự do thử nghiệm và tận hưởng từng khoảnh khắc.",
            image: "../assets/images/mockups/mockup-fun.png",
            productId: "fun"
        }
    };

    let currentQuestion = 0;
    const answers = new Array(questions.length).fill(null);

    function renderQuestion() {
        const question = questions[currentQuestion];
        questionKicker.textContent = question.kicker;
        questionTitle.textContent = question.title;
        questionHint.textContent = question.hint;
        stepLabel.textContent = `CÂU HỎI ${String(currentQuestion + 1).padStart(2, "0")} / 05`;
        percentLabel.textContent = `${Math.round(((currentQuestion + 1) / questions.length) * 100)}%`;
        progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
        optionsWrap.innerHTML = "";

        question.answers.forEach(([label, mood], index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "quiz-option";
            button.setAttribute("aria-pressed", answers[currentQuestion] === mood ? "true" : "false");
            button.innerHTML = `<span class="quiz-option__letter">${String.fromCharCode(65 + index)}</span><span></span>`;
            button.querySelector("span:last-child").textContent = label;
            button.addEventListener("click", () => {
                answers[currentQuestion] = mood;
                optionsWrap.querySelectorAll(".quiz-option").forEach(option => option.setAttribute("aria-pressed", "false"));
                button.setAttribute("aria-pressed", "true");
                nextButton.disabled = false;
            });
            optionsWrap.appendChild(button);
        });

        backButton.disabled = currentQuestion === 0;
        nextButton.disabled = !answers[currentQuestion];
        nextButton.innerHTML = currentQuestion === questions.length - 1 ? 'XEM KẾT QUẢ <span>✦</span>' : 'TIẾP THEO <span>→</span>';
        $("#quizQuestionWrap").style.animation = "none";
        requestAnimationFrame(() => { $("#quizQuestionWrap").style.animation = ""; });
    }

    function calculateMood() {
        const scores = Object.fromEntries(moods.map(mood => [mood, 0]));
        answers.forEach(mood => { if (mood && scores[mood] !== undefined) scores[mood] += 1; });

        // Stable tie-break: the last answer breaks a tie; remaining ties follow a fixed order.
        const highest = Math.max(...Object.values(scores));
        const tied = moods.filter(mood => scores[mood] === highest);
        const lastAnswer = answers[answers.length - 1];
        return tied.includes(lastAnswer) ? lastAnswer : tied[0];
    }

    function showResult() {
        const mood = calculateMood();
        const result = moodResults[mood];
        const productList = typeof SCENTIE_PRODUCTS !== "undefined" ? SCENTIE_PRODUCTS : [];
        const product = Array.isArray(productList)
            ? productList.find(item => item.id === result.productId)
            : null;

        $("#resultMoodName").innerHTML = `${result.name}<span>.</span>`;
        $("#resultMoodDescription").textContent = result.description;
        $("#resultMoodImage").src = result.image;
        $("#resultMoodImage").alt = `Hình ảnh mood ${result.name}`;
        $("#resultProductName").textContent = product?.name || result.name;
        $("#resultProductDescription").textContent = product?.description || result.tagline;
        $("#resultProductPrice").textContent = product?.price
            ? `${Number(product.price).toLocaleString("vi-VN")}đ`
            : "69.000đ";
        $("#resultProductLink").href = product?.url
            ? `../${product.url}`
            : `product-detail.html?mood=${mood}`;

        quizPanel.hidden = true;
        quizResult.hidden = false;
        quizResult.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    startButton.addEventListener("click", () => {
        quizIntro.hidden = true;
        quizResult.hidden = true;
        quizPanel.hidden = false;
        currentQuestion = 0;
        renderQuestion();
        quizPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    nextButton.addEventListener("click", () => {
        if (!answers[currentQuestion]) return;
        if (currentQuestion === questions.length - 1) {
            showResult();
            return;
        }
        currentQuestion += 1;
        renderQuestion();
    });

    backButton.addEventListener("click", () => {
        if (currentQuestion <= 0) return;
        currentQuestion -= 1;
        renderQuestion();
    });

    retakeButton.addEventListener("click", () => {
        answers.fill(null);
        currentQuestion = 0;
        quizResult.hidden = true;
        quizPanel.hidden = true;
        quizIntro.hidden = false;
        quizIntro.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    // The mood cards are visual discovery cards, not quiz shortcuts.
    // Pointer tilt is intentionally subtle and disabled on touch devices.
    document.querySelectorAll(".mood-card").forEach(card => {
        card.addEventListener("pointermove", event => {
            if (event.pointerType !== "mouse") return;
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-10px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
        });
        card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
})();
