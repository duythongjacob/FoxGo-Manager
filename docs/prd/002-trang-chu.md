# PRD-002: Trang chủ FoxGo (màn khóa + ô app)

| | |
|---|---|
| Mã | FD-002 (trang chủ của FoxGo_Manager) |
| Trạng thái | Đã phát hành (v0.5.0) — viết bù, anh duyệt 17/11/2026 |
| Người duyệt | Anh (Product Owner) |
| Ngày | 2026-11-17 |

> PRD viết bù: trang đã làm theo từng yêu cầu của anh từ 14/11/2026; tài liệu này gom phạm vi, quyết định và tiêu chí
> nghiệm thu về một chỗ. Hành vi chi tiết: [`../features/trang-chu.md`](../features/trang-chu.md),
> [`danh-sach-app.md`](../features/danh-sach-app.md), [`dieu-huong.md`](../features/dieu-huong.md),
> [`giao-dien-sang-toi.md`](../features/giao-dien-sang-toi.md). Thanh thông số: PRD-003. Cài đặt: PRD-004.

## 1. Vấn đề
Anh dùng nhiều app Fox ở nhiều địa chỉ khác nhau; mỗi lần mở trình duyệt phải nhớ/gõ link. Cần một trang mở đầu trình
duyệt (homepage) gọn, đẹp, cùng "gia đình" giao diện, bấm một lần là vào đúng app.

## 2. Mục tiêu & chỉ số thành công
- Từ lúc mở trình duyệt tới lúc vào app ≤ 1 cú bấm — đo bằng: mọi app đang chạy có ô bấm được trên màn đầu tiên.
- Trang nhẹ (mở cả ngày): trang chủ không tải thư viện hoạt ảnh; để yên > 60 giây thì CPU như trang tĩnh.
- Nhìn là biết app nào đã dùng được, app nào chưa — **không** bằng nhãn chữ trạng thái.

## 3. Phạm vi
**Trong phạm vi:**
- Trang `#/` kiểu màn khóa Fox.TàiChính: toàn màn, không thanh trên; logo chữ "Fox." giữa màn, dưới là ô app;
  thanh thông số bên trái (PRD-003); chân trang "FoxGo® | Thong Duy".
- Ô app chỉ có chữ (tên + mô tả 2–3 từ), ngăn bằng đường kẻ dọc mảnh; thẻ nổi 3 tính năng khi rê chuột.
- Line trang trí màu nhấn từ chấm cam của logo xuống ô app hàng đầu (chỉ SVG + CSS).
- Danh sách app một nguồn duy nhất `src/data/apps.ts`, dùng chung với trang Giới thiệu.
- Điều hướng hash (`#/`, `#/gioi-thieu`, `#/gioi-thieu/<mục>`) — chạy trên hosting tĩnh.
- Sáng/tối (Hệ thống / Sáng / Tối), không nháy màu khi mở; 375px → 1440px+.

**Ngoài phạm vi (không làm lần này):**
- Số liệu cá nhân từ app (đã chi, việc hôm nay…) — FD-008, cần PRD riêng sau FD-007 đăng nhập chung.
- Ô tìm nhanh / phím `/` — phần còn lại FD-005 (PRD-004).
- Đăng nhập, đồng bộ giữa máy, analytics, font/CDN ngoài.

## 4. User stories
- Là anh, tôi muốn mở trình duyệt là thấy các app Fox để bấm vào ngay.
- Là anh, tôi muốn thấy app nào chưa có mà không bị một dòng chữ "Kế hoạch" làm rối mắt.
- Là anh, tôi muốn trang chủ để mở cả ngày mà không làm nóng máy / tốn pin.
- Là anh, tôi muốn dùng ban đêm không chói (tối) và ban ngày sáng sạch.
- Là anh dùng điện thoại, tôi muốn bấm ô/nút không để lại vệt nhấn và không tràn ngang.

## 5. Yêu cầu chi tiết & thiết kế

### 5.1 Quyết định của anh
| Quyết định | Ngày |
|---|---|
| Trang chủ kiểu màn khóa Fox.TàiChính, bỏ ô tìm + thẻ app cũ, bỏ thanh tab | 15/11/2026 |
| Ô app bỏ linh vật và khung kính, chỉ chữ + đường kẻ mảnh | 16/11/2026 |
| Tối giữ nền xanh đậm; sáng nền trắng + lưới ô vuông nhạt | 16/11/2026 |
| Bỏ nhãn trạng thái chữ toàn dự án; app chưa có = chữ mờ, không bấm được | 17/11/2026 |
| Line màu từ logo xuống ô app (cùng kiểu line trang Giới thiệu); xung sáng **chỉ lóe** để nhẹ máy | 17/11/2026 |
| Favicon chữ "F." nền trong suốt, chấm cam (như chấm logo "Fox.") — cùng favicon cho mọi app | 17/11/2026 |
| Bỏ ô Fox.KỹNăng; thứ tự Tài chính → Công việc → Tư duy (Mind) → app kế hoạch — v0.7.4 | 18/11/2026 |

