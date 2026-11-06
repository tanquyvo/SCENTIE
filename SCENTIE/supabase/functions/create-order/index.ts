
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* =========================================
   SCENTIE — CREATE ORDER
   Phase 3: Guest Checkout + COD
   Fixed shipping fee: 30,000 VND
   ========================================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type, x-user-access-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHIPPING_FEE = 30000;
const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_PRODUCT = 99;

type CartItem = {
  id?: unknown;
  quantity?: unknown;
};

type ShippingAddress = {
  province?: unknown;
  district?: unknown;
  ward?: unknown;
  address_line?: unknown;
};

type OrderRequest = {
  recipient_name?: unknown;
  recipient_phone?: unknown;
  shipping_address?: ShippingAddress;
  customer_note?: unknown;
  payment_method?: unknown;
  items?: unknown;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const cleanString = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== "string") return null;

  const result = value.trim();

  if (!result || result.length > maxLength) return null;

  return result;
};

const getAddressField = (
  address: ShippingAddress,
  field: keyof ShippingAddress,
  maxLength: number,
): string | null => cleanString(address[field], maxLength);

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  // Required environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return json({ error: "Server configuration error." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
/* =====================================
   1. AUTHENTICATION
   Guest: no custom user token.
   User: valid access token required.
   ===================================== */

const userToken = req.headers.get("x-user-access-token");
let userId: string | null = null;

