# Điều hướng (hash route)

> Mã: `FD-002` · PRD: — · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Chuyển giữa Trang chủ và Giới thiệu mà không cần cấu hình server (chạy được trên Firebase Hosting / mọi hosting tĩnh).

## Cách dùng / hành vi
| Đường dẫn | Trang |
|---|---|
| `#/`, trống, hoặc lạ | Trang chủ |
| `#/gioi-thieu` | Giới thiệu, cuộn lên đầu |
| `#/gioi-thieu/<mục>` | Giới thiệu, cuộn tới phần tử `id="<mục>"` (VD mã app `ff`) |

- Không có thanh tab; vào Giới thiệu từ thanh thông số, về Trang chủ từ thanh trên.
- Đổi trang → cuộn lên đầu (hoặc tới mục), nội dung chạy lại hiệu ứng vào trang.

## Quy tắc nghiệp vụ
- Không phân biệt hoa/thường. Đường dẫn cũ (VD tab "Ứng dụng" đã bỏ) → trang chủ, không báo lỗi.

## Dữ liệu
Không lưu gì — trạng thái nằm trên thanh địa chỉ (`location.hash`).

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/lib/route.ts` (+ test) | `ROUTES`, `parseRoute`, `href` — hàm thuần |
| `src/app/useRoute.ts` | Hook nghe `hashchange`, cuộn trang |
| `src/app/Root.tsx` | Chọn trang theo `route.id` |
| `src/app/Layout.tsx` | Khung theo trang (`is-immersive` / `is-landing`) |

## Kiểm thử
- Tự động: `src/lib/route.test.ts` (trống, trang Giới thiệu, mục con, đường dẫn lạ, `href` khớp `parseRoute`).
- Tay: nút Back/Forward của trình duyệt đổi trang đúng.

Thêm trang mới: [../BAO_TRI.md](../BAO_TRI.md).

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 15/11/2026 | chưa phát hành | Bản đầu (2 trang, bỏ thanh tab) |