### 5.2 Hành vi
- **Ô app:** tên bỏ tiền tố "Fox." ("Fox.TàiChính" → "Tài Chính"); thứ tự app mở được (đang chạy / đang xây) theo khai báo trong `data/apps.ts` → kế hoạch (`sortApps`),
  hoặc theo Cài đặt. App có `url` → bấm mở; app kế hoạch → mờ, không bấm. Rê chuột: gạch chân màu nhấn + thẻ nổi
  (thiết bị cảm ứng không có thẻ nổi). Màu nhấn chỉ qua `--app-accent`.
- **Line:** mỗi ô hàng đầu một đường từ chấm logo, đan chéo, chấm + quầng ở đích; app kế hoạch đường mờ không xung.
  Xung lóe lúc vào trang, mỗi 9 giây một đường, khi rê vào ô; tab ẩn / 60 giây không thao tác → ngừng.
  Giảm chuyển động → không vẽ dần, không xung; ≤ 760px bỏ quầng. Có thể chỉnh Chậm / Tắt trong Cài đặt (PRD-004).
- **Bố cục:** ≥ 1080px thanh thông số cố định trái; < 1080px ngăn kéo + nút menu; ≤ 520px lưới 3 cột.
- **Điều hướng:** đường dẫn lạ → trang chủ, không báo lỗi; Back/Forward đổi trang đúng.
- **Sáng/tối:** `index.html` đặt `data-theme` trước React; màu chỉ từ token `global.css` (`--lc-*` cho trang chủ).

### 5.3 Dữ liệu
- Đọc `src/data/apps.ts` (trong bundle, công khai — chỉ tên, mô tả, link, màu, trạng thái).
- localStorage: `foxdots.theme` (chế độ), `foxdots.prefs` (PRD-004). Không gửi đi đâu.
- Trang chủ không gọi mạng ngoài các dịch vụ của thanh thông số (PRD-003).

## 6. Tiêu chí nghiệm thu
- [ ] Mở `/` → logo, ô app, thanh thông số thu nhỏ, chân trang; không thanh trên.
- [ ] Ô app đang chạy mở đúng link; ô kế hoạch mờ, không bấm được; không chữ "Đang chạy / Đang xây / Kế hoạch / Sắp ra mắt".
- [ ] Rê chuột → gạch chân màu app + thẻ nổi; trên cảm ứng không thẻ nổi, không vệt nhấn.
- [ ] Line mọc từ chấm logo tới đúng ô hàng đầu; để yên 60 giây → không còn xung (DevTools Performance gần như im).
- [ ] `#/abc` → trang chủ; `#/gioi-thieu/ff` → đúng mục; Back/Forward đúng.
- [ ] Sáng + tối, 375px + 1440px: không tràn ngang; chọn Tối → tải lại không nháy trắng.
- [ ] Network: trang chủ không tải `motion`.
- [ ] Thêm/đổi app trong `apps.ts` → cả trang chủ và Giới thiệu đổi theo.
- [ ] `npm run check` sạch, `npm run build` thành công.

## 7. Rủi ro & bảo mật
- **Lộ dữ liệu cá nhân** — bundle và repo công khai → `apps.ts` chỉ link + mô tả chung (quy tắc `CLAUDE.md`).
- **Tốn CPU/pin** vì trang mở cả ngày → line chỉ lóe, ngừng khi ẩn/không thao tác (đã đo: ~5 ms CPU/giây khi để yên).
- **Link app sai/chết** → kiểm tra ô mở đúng link mỗi lần release.
- **Khóa `foxdots.*`** sẽ đổi tên ở FD-012 → cần migrate để không mất cài đặt.

## 8. Kế hoạch release
- Đã phát hành dần v0.1.0 → v0.4.0. Phần line + favicon "F." (đang ở "Chưa phát hành") → **v0.5.0** (minor):
  thử trên `npm run dev` (:5170) theo §6 → anh nghiệm thu → `npm run release -- minor` → `npm run fuel:update` → `npm run deploy`.
- Hoàn tác: Firebase Console → Hosting → Rollback, hoặc build lại từ tag `fd-v0.4.0`; tắt riêng line: Cài đặt → Hiệu ứng line → Tắt.
