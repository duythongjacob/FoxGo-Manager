# Trang chủ

> Mã: `FD-002` · PRD: [PRD-002](../prd/002-trang-chu.md) · Cập nhật: 17/11/2026 · Trạng thái: Đang chạy

## Mục đích
Trang mở đầu trình duyệt (ghim làm homepage): nhìn giờ/thời tiết/giá trong một giây và bấm vào app Fox cần dùng.
Tối giản theo màn khóa của Fox.TàiChính.

## Cách dùng / hành vi
- Đường dẫn `#/` (hoặc đường dẫn lạ). Toàn màn + lưới chấm, **không** có thanh trên. Nền theo giao diện: tối = xanh đậm kiểu màn khóa, sáng = trắng sạch + lưới ô vuông nhạt (đổi trong Cài đặt → Giao diện).
- Giữa màn: logo chữ "Fox." lớn, dưới là các **ô app** chỉ có chữ (tên + mô tả 2–3 từ), ngăn cách bằng đường kẻ dọc mảnh mờ dần hai đầu (ô đầu hàng không có kẻ); lưới 6 cột.
  - App đang chạy: bấm mở link chính (`url`), rê chuột hiện gạch chân màu nhấn dưới tên + thẻ nổi 3 tính năng chính.
  - App kế hoạch: chữ mờ, không bấm được, thẻ nổi chỉ ghi tên app + điểm nổi bật (không nhãn trạng thái — anh bỏ toàn dự án 17/11/2026).
  - Thứ tự: đang chạy → đang xây → kế hoạch (`sortApps`).
- **Line trang trí** (`TileLines.tsx`): mỗi ô app ở **hàng đầu** có một đường màu nhấn mọc từ dấu chấm cam của logo,
  uốn sang phía ngược rồi đáp thẳng xuống trên tên ô (các đường đan chéo nhau), chấm + quầng ở đích. App kế hoạch:
  đường mờ, không xung sáng.
  - **Xung sáng chỉ lóe, không chạy liên tục** (hiệu năng — trang mở cả ngày): mọi đường lóe một lần lúc vào trang, rồi
    mỗi 9 giây một đường (lần lượt), rê chuột vào ô app → đường của ô đó lóe. Tab ẩn hoặc **60 giây không thao tác** →
    ngừng lóe tới khi có thao tác lại. Số đo 17/11/2026 (Edge headless, bản build): chạy vòng lặp liên tục ~150 ms CPU/giây
    desktop, ~500 ms/giây điện thoại giả lập CPU chậm 4×; bản lóe ~25–50 / ~110–150 ms/giây khi đang dùng, để yên > 60 giây
    = như không có line (~5 / ~15 ms/giây). Ô hàng sau (điện thoại 3 cột, ô link riêng) không nối để đường không
  cắt ngang hàng trên. Hiện sau khi logo/ô trồi lên; giảm chuyển động → không vẽ dần, không xung sáng; ≤ 760px bỏ quầng
  sáng (nhẹ GPU).
  Cài đặt → Giao diện → Hiệu ứng line: Chậm (`data-lines="slow"` trên `.lc-main`, hệ số `--lc-line-k`) / Tắt (không vẽ).
- Cảm ứng: không vệt chạm/viền khi bấm, hiệu ứng rê chuột chỉ trên máy có chuột; viền focus chỉ khi dùng phím.
- Bên trái: **thanh thông số** — xem [thanh-thong-so.md](thanh-thong-so.md).
- Chân trang: "FoxGo® | Thong Duy".
- Màn hình:
  - ≥ 1080px: thanh thông số cố định bên trái (dải 64px, mở rộng 280px đè lên nội dung).
  - < 1080px: thanh thành ngăn kéo trượt từ trái + nền mờ, chỉ còn nút menu.
  - ≤ 520px: ô app xếp lưới 3 cột (đường kẻ theo 3 cột).
  - Thiết bị cảm ứng (`hover: none`): không hiện thẻ nổi.

## Quy tắc nghiệp vụ
- Tên trên ô: bỏ tiền tố "Fox." và tách chữ: "Fox.TàiChính" → "Tài Chính".
- Màu nhấn của app chỉ đi qua biến CSS `--app-accent` (gạch chân khi rê chuột, viền đầu mục thẻ nổi).

## Dữ liệu
| Dữ liệu | Lưu ở đâu | Khóa / đường dẫn | Ghi chú |
|---|---|---|---|
| Danh sách app | mã nguồn | `src/data/apps.ts` | xem [danh-sach-app.md](danh-sach-app.md) |

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/launcher/LauncherPage.tsx` | Trang: logo, ô app (`AppTile`), chân trang, trạng thái thu/mở thanh |
| `src/features/launcher/launcher.css` | Bố cục màn khóa, ô chữ + đường kẻ, thẻ nổi, responsive (tiền tố `.lc-`) |
| `src/features/launcher/TileLines.tsx` | Line trang trí logo → ô app (đo vị trí từ DOM, SVG + CSS `.lc-line*`) |
| `src/components/Wordmark.tsx` | Logo chữ "Fox." |
| `src/lib/apps.ts` (+ test) | `sortApps` |
| `src/app/Layout.tsx` | Chế độ `is-immersive` (ẩn thanh trên ở trang chủ) |

## Kiểm thử
- Tự động: `src/lib/apps.test.ts` (sắp xếp).
- Tay: ô app đang chạy mở đúng link; ô kế hoạch không bấm được; rê chuột hiện thẻ nổi; 375px không tràn ngang;
  ≥ 1080px thanh cố định, < 1080px ngăn kéo.

## Giới hạn & việc còn lại
- Chưa có lối tắt cá nhân, phím `/` tìm nhanh — FD-005.
- Chưa có widget số liệu tóm tắt từ app — FD-008 (cần PRD, sau FD-007 đăng nhập chung).

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 14/11/2026 | 0.1.0 | Bản đầu: lời chào, đồng hồ, tìm nhanh, lưới thẻ app |
| 15/11/2026 | chưa phát hành | Làm lại kiểu màn khóa, bỏ ô tìm & thẻ app cũ; đổi tên FoxGo |
| 15/11/2026 | chưa phát hành | Thanh thông số luôn thu nhỏ khi mở; ô Fox.CôngViệc bấm được (bản trên máy) |
| 16/11/2026 | chưa phát hành | Bỏ linh vật/khung kính ở ô app, ngăn cách bằng đường kẻ mảnh |
| 17/11/2026 | chưa phát hành | Line màu từ logo xuống ô app; sửa trạng thái nhấn nút menu trên điện thoại |
