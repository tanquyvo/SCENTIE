/* SCENTIE — Account Center | isolated to pages/account.html */
const supabase = window.scentieSupabase;
if (!supabase) throw new Error('[SCENTIE] Supabase client is missing.');
const $ = (id) => document.getElementById(id);
const state = { user: null, profile: null, orders: [], addresses: [], filter: 'all' };
const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang chuẩn bị', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
const statusClass = { pending: 'pending', confirmed: 'confirmed', processing: 'processing', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled' };
const money = n => new Intl.NumberFormat('vi-VN').format(Number(n) || 0) + 'đ';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(el, text, type='info') { el.textContent = text; el.hidden = !text; el.className = `account-message${type==='error'?' is-error':type==='success'?' is-success':''}`; }
function initials(name) { return (String(name || 'S').trim()[0] || 'S').toUpperCase(); }
function paintAvatar(el, name, url) {
  if (!el) return;
  el.replaceChildren();
  if (url) {
    const img = document.createElement('img');
    img.src = url; img.alt = 'Ảnh đại diện'; img.loading = 'lazy';
    img.onerror = () => { el.textContent = initials(name); };
    el.appendChild(img);
  } else el.textContent = initials(name);
}
function switchView(name) {
  document.querySelectorAll('.member-view').forEach(el => el.classList.toggle('is-active', el.id === `view-${name}`));
  document.querySelectorAll('.account-nav-item').forEach(el => el.classList.toggle('is-active', el.dataset.view === name));
  if (name === 'orders') renderOrders();
  if (name === 'addresses') renderAddresses();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showAuth() { state.user = null; $('authView').hidden = false; $('memberView').hidden = true; }
function showMember() { $('authView').hidden = true; $('memberView').hidden = false; }
function setAuthMode(mode) {
  const signup = mode === 'signup';
  $('loginTab').classList.toggle('is-active', !signup); $('signupTab').classList.toggle('is-active', signup);
  $('loginTab').setAttribute('aria-selected', String(!signup)); $('signupTab').setAttribute('aria-selected', String(signup));
  $('fullNameField').hidden = !signup; $('fullName').required = signup;
  $('password').autocomplete = signup ? 'new-password' : 'current-password';
  $('passwordHint').textContent = signup ? 'Mật khẩu cần có ít nhất 8 ký tự.' : 'Sử dụng mật khẩu bạn đã đăng ký.';
  $('authHeading').textContent = signup ? 'Bắt đầu mood của riêng bạn!' : 'Chào mừng bạn trở lại!';
  $('authSubtitle').textContent = signup ? 'Tạo tài khoản để lưu giữ thông tin và hành trình cùng SCENTIE.' : 'Đăng nhập để tiếp tục hành trình cùng mood của bạn.';
  $('authSubmitText').textContent = signup ? 'Tạo tài khoản' : 'Đăng nhập'; $('authForm').dataset.mode = mode; message($('authMessage'), '');
}
function renderIdentity() {
  const name = state.profile?.full_name || state.user?.user_metadata?.full_name || state.user?.email?.split('@')[0] || 'SCENTIE Member';
  const phone = state.profile?.phone || '';
  const avatarUrl = state.profile?.avatar_url || state.user?.user_metadata?.avatar_url || '';
  paintAvatar($('sideAvatar'), name, avatarUrl); paintAvatar($('profileAvatar'), name, avatarUrl);
  $('sideName').textContent = name; $('sideEmail').textContent = state.user?.email || '';
  $('welcomeName').textContent = name.split(' ').filter(Boolean).slice(-1)[0] || 'bạn';
  $('profileDisplayName').textContent = name; $('profileDisplayEmail').textContent = state.user?.email || '';
  $('profileFullName').value = state.profile?.full_name || name; $('profilePhone').value = phone;
  $('profileEmailReadonly').value = state.user?.email || '';
  $('quickName').textContent = name; $('quickEmail').textContent = state.user?.email || '—'; $('quickPhone').textContent = phone || 'Chưa cập nhật';
}
async function loadProfile() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, phone').eq('id', state.user.id).maybeSingle();
  if (error) throw error;
  state.profile = { ...(data || { id: state.user.id, full_name: state.user.user_metadata?.full_name || '', phone: '' }), avatar_url: state.user.user_metadata?.avatar_url || '' };
  renderIdentity();
}
async function loadOrders() {
  const { data, error } = await supabase.from('orders').select('id, order_code, order_status, payment_status, payment_method, subtotal, shipping_fee, discount_amount, total_amount, recipient_name, recipient_phone, shipping_address, customer_note, created_at, order_items(product_name, quantity, unit_price, line_total)').eq('user_id', state.user.id).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  state.orders = data || []; renderOverview(); renderOrders();
}
async function loadAddresses() {
  const { data, error } = await supabase.from('addresses').select('id, recipient_name, phone, province, district, ward, address_line, delivery_note, is_default, created_at').eq('user_id', state.user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  state.addresses = data || []; renderAddresses();
}
function orderCard(order, detailed=false) {
  const status = order.order_status || 'pending';
  const date = new Date(order.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
  const items = order.order_items || [];
  const itemHTML = items.length ? items.map(item => `<div class="order-product-row"><span>${escapeHTML(item.product_name)} <small>× ${Number(item.quantity)||1}</small></span><strong>${money(item.line_total)}</strong></div>`).join('') : '<p class="muted">Không có thông tin sản phẩm.</p>';
  const addr = order.shipping_address || {};
  return `<article class="order-card"><div class="order-card-head"><div><span class="order-code">MÃ ĐƠN HÀNG&nbsp; ${escapeHTML(order.order_code)}</span><small>${escapeHTML(date)}</small></div><span class="status-pill ${statusClass[status] || 'pending'}">${escapeHTML(statusLabels[status] || status)}</span></div><div class="order-card-products">${itemHTML}</div>${detailed ? `<div class="order-detail-extra"><div><small>Người nhận</small><strong>${escapeHTML(order.recipient_name)} · ${escapeHTML(order.recipient_phone)}</strong></div><div><small>Địa chỉ giao hàng</small><strong>${escapeHTML([addr.address_line,addr.ward,addr.district,addr.province].filter(Boolean).join(', ') || '—')}</strong></div><div><small>Thanh toán</small><strong>${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : escapeHTML(order.payment_method || '—')} · ${order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong></div>${order.customer_note ? `<div><small>Ghi chú</small><strong>${escapeHTML(order.customer_note)}</strong></div>` : ''}</div>` : ''}<div class="order-card-foot"><span>${items.length} sản phẩm</span><strong>Tổng thanh toán: <b>${money(order.total_amount)}</b></strong></div>${detailed ? '' : `<button class="order-detail-toggle" type="button" aria-expanded="false">Xem chi tiết đơn hàng <span>⌄</span></button><div class="order-detail-panel" hidden>${`<div class="order-detail-extra"><div><small>Người nhận</small><strong>${escapeHTML(order.recipient_name)} · ${escapeHTML(order.recipient_phone)}</strong></div><div><small>Địa chỉ giao hàng</small><strong>${escapeHTML([addr.address_line,addr.ward,addr.district,addr.province].filter(Boolean).join(', ') || '—')}</strong></div><div><small>Thanh toán</small><strong>${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : escapeHTML(order.payment_method || '—')} · ${order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong></div>${order.customer_note ? `<div><small>Ghi chú</small><strong>${escapeHTML(order.customer_note)}</strong></div>` : ''}</div>`}</div>`}</article>`;
}
function renderOverview() {
  const orders = state.orders;
  $('statOrders').textContent = orders.length;
  $('statActive').textContent = orders.filter(o => !['delivered','cancelled'].includes(o.order_status)).length;
  $('statDelivered').textContent = orders.filter(o => o.order_status === 'delivered').length;
  $('overviewOrders').innerHTML = orders.length ? orders.slice(0,3).map(o => orderCard(o)).join('') : '<div class="empty-state">Bạn chưa có đơn hàng nào. Một mood mới đang chờ bạn khám phá!</div>';
}
function renderOrders() {
  const list = $('orderList'); if (!list) return;
  const filtered = state.filter === 'all' ? state.orders : state.orders.filter(o => o.order_status === state.filter);
  list.innerHTML = filtered.length ? filtered.map(o => orderCard(o)).join('') : '<div class="empty-state">Chưa có đơn hàng trong mục này.</div>';
}
function renderAddresses() {
  const list = $('addressList'); if (!list) return;
  list.innerHTML = state.addresses.length ? state.addresses.map(a => `<article class="address-card"><div class="address-card-head"><div><strong>${escapeHTML(a.recipient_name)}</strong><span>${escapeHTML(a.phone)}</span></div>${a.is_default ? '<span class="default-badge">MẶC ĐỊNH</span>' : ''}</div><p>${escapeHTML([a.address_line,a.ward,a.district,a.province].filter(Boolean).join(', '))}</p>${a.delivery_note ? `<small>Ghi chú: ${escapeHTML(a.delivery_note)}</small>` : ''}<div class="address-actions">${!a.is_default ? `<button data-address-action="default" data-id="${a.id}" type="button">Đặt mặc định</button>` : ''}<button data-address-action="edit" data-id="${a.id}" type="button">Chỉnh sửa</button><button class="danger-link" data-address-action="delete" data-id="${a.id}" type="button">Xóa</button></div></article>`).join('') : '<div class="empty-state">Bạn chưa lưu địa chỉ nào. Thêm địa chỉ để thanh toán thuận tiện hơn nha!</div>';
}
async function refreshMember() {
  showMember();
  await loadProfile();
  await Promise.all([loadOrders(), loadAddresses()]);
}
function openAddressEditor(address=null) {
  $('addressForm').reset(); $('addressId').value = address?.id || '';
  $('addressEditorTitle').textContent = address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới';
  $('addressRecipient').value = address?.recipient_name || ''; $('addressPhone').value = address?.phone || '';
  $('addressProvince').value = address?.province || ''; $('addressDistrict').value = address?.district || ''; $('addressWard').value = address?.ward || '';
  $('addressLine').value = address?.address_line || ''; $('addressNote').value = address?.delivery_note || ''; $('addressDefault').checked = !!address?.is_default || state.addresses.length === 0;
  message($('addressMessage'), ''); $('addressEditor').hidden = false; $('addressEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeAddressEditor() { $('addressEditor').hidden = true; }
async function saveAddress(event) {
  event.preventDefault(); const id = $('addressId').value;
  const payload = { user_id: state.user.id, recipient_name: $('addressRecipient').value.trim(), phone: $('addressPhone').value.trim(), province: $('addressProvince').value.trim(), district: $('addressDistrict').value.trim(), ward: $('addressWard').value.trim(), address_line: $('addressLine').value.trim(), delivery_note: $('addressNote').value.trim() || null, is_default: $('addressDefault').checked };
  const btn = $('addressSaveBtn'); btn.disabled = true;
  try {
    if (payload.is_default) { const { error } = await supabase.from('addresses').update({ is_default: false }).eq('user_id', state.user.id); if (error) throw error; }
    const result = id ? await supabase.from('addresses').update(payload).eq('id', id).eq('user_id', state.user.id) : await supabase.from('addresses').insert(payload);
    if (result.error) throw result.error;
    await loadAddresses(); closeAddressEditor();
  } catch (e) { message($('addressMessage'), e.message || 'Không thể lưu địa chỉ.', 'error'); }
  finally { btn.disabled = false; }
}
async function addressAction(action, id) {
  const address = state.addresses.find(a => a.id === id); if (!address) return;
  if (action === 'edit') return openAddressEditor(address);
  if (action === 'delete') {
    if (!confirm('Bà chắc chắn muốn xóa địa chỉ này chứ?')) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', state.user.id);
    if (error) alert(error.message); else await loadAddresses();
  }
  if (action === 'default') {
    const { error: clearError } = await supabase.from('addresses').update({ is_default: false }).eq('user_id', state.user.id);
    if (clearError) return alert(clearError.message);
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', state.user.id);
    if (error) alert(error.message); else await loadAddresses();
  }
}

$('loginTab').addEventListener('click', () => setAuthMode('login'));
$('signupTab').addEventListener('click', () => setAuthMode('signup'));
$('authForm').addEventListener('submit', async e => {
  e.preventDefault(); message($('authMessage'), ''); const mode = $('authForm').dataset.mode || 'login';
  const email = $('email').value.trim(); const password = $('password').value; const fullName = $('fullName').value.trim();
  if (!email || !password || (mode === 'signup' && !fullName)) return message($('authMessage'), 'Bà điền đầy đủ thông tin trước nha.', 'error');
  if (mode === 'signup' && password.length < 8) return message($('authMessage'), 'Mật khẩu cần có ít nhất 8 ký tự.', 'error');
  $('authSubmit').disabled = true; $('authSubmitText').textContent = 'Đang xử lý...';
  try {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: location.href.split('#')[0] } });
      if (error) throw error;
      if (data.session?.user) { state.user = data.session.user; await refreshMember(); }
      else { $('authForm').reset(); setAuthMode('login'); message($('authMessage'), 'Tạo tài khoản thành công! Hãy mở email để xác minh trước khi đăng nhập nhé.', 'success'); }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error;
      state.user = data.user; await refreshMember(); switchView('overview');
    }
  } catch (err) { message($('authMessage'), err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'error'); }
  finally { $('authSubmit').disabled = false; $('authSubmitText').textContent = mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'; }
});
$('profileForm').addEventListener('submit', async e => {
  e.preventDefault(); if (!state.user) return; const full_name = $('profileFullName').value.trim(); const phone = $('profilePhone').value.trim();
  if (!full_name) return message($('profileMessage'), 'Họ tên không được để trống.', 'error');
  const btn = $('profileForm').querySelector('button[type="submit"]'); btn.disabled = true;
  try {
    const { error } = await supabase.from('profiles').update({ full_name, phone: phone || null }).eq('id', state.user.id); if (error) throw error;
    const { error: authError } = await supabase.auth.updateUser({ data: { full_name } }); if (authError) throw authError;
    state.profile = { ...state.profile, full_name, phone }; renderIdentity(); message($('profileMessage'), 'Hồ sơ đã được cập nhật thành công.', 'success');
  } catch (err) { message($('profileMessage'), err.message || 'Không thể cập nhật hồ sơ.', 'error'); }
  finally { btn.disabled = false; }
});
$('avatarFile')?.addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file || !state.user) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
    message($('profileMessage'), 'Bà chọn ảnh JPG, PNG hoặc WEBP nha.', 'error'); event.target.value = ''; return;
  }
  if (file.size > 3 * 1024 * 1024) {
    message($('profileMessage'), 'Ảnh đại diện tối đa 3MB thôi bà nhé.', 'error'); event.target.value = ''; return;
  }
  const editLabel = document.querySelector('.avatar-upload-link');
  if (editLabel) editLabel.textContent = 'Đang tải ảnh lên...';
  try {
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const path = `${state.user.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true, contentType: file.type, cacheControl: '3600'
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatar_url = data?.publicUrl;
    if (!avatar_url) throw new Error('Không lấy được đường dẫn ảnh đại diện.');
    const { error: authError } = await supabase.auth.updateUser({ data: { avatar_url } });
    if (authError) throw authError;
    state.user = { ...state.user, user_metadata: { ...(state.user.user_metadata || {}), avatar_url } };
    state.profile = { ...state.profile, avatar_url };
    renderIdentity();
    message($('profileMessage'), 'Ảnh đại diện đã được cập nhật!', 'success');
  } catch (err) {
    console.error('[SCENTIE] Avatar upload error:', err);
    const setupHint = /bucket|not found|row-level|policy|permission/i.test(err.message || '')
      ? ' Hãy kiểm tra bucket avatars và Storage policy trong hướng dẫn cài đặt.'
      : '';
    message($('profileMessage'), (err.message || 'Không thể tải ảnh lên.') + setupHint, 'error');
  } finally {
    if (editLabel) editLabel.textContent = '＋ Tải ảnh đại diện lên';
    event.target.value = '';
  }
});

$('signOutBtn').addEventListener('click', async () => { const btn = $('signOutBtn'); btn.disabled = true; try { const { error } = await supabase.auth.signOut(); if (error) throw error; showAuth(); setAuthMode('login'); message($('authMessage'), 'Bạn đã đăng xuất khỏi SCENTIE.', 'success'); } catch (e) { alert(e.message || 'Đăng xuất chưa thành công.'); } finally { btn.disabled = false; } });
document.querySelectorAll('.account-nav-item').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.go)));
document.querySelectorAll('.order-tab').forEach(btn => btn.addEventListener('click', () => { state.filter = btn.dataset.filter; document.querySelectorAll('.order-tab').forEach(t => t.classList.toggle('is-active', t === btn)); renderOrders(); }));
document.addEventListener('click', e => { const toggle = e.target.closest('.order-detail-toggle'); if (toggle) { const panel = toggle.nextElementSibling; const open = panel.hidden; panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.querySelector('span').textContent = open ? '⌃' : '⌄'; } const action = e.target.closest('[data-address-action]'); if (action) addressAction(action.dataset.addressAction, action.dataset.id); });
$('addAddressBtn').addEventListener('click', () => openAddressEditor()); $('closeAddressEditor').addEventListener('click', closeAddressEditor); $('cancelAddressBtn').addEventListener('click', closeAddressEditor); $('addressForm').addEventListener('submit', saveAddress);
supabase.auth.onAuthStateChange((_event, session) => { if (!session?.user) { state.user = null; showAuth(); } });
async function init() { setAuthMode('login'); const { data, error } = await supabase.auth.getSession(); if (error) return message($('authMessage'), 'Không thể kiểm tra phiên đăng nhập. Vui lòng tải lại trang.', 'error'); if (data.session?.user) { state.user = data.session.user; try { await refreshMember(); } catch (e) { console.error('[SCENTIE] Account load error:', e); message($('profileMessage'), 'Đã đăng nhập nhưng chưa thể tải đầy đủ dữ liệu. Vui lòng tải lại trang.', 'error'); } } else showAuth(); }
init();
