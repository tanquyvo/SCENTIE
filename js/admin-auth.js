
/* =====================================================
   SCENTIE ADMIN — AUTHENTICATION & AUTHORIZATION
   Supabase Auth + Admin Role Verification
   ===================================================== */

(function () {
    "use strict";

    const client = window.scentieSupabase;

    if (!client) {
        console.error("[SCENTIE ADMIN] Supabase client not found.");
        return;
    }

    const loginForm = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const loginButton = document.getElementById("adminLoginButton");
    const messageElement = document.getElementById("adminLoginMessage");

    if (!loginForm || !emailInput || !passwordInput || !loginButton) {
        console.error("[SCENTIE ADMIN] Login elements not found.");
        return;
    }

    function showMessage(message, type = "error") {
        messageElement.textContent = message;
        messageElement.dataset.type = type;
    }

    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loginButton.textContent = isLoading
            ? "Đang xác thực..."
            : "Đăng nhập Admin";
    }

    async function verifyAdmin() {
        const { data, error } = await client.rpc("is_admin");

        if (error) {
            console.error("[SCENTIE ADMIN] Permission check failed:", error);
            throw new Error("Không thể xác minh quyền quản trị. Vui lòng thử lại.");
        }

        return data === true;
    }

    async function checkExistingSession() {
        try {
            const { data, error } = await client.auth.getSession();

            if (error) throw error;

            if (!data.session) return;

            const isAdmin = await verifyAdmin();

            if (isAdmin) {
                window.location.replace("./index.html");
                return;
            }

            await client.auth.signOut();
        } catch (error) {
            console.error("[SCENTIE ADMIN] Session check failed:", error);
        }
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        setLoading(true);
        showMessage("");

        try {
            // 1. Authenticate account
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw new Error("Email hoặc mật khẩu không chính xác.");
            }

            if (!data.user) {
                throw new Error("Không thể xác định tài khoản đăng nhập.");
            }

            // 2. Verify Admin permission from database
            const isAdmin = await verifyAdmin();

            if (!isAdmin) {
                await client.auth.signOut();

                throw new Error(
                    "Tài khoản này không có quyền truy cập Admin."
                );
            }

            // 3. Redirect authorized Admin
            showMessage("Xác thực thành công. Đang chuyển trang...", "success");

            window.location.replace("./index.html");

        } catch (error) {
            console.error("[SCENTIE ADMIN] Login failed:", error);
            showMessage(error.message || "Đăng nhập thất bại.");
        } finally {
            setLoading(false);
        }
    });

    checkExistingSession();

    console.info("[SCENTIE ADMIN] Authentication module initialized.");

})();
