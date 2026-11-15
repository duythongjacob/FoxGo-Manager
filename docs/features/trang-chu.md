# Trang chủ

> Mã: `FD-002` · PRD: — · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Trang mở đầu trình duyệt (ghim làm homepage): nhìn giờ/thời tiết/giá trong một giây và bấm vào app Fox cần dùng.
Tối giản theo màn khóa của Fox.TàiChính.

## Cách dùng / hành vi
- Đường dẫn `#/` (hoặc đường dẫn lạ). Toàn màn nền tối + lưới chấm, **không** có thanh trên.
- Giữa màn: logo chữ "Fox." lớn, dưới là các **ô app** dạng kính (linh vật + tên + mô tả 2–3 từ).
  - App đang chạy: bấm mở link chính (`url`), rê chuột hiện thẻ nổi 3 tính năng chính.
  - App kế hoạch: ô mờ viền đứt, không bấm được, thẻ nổi ghi "Sắp ra mắt".
  - Thứ tự: đang chạy → đang xây → kế hoạch (`sortApps`).
- Bên trái: **thanh thông số** — xem [thanh-thong-so.md](thanh-thong-so.md).
- Chân trang: "FoxGo® | Thong Duy".
- Màn hình:
  - ≥ 1080px: thanh thông số cố định bên trái (dải 64px, mở rộng 280px đè lên nội dung).
  - < 1080px: thanh thành ngăn kéo trượt từ trái + nền mờ, chỉ còn nút menu.
  - ≤ 520px: ô app xếp lưới 3 cột.
  - Thiết bị cảm ứng (`hover: none`): không hiện thẻ nổi.

## Quy tắc nghiệp vụ
- Tên trên ô: bỏ tiền tố "Fox." và tách chữ: "Fox.TàiChính" → "Tài Chính".
- Màu nhấn của app chỉ đi qua biến CSS `--app-accent` (viền/ánh sáng ô).

## Dữ liệu
| Dữ liệu | Lưu ở đâu | Khóa / đường dẫn | Ghi chú |
|---|---|---|---|
| Danh sách app | mã nguồn | `src/data/apps.ts` | xem [danh-sach-app.md](danh-sach-app.md) |
| Thu/mở thanh thông số | localStorage | `foxdots.dock` = `open` / `collapsed` | mặc định thu nhỏ |

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/launcher/LauncherPage.tsx` | Trang: logo, ô app (`AppTile`), chân trang, trạng thái thu/mở thanh |
| `src/features/launcher/launcher.css` | Bố cục màn khóa, ô kính, thẻ nổi, responsive (tiền tố `.lc-`) |
| `src/components/Wordmark.tsx` | Logo chữ "Fox." |
| `src/lib/apps.ts` (+ test) | `sortApps`, `STATUS_LABEL` |
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