if (userToken) {
  const { data, error } = await admin.auth.getUser(userToken);

  if (error || !data.user) {
    return json(
      {
        error:
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      },
      401,
    );
  }

  userId = data.user.id;
}

    /* =====================================
       2. PARSE REQUEST
       ===================================== */

    let body: OrderRequest;

    try {
      body = await req.json();
    } catch {
      return json({ error: "Dữ liệu gửi lên không hợp lệ." }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Request body không hợp lệ." }, 400);
    }

    /* =====================================
       3. PAYMENT METHOD
       Phase 3 supports COD only.
       ===================================== */

    if (
      body.payment_method !== undefined &&
      body.payment_method !== "cod"
    ) {
      return json(
        {
          error:
            "Hiện tại SCENTIE chỉ hỗ trợ thanh toán COD. VNPay sẽ được triển khai ở giai đoạn tiếp theo.",
        },
        400,
      );
    }

    const paymentMethod = "cod";

    /* =====================================
       4. VALIDATE CUSTOMER INFORMATION
       ===================================== */

    const recipientName = cleanString(body.recipient_name, 120);
    const recipientPhone = cleanString(body.recipient_phone, 30);

    if (!recipientName || recipientName.length < 2) {
      return json({ error: "Họ tên người nhận không hợp lệ." }, 400);
    }

    if (
      !recipientPhone ||
      !/^[0-9+().\s-]{8,30}$/.test(recipientPhone)
    ) {
      return json({ error: "Số điện thoại không hợp lệ." }, 400);
    }

    const address = body.shipping_address;

    if (
      !address ||
      typeof address !== "object" ||
      Array.isArray(address)
    ) {
      return json(
        { error: "Thông tin địa chỉ giao hàng không hợp lệ." },
        400,
      );
    }

    const province = getAddressField(address, "province", 120);
    const district = getAddressField(address, "district", 120);
    const ward = getAddressField(address, "ward", 120);
    const addressLine = getAddressField(address, "address_line", 300);

    if (!province || !district || !ward || !addressLine) {
      return json(
        { error: "Vui lòng nhập đầy đủ địa chỉ giao hàng." },
        400,
      );
    }

    let customerNote = "";

    if (body.customer_note !== undefined && body.customer_note !== null) {
      if (typeof body.customer_note !== "string") {
        return json({ error: "Ghi chú đơn hàng không hợp lệ." }, 400);
      }

      customerNote = body.customer_note.trim().slice(0, 1000);
    }

    /* =====================================
       5. VALIDATE CART
       Ignore all frontend prices and totals.
       ===================================== */

    if (!Array.isArray(body.items)) {
      return json({ error: "Giỏ hàng không hợp lệ." }, 400);
    }

    const rawItems = body.items as CartItem[];

    if (
      rawItems.length === 0 ||
      rawItems.length > MAX_ITEMS
    ) {
      return json(
        { error: "Giỏ hàng trống hoặc có quá nhiều sản phẩm." },
        400,
      );
    }

    const quantities = new Map<string, number>();

    for (const item of rawItems) {
      if (!item || typeof item !== "object") {
        return json({ error: "Sản phẩm trong giỏ không hợp lệ." }, 400);
      }

      const id = cleanString(item.id, 100);

      const quantityNumber = Number(item.quantity);

      if (
        !id ||
        !Number.isSafeInteger(quantityNumber) ||
        quantityNumber < 1 ||
        quantityNumber > MAX_QUANTITY_PER_PRODUCT
      ) {
        return json(
          { error: "Mã sản phẩm hoặc số lượng không hợp lệ." },
          400,
        );
      }

      const newQuantity = (quantities.get(id) || 0) + quantityNumber;

      if (newQuantity > MAX_QUANTITY_PER_PRODUCT) {
        return json(
          { error: "Số lượng sản phẩm vượt quá giới hạn cho phép." },
          400,
        );
      }

      quantities.set(id, newQuantity);
    }

    const productIds = [...quantities.keys()];

    /* =====================================
       6. FETCH TRUSTED PRODUCT DATA
       Prices come from Supabase only.
       ===================================== */

    const { data: products, error: productError } = await admin
      .from("products")
      .select("id, name, price, is_active")
      .in("id", productIds);

    if (productError) {
      console.error("Product lookup failed:", productError);
      throw new Error("Không thể kiểm tra sản phẩm.");
    }

    if (!products || products.length !== productIds.length) {
      return json(
        {
          error:
            "Một hoặc nhiều sản phẩm không tồn tại hoặc đã ngừng kinh doanh.",
        },
        409,
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderItems: OrderItem[] = [];

    for (const productId of productIds) {
      const product = productMap.get(productId);

      if (!product || !product.is_active) {
        return json(
          {
            error:
              "Một hoặc nhiều sản phẩm không còn khả dụng. Vui lòng cập nhật giỏ hàng.",
          },
          409,
        );
      }

      const unitPrice = Number(product.price);
      const quantity = quantities.get(productId)!;

      if (
        !Number.isSafeInteger(unitPrice) ||
        unitPrice <= 0
      ) {
        console.error("Invalid product price:", productId);
        return json(
          { error: "Giá sản phẩm không hợp lệ. Vui lòng liên hệ SCENTIE." },
          500,
        );
      }

      const lineTotal = unitPrice * quantity;

      if (!Number.isSafeInteger(lineTotal)) {
        return json({ error: "Giá trị đơn hàng vượt giới hạn." }, 400);
      }

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: unitPrice,
        quantity,
        line_total: lineTotal,
      });
    }

    /* =====================================
       7. CALCULATE ORDER TOTAL
       Shipping fee is server-controlled.
       ===================================== */

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.line_total,
      0,
    );

    if (!Number.isSafeInteger(subtotal) || subtotal < 0) {
      return json({ error: "Tổng tiền sản phẩm không hợp lệ." }, 400);
    }

    const shippingFee = SHIPPING_FEE;
    const discountAmount = 0;
    const totalAmount = subtotal + shippingFee - discountAmount;

    if (!Number.isSafeInteger(totalAmount)) {
      return json({ error: "Tổng đơn hàng vượt giới hạn." }, 400);
    }

    /* =====================================
       8. CREATE ORDER
       ===================================== */

    const orderCode =
      `SC${Date.now().toString().slice(-9)}` +
      crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_code: orderCode,
        user_id: userId,
        payment_method: paymentMethod,
        payment_status: "pending",
        order_status: "pending",
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        shipping_address: {
          province,
          district,
          ward,
          address_line: addressLine,
        },
        customer_note: customerNote || null,
      })
      .select("id, order_code, total_amount, created_at")
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", orderError);
      throw new Error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    }

    /* =====================================
       9. CREATE ORDER ITEMS
       Compensating delete if item insertion
       fails. Service role bypasses RLS.
       ===================================== */

    const rows = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(rows);

    if (itemsError) {
      console.error("Order items insertion failed:", itemsError);

      const { error: rollbackError } = await admin
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (rollbackError) {
        console.error("Order rollback failed:", rollbackError);
      }

      throw new Error(
        "Không thể lưu chi tiết đơn hàng. Vui lòng thử lại.",
      );
    }

    /* =====================================
       10. SUCCESS RESPONSE
       ===================================== */

    return json({
      success: true,
      guest: userId === null,
      order: {
        id: order.id,
        order_code: order.order_code,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: "pending",
        created_at: order.created_at,
      },
      item_count: orderItems.length,
    });
  } catch (error) {
    console.error("SCENTIE create-order error:", error);

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo đơn hàng. Vui lòng thử lại.",
      },
      500,
    );
  }
});
