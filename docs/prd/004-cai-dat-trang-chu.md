# PRD-004: Cài đặt trang chủ (thứ tự ô, tab mới, link riêng, giao diện)

| | |
|---|---|
| Mã | FD-005 (lối tắt cá nhân trên FoxGo_Manager) |
| Trạng thái | Đã duyệt (viết bù, anh duyệt 17/11/2026). Đã phát hành (≤ v0.4.0); "Hiệu ứng line" chưa phát hành; phím `/` chưa làm |
| Người duyệt | Anh (Product Owner) |
| Ngày | 2026-11-17 |

> PRD viết bù. Hành vi chi tiết: [`../features/cai-dat.md`](../features/cai-dat.md),
> [`giao-dien-sang-toi.md`](../features/giao-dien-sang-toi.md). Trang chủ: PRD-002.

## 1. Vấn đề
Trang chủ chỉ có app Fox theo thứ tự cố định. Anh còn dùng hằng ngày nhiều trang ngoài hệ Fox (mail, YouTube…), muốn
app hay dùng lên đầu, muốn mở tab mới, và trang chủ không có thanh trên nên không có chỗ đổi sáng/tối.

## 2. Mục tiêu & chỉ số thành công
- Trang chủ thay được thanh dấu trang: thêm link riêng thành ô cạnh app — đo bằng: anh không cần mở thanh dấu trang cho
  các trang hay dùng.
- Mọi thiết lập chỉ lưu trên trình duyệt, không gửi đi đâu, không cần đăng nhập.
- Dùng được bằng bàn phím và trên điện thoại 375px.

## 3. Phạm vi
**Trong phạm vi:**
- Nút **Cài đặt** (bánh răng) trên thanh thông số → popup "Cài đặt trang chủ", nhóm có nhãn:
  - **Giao diện:** Chế độ màu (Hệ thống / Sáng / Tối); Hiệu ứng line (Bình thường / Chậm / Tắt).
  - **Mở trong tab mới** (công tắc).
  - **Ô trên trang chủ:** sắp thứ tự bằng nút lên/xuống; link riêng có nút xóa (app không xóa được).
  - **Thêm link riêng:** tên (≤ 24 ký tự, tùy chọn), mô tả (≤ 32 ký tự, tùy chọn), link; tối đa 24 link.
  - **Khôi phục mặc định** (giữ link đã thêm), **Hủy**, **Lưu thay đổi** (chỉ bật khi có thay đổi).
- Ô link trên trang chủ cùng kiểu chữ ô app (tên + mô tả, không mô tả thì tên miền).

**Ngoài phạm vi (không làm lần này):**
- Phím tắt `/` tìm nhanh — phần còn lại của FD-005, làm sau (bổ sung PRD này khi bắt đầu).
- Kéo-thả, ẩn app, sửa link đã thêm (hiện: xóa rồi thêm lại).
- Tải favicon của link (phải gọi dịch vụ ngoài), đồng bộ giữa máy (chờ FD-007).

## 4. User stories
- Là anh, tôi muốn thêm Gmail, YouTube thành ô trên trang chủ để không cần thanh dấu trang.
- Là anh, tôi muốn đưa app hay dùng lên đầu.
- Là anh, tôi muốn mọi ô mở tab mới để trang chủ luôn còn đó.
- Là anh, tôi muốn đổi sáng/tối và giảm/tắt hiệu ứng line ngay trên trang chủ.
- Là anh, tôi muốn sửa xong bấm Hủy là không có gì thay đổi.

## 5. Yêu cầu chi tiết & thiết kế

### 5.1 Quy tắc
- Thứ tự mặc định: app theo `sortApps`, rồi link theo lúc thêm. Đã lưu thứ tự → ô trong danh sách lưu đứng trước đúng
  thứ tự đó; app mới thêm vào `apps.ts` xếp cuối.
- Link: chỉ `http`/`https` (chặn `javascript:`, `data:`… vì gắn thẳng vào `<a>`); thiếu giao thức → thêm `https://`;
  tên miền phải có dấu chấm (trừ `localhost`); bỏ trống tên → lấy theo tên miền (`youtube.com` → "youtube").
- Tab mới: `target="_blank"` + `rel="noopener noreferrer"`.
- Popup làm trên bản nháp: Hủy / X / bấm nền → bỏ hết; Lưu → áp dụng ngay + ghi vào máy.
- Hiệu ứng line: Chậm = vẽ + xung chậm 2,5 lần; Tắt = ẩn line, giữ khoảng cách để trang không nhảy.
- 375px: popup gần full màn, Tên/Mô tả mỗi ô một dòng, Hủy/Lưu chia đôi hàng dưới.

### 5.2 Dữ liệu (localStorage, chỉ trên máy)
| Khóa | Nội dung |
|---|---|
| `foxdots.prefs` | `{ order: string[], newTab: boolean, links: {id,name,url,desc?}[], lineFx: 'normal'\|'slow'\|'off' }`; `order` gồm `app:<mã>` / `link:<id>` |
| `foxdots.theme` | `system` / `light` / `dark` (dùng chung với nút trên trang Giới thiệu) |

Dữ liệu hỏng, trùng, quá 24 link, `lineFx` lạ → đọc an toàn (`parsePrefs`), về giá trị mặc định thay vì lỗi trang.

## 6. Tiêu chí nghiệm thu
- [ ] Thêm `youtube.com` (bỏ trống tên) → ô "youtube"; đưa lên đầu → bật tab mới → Lưu → tải lại: ô đứng đầu, mở tab mới.
- [ ] Nhập `javascript:alert(1)` → báo đỏ, không thêm được.
- [ ] Sửa rồi Hủy → trang chủ không đổi gì; Lưu chỉ bật khi có thay đổi.
- [ ] Khôi phục mặc định → thứ tự gốc, tab mới tắt, Hệ thống, line Bình thường; link đã thêm còn nguyên.
- [ ] Hiệu ứng line Tắt → không còn line, logo và ô không nhảy; Chậm → xung chậm rõ.
- [ ] Popup đúng sáng/tối; 375px không tràn; dùng hết bằng phím Tab/Enter.
- [ ] `npm run check` sạch (`prefs.test.ts`).

## 7. Rủi ro & bảo mật
- **Link độc** (`javascript:`) gắn vào `<a>` → chặn ở `normalizeUrl`, có test.
- **Mất cài đặt** khi xóa dữ liệu trình duyệt / đổi máy → ghi rõ "Chỉ lưu trên trình duyệt này" ở đầu popup.
- **Đổi khóa `foxdots.*`** ở FD-012 → phải migrate `foxdots.prefs`, `foxdots.theme`.
- Link anh thêm chỉ nằm trong localStorage, không vào bundle/repo.

## 8. Kế hoạch release
- Đã phát hành v0.2.0 → v0.4.0. "Hiệu ứng line" đi cùng line trang chủ ở **v0.5.0** (PRD-002 §8).
- Phím `/`: bổ sung yêu cầu + tiêu chí vào PRD này → anh duyệt → nhánh `feature/FD-005-phim-tim`.
- Hoàn tác: Firebase Hosting Rollback; dữ liệu cũ vẫn đọc được vì `parsePrefs` chấp nhận thiếu trường.
