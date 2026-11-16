# Giao diện sáng / tối

> Mã: `FD-002` · PRD: — · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Dễ nhìn ngày và đêm; mặc định theo hệ điều hành, người dùng chọn được và được nhớ.

## Cách dùng / hành vi
- Nút tròn ở thanh trên (trang Giới thiệu) xoay vòng: **Theo hệ thống → Sáng → Tối → Theo hệ thống**.
  Tooltip và `aria-label` nói chế độ hiện tại và chế độ kế tiếp.
- "Theo hệ thống": đổi theo cài đặt máy ngay khi máy đổi (không cần tải lại).
- Trang chủ không có thanh trên → đổi chế độ trong **Cài đặt → Giao diện** (Hệ thống / Sáng / Tối, áp dụng khi bấm Lưu).
- Trang chủ theo chế độ: tối = nền xanh đậm `--h-bg` kiểu màn khóa; sáng = nền trắng `#fff` + lưới ô vuông xanh nhạt mờ dần ra rìa, ô app là thẻ trắng có viền + bóng màu app.
  Màu trang chủ qua biến `--lc-*` trên `.fd-page.is-immersive` (global.css), ghi đè ở `[data-theme='light']`.
- Ô chọn thành phố và popup AntD đổi theo chế độ; khi tối, popup nền xanh đậm `#0c2724` (không xám mặc định).
- Không nháy màu khi mở trang: `index.html` đặt `data-theme` trước khi React chạy.

## Quy tắc nghiệp vụ
- Màu lấy từ token CSS trong `src/styles/global.css` theo `[data-theme]`; component không mã màu cứng.
- Màu chủ đạo AntD: sáng `#0f766e`, tối `#2dd4bf` (khớp `--accent-a`, `--accent-b`).

## Dữ liệu
| Dữ liệu | Lưu ở đâu | Khóa | Ghi chú |
|---|---|---|---|
| Chế độ | localStorage | `foxdots.theme` = `system` / `light` / `dark` | dùng ở **2 nơi**: `lib/theme.ts` và script `index.html` |

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/lib/theme.ts` (+ test) | `THEME_KEY`, `parseMode`, `resolveDark`, `nextMode`, `MODE_LABEL` |
| `src/app/themeStore.ts` | Đọc/ghi localStorage, hỏi hệ thống có đang tối |
| `src/app/Root.tsx` | Nghe hệ thống đổi, gắn `data-theme`, theme AntD |
| `src/app/Layout.tsx` | Nút đổi chế độ (trang Giới thiệu) |
| `src/features/launcher/SettingsModal.tsx` | Mục Giao diện trong Cài đặt (trang chủ) |
| `index.html` | Script đặt `data-theme` trước khi vẽ |
| `src/styles/global.css` | Token màu sáng/tối |

## Kiểm thử
- Tự động: `src/lib/theme.test.ts`.
- Tay: chọn Tối → tải lại vẫn Tối, không nháy trắng; chế độ "Theo hệ thống" + đổi cài đặt Windows → trang đổi theo.

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 14/11/2026 | 0.1.0 | Bản đầu |
| 16/11/2026 | chưa phát hành | Trang chủ có giao diện sáng nền trắng; tối giữ xanh đậm; popup AntD tối nền xanh; chọn chế độ trong Cài đặt |
