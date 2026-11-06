/* =========================================================
   SCENTIE — CHECKOUT
   Uses the existing cart API and trusted create-order Edge Function.
   Frontend totals are display-only; the server recalculates prices.
   ========================================================= */
(() => {
    "use strict";

    const $ = id => document.getElementById(id);
    const form = $("checkoutForm");
    if (!form) return;

    const cart = window.SCENTIE_CART;
    const client = window.scentieSupabase;
    const SHIPPING_FEE = 30000;
    const submitButton = $("placeOrderBtn");
    const message = $("checkoutMessage");

    const money = value =>
        new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + "đ";

    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));

    function showMessage(text, type = "error") {
        message.textContent = text;
        message.hidden = !text;
        message.classList.toggle("is-error", type === "error");
        message.classList.toggle("is-success", type === "success");
    }

    function setSubmitting(isSubmitting) {
        submitButton.disabled = isSubmitting;
        submitButton.classList.toggle("is-loading", isSubmitting);
        submitButton.innerHTML = isSubmitting
            ? '<span>ĐANG XỬ LÝ ĐƠN HÀNG...</span><b>◌</b>'
            : '<span>HOÀN TẤT ĐẶT HÀNG</span><b>↗</b>';
    }

    function normalizeImagePath(image) {
        const raw = String(image || "../assets/images/logo/logo-scentie-den.png");
        if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("../")) return raw;
        return raw.startsWith("assets/") ? `../${raw}` : raw;
    }

    function renderSummary() {
        if (!cart || typeof cart.getCart !== "function") {
            showMessage("Không thể tải giỏ hàng. Vui lòng tải lại trang.");
            submitButton.disabled = true;
            return false;
        }

        const items = cart.getCart();
        if (!items.length) {
            window.location.replace("cart.html");
            return false;
        }

        $("checkoutItems").innerHTML = items.map(item => {
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const price = Math.max(0, Number(item.price) || 0);
            const image = escapeHTML(normalizeImagePath(item.image));
            return `
                <article class="checkout-item">
                    <div class="checkout-item-image">
                        <img src="${image}" alt="${escapeHTML(item.name)}" loading="lazy">
                    </div>
                    <div class="checkout-item-copy">
                        <strong>${escapeHTML(item.name)}</strong>
                        <small>Số lượng: ${quantity}</small>
                    </div>
                    <b>${money(price * quantity)}</b>
                </article>
            `;
        }).join("");

        const subtotal = cart.getSubtotal();
        $("checkoutSubtotal").textContent = money(subtotal);
        $("checkoutShippingFee").textContent = money(SHIPPING_FEE);
        $("checkoutTotal").textContent = money(subtotal + SHIPPING_FEE);
        return true;
    }

    async function prefillCustomer() {
        if (!client) return;
        try {
            const { data: { user }, error } = await client.auth.getUser();
            if (error || !user) return;

            const { data, error: profileError } = await client
                .from("profiles")
                .select("full_name, phone")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError) {
                console.warn("[SCENTIE] Could not prefill customer profile:", profileError);
                return;
            }

            if (data?.full_name && !$("recipientName").value) {
                $("recipientName").value = data.full_name;
            }
            if (data?.phone && !$("recipientPhone").value) {
                $("recipientPhone").value = data.phone;
            }
        } catch (error) {
            console.warn("[SCENTIE] Profile prefill skipped:", error);
        }
    }

    function buildSuccessURL(order) {
        const params = new URLSearchParams({
            code: order.order_code,
            subtotal: String(order.subtotal ?? 0),
            shipping: String(order.shipping_fee ?? SHIPPING_FEE),
            discount: String(order.discount_amount ?? 0),
            total: String(order.total_amount ?? 0),
            payment: order.payment_method || "cod"
        });
        return `order-success.html?${params.toString()}`;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        showMessage("");

        if (!form.reportValidity()) return;

        const items = cart?.getCart?.() || [];
        if (!items.length) {
            showMessage("Giỏ hàng của bạn đang trống. Hãy chọn sản phẩm trước nhé.");
            return;
        }

        if (!client) {
            showMessage("Kết nối hệ thống chưa sẵn sàng. Vui lòng tải lại trang.");
            return;
        }

        const formData = new FormData(form);
        const payload = {
            recipient_name: String(formData.get("recipient_name") || "").trim(),
            recipient_phone: String(formData.get("recipient_phone") || "").trim(),
            shipping_address: {
                province: String(formData.get("province") || "").trim(),
                district: String(formData.get("district") || "").trim(),
                ward: String(formData.get("ward") || "").trim(),
                address_line: String(formData.get("address_line") || "").trim()
            },
            customer_note: String(formData.get("customer_note") || "").trim(),
            payment_method: formData.get("payment_method") || "cod",
            // Only product IDs and quantities are sent. The Edge Function
            // fetches trusted prices from Supabase and calculates the total.
            items: items.map(item => ({
                id: item.id,
                quantity: Number(item.quantity)
            }))
        };

        setSubmitting(true);

        try {
            const { data: { session }, error: sessionError } = await client.auth.getSession();
            if (sessionError) throw sessionError;

            const headers = {};
            if (session?.access_token) {
                headers["x-user-access-token"] = session.access_token;
            }

            const { data: result, error } = await client.functions.invoke("create-order", {
                body: payload,
                headers
            });

            if (error) {
                let detail = error.message || "Không thể tạo đơn hàng.";
                try {
                    const context = error.context;
                    if (context && typeof context.json === "function") {
                        const body = await context.json();
                        detail = body?.error || detail;
                    }
                } catch (_) {
                    // Keep the original SDK error when no JSON response is available.
                }
                throw new Error(detail);
            }

            if (!result?.success || !result?.order?.order_code) {
                throw new Error(result?.error || "Phản hồi tạo đơn hàng không hợp lệ.");
            }

            // Clear the local cart only after the server confirms order creation.
            cart.clearCart();

            // Keep the signed-in customer's cloud cart in sync with the empty local cart.
            if (session?.user?.id) {
                try {
                    const { error: syncError } = await client
                        .from("user_carts")
                        .upsert({
                            user_id: session.user.id,
                            items: [],
                            updated_at: new Date().toISOString()
                        }, { onConflict: "user_id" });
                    if (syncError) console.warn("[SCENTIE] Cloud cart cleanup skipped:", syncError);
                } catch (syncError) {
                    console.warn("[SCENTIE] Cloud cart cleanup skipped:", syncError);
                }
            }

            window.location.assign(buildSuccessURL(result.order));
        } catch (error) {
            console.error("[SCENTIE] Checkout error:", error);
            showMessage(error?.message || "Đặt hàng chưa thành công. Vui lòng thử lại.");
            setSubmitting(false);
        }
    });

    window.addEventListener("scentie:cart-updated", renderSummary);
    renderSummary();
    prefillCustomer();
})();
