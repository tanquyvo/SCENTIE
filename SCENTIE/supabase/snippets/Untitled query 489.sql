INSERT INTO public.products (
    id,
    name,
    category,
    product_type,
    price,
    original_price,
    patches,
    image_path,
    is_active
)
VALUES
    ('focus', 'Focus', 'Single Mood', 'single', 69000, NULL, 5, NULL, TRUE),
    ('energy', 'Energy', 'Single Mood', 'single', 69000, NULL, 5, NULL, TRUE),
    ('calm', 'Calm', 'Single Mood', 'single', 69000, NULL, 5, NULL, TRUE),
    ('date', 'Date', 'Single Mood', 'single', 69000, NULL, 5, NULL, TRUE),
    ('fun', 'Fun', 'Single Mood', 'single', 69000, NULL, 5, NULL, TRUE),

    ('trial-pack', 'Trial Pack', 'Special Edition', 'trial', 29000, NULL, 2, NULL, FALSE),

    ('full-mood-combo', 'Full Mood Combo', 'Mood Combo', 'combo', 230000, 329000, 25, NULL, TRUE),

    ('triple-focus-energy-calm', 'Focus · Energy · Calm', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-focus-energy-date', 'Focus · Energy · Date', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-focus-energy-fun', 'Focus · Energy · Fun', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-focus-calm-date', 'Focus · Calm · Date', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-focus-calm-fun', 'Focus · Calm · Fun', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-focus-date-fun', 'Focus · Date · Fun', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-energy-calm-date', 'Energy · Calm · Date', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-energy-calm-fun', 'Energy · Calm · Fun', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-energy-date-fun', 'Energy · Date · Fun', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE),
    ('triple-calm-date-fun', 'Calm · Date · Fun', 'Mood Combo', 'combo', 199000, NULL, 15, NULL, TRUE)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    product_type = EXCLUDED.product_type,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    patches = EXCLUDED.patches,
    is_active = EXCLUDED.is_active;

    -- Cho phép khách truy cập kiểm tra bảng
-- nhưng RLS vẫn kiểm soát dữ liệu được đọc.
GRANT SELECT ON TABLE public.user_carts TO anon;

-- Cho phép người dùng đã đăng nhập thao tác giỏ hàng.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.user_carts
TO authenticated;

-- Cấp quyền cho backend service.
GRANT ALL ON TABLE public.user_carts TO service_role;
