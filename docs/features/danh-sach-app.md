# Danh sách app

> Mã: `FD-002` · PRD: — · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Một nguồn duy nhất mô tả các app Fox (tên, trạng thái, link, linh vật, màu nhấn) để trang chủ và trang Giới thiệu cùng dùng.

## Cách dùng / hành vi
- Trang chủ: mỗi app một ô; trang Giới thiệu: lưới bento + quỹ đạo linh vật.
- Thứ tự hiển thị: đang chạy → đang xây → kế hoạch, giữ thứ tự khai báo trong cùng nhóm.

## Quy tắc nghiệp vụ
- **Chỉ link + mô tả chung**. Không đọc, không hiển thị số liệu cá nhân của app nào (cho tới FD-008 có PRD duyệt).
  Bundle web công khai.
- Mã 2 chữ khớp `../docs/MA_APP.md`. Màu nhấn chỉ dùng qua biến CSS `--app-accent`.
- App `planned` không có link → ô mờ.

## Dữ liệu
| Trường (`FoxApp`) | Ý nghĩa |
|---|---|
| `code` | Mã 2 chữ (FF, FW, FH, FL, FE, FS) |
| `name`, `area`, `tagline`, `desc` | Tên `Fox.<Tên>`, mảng cuộc sống, mô tả 2–3 từ, mô tả 1 câu |
| `mascot`, `fullBody` | SVG đầu / toàn thân trong `public/fox/` |
| `highlights` | Tính năng chính (thẻ nổi, bento) |
| `accent` | Màu nhấn |
| `status` | `live` · `building` · `planned` |
| `version`, `url`, `extra` | Phiên bản, link chính, link phụ (bản trên máy, Test) |
| `tags` | Từ khóa (không dấu) |

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/data/apps.ts` | Danh sách `APPS` |
| `src/lib/apps.ts` (+ test) | Kiểu `FoxApp`, `STATUS_LABEL`, `sortApps`, `normalize` |

## Kiểm thử
- Tự động: `src/lib/apps.test.ts`.
- Tay: thêm/đổi app → xem cả trang chủ và Giới thiệu.

Cách thêm app: [../BAO_TRI.md](../BAO_TRI.md).

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 14/11/2026 | 0.1.0 | Bản đầu (6 app) |
| 15/11/2026 | chưa phát hành | Thêm `tagline`, `fullBody`, `highlights`; bỏ hàm tìm/đếm không còn dùng |
| 15/11/2026 | chưa phát hành | Fox.CôngViệc chuyển "Đang xây" v0.1 (FW-000), tính năng chính theo bản thật |
| 15/11/2026 | chưa phát hành | Fox.CôngViệc có link chính tạm `http://localhost:5175` (bản trên máy) — ô trên trang chủ bấm được |
| 15/11/2026 | chưa phát hành | Fox.CôngViệc link chính đổi sang `https://foxgo-work.web.app` (bản nghiệm thu đã deploy) |
